#!/usr/bin/env python3
"""
Portfolio data pipeline: FEMA NRI + Census TIGER -> counties.geojson
Run locally or via GitHub Actions (daily cron).
Falls back to synthetic data if FEMA download is unavailable.
"""
import io
import json
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
import requests
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

FEMA_NRI_URL = (
    "https://hazards.fema.gov/nri/Content/StaticDocuments/DataDownload/"
    "NRI_Table_Counties/NRI_Table_Counties.zip"
)
TIGER_URL = (
    "https://www2.census.gov/geo/tiger/GENZ2022/shp/"
    "cb_2022_us_county_20m.zip"
)

FEATURES = [
    "RISK_SCORE", "EAL_SCORE", "SOVI_SCORE", "RESL_SCORE",
    "HWAV_AFREQ", "TRND_AFREQ", "RFLD_AFREQ",
]

CLUSTER_NAMES = {
    0: "Low Risk / High Resilience",
    1: "Moderate Risk / Mixed",
    2: "High Risk / Low Resilience",
    3: "Rural / Low Exposure",
    4: "Coastal / Weather Exposed",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/zip,application/octet-stream,*/*",
}


def download_zip(url: str, extract_to: Path) -> bool:
    """Download and extract a zip. Returns True on success, False on failure."""
    print(f"Downloading {url} ...")
    try:
        resp = requests.get(url, headers=HEADERS, stream=True, timeout=300, allow_redirects=True)
        resp.raise_for_status()
        content = resp.content
        if not content[:4] == b"PK\x03\x04":
            print(f"  Warning: response from {url} is not a zip (got {len(content)} bytes, starts: {content[:80]!r})")
            return False
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            z.extractall(extract_to)
        return True
    except Exception as e:
        print(f"  Download failed: {e}")
        return False


def generate_sample_nri(n: int = 3143) -> pd.DataFrame:
    """Generate realistic synthetic NRI data for demo/fallback use."""
    print(f"  Generating synthetic NRI data for {n} counties (FEMA source unavailable)...")
    rng = np.random.default_rng(42)

    # Realistic US FIPS codes (approximate)
    state_counties = []
    for state in range(1, 57):
        if state in (3, 7, 14, 43, 52):
            continue
        n_counties = rng.integers(3, 80)
        for county in range(1, n_counties * 2, 2):
            state_counties.append((state, county))
    state_counties = state_counties[:n]

    rows = []
    for state_fp, county_fp in state_counties:
        fips = f"{state_fp:02d}{county_fp:03d}"
        # Correlated risk scores: coastal/southern states skew higher
        base_risk = rng.beta(1.5, 3.0) * 100
        rows.append({
            "FIPS": fips,
            "COUNTY": f"County {county_fp:03d}",
            "STATEABBRV": f"S{state_fp:02d}",
            "RISK_SCORE":  round(base_risk, 2),
            "EAL_SCORE":   round(base_risk * rng.uniform(0.6, 1.4), 2),
            "SOVI_SCORE":  round(rng.beta(2, 3) * 100, 2),
            "RESL_SCORE":  round(rng.beta(3, 2) * 100, 2),
            "HWAV_AFREQ":  round(rng.exponential(0.8), 3),
            "TRND_AFREQ":  round(rng.exponential(0.3), 3),
            "RFLD_AFREQ":  round(rng.exponential(1.2), 3),
        })
    return pd.DataFrame(rows)


def load_fema_nri() -> pd.DataFrame:
    nri_dir = DATA_DIR / "_nri_raw"
    if not any(nri_dir.glob("*.csv")):
        nri_dir.mkdir(exist_ok=True)
        success = download_zip(FEMA_NRI_URL, nri_dir)
        if not success:
            return generate_sample_nri()
    csv_files = list(nri_dir.glob("NRI_Table_Counties*.csv"))
    if not csv_files:
        return generate_sample_nri()
    print(f"  Loading FEMA NRI from {csv_files[0].name}")
    df = pd.read_csv(csv_files[0], dtype={"STCOFIPS": str}, low_memory=False)
    df["FIPS"] = df["STCOFIPS"].str.zfill(5)
    cols = ["FIPS", "COUNTY", "STATEABBRV"] + FEATURES
    return df[[c for c in cols if c in df.columns]].copy()


def load_tiger() -> gpd.GeoDataFrame:
    tiger_dir = DATA_DIR / "_tiger_raw"
    if not any(tiger_dir.glob("*.shp")):
        tiger_dir.mkdir(exist_ok=True)
        success = download_zip(TIGER_URL, tiger_dir)
        if not success:
            raise RuntimeError("Census TIGER download failed — cannot build GeoJSON without county geometries.")
    shp_files = list(tiger_dir.glob("*.shp"))
    if not shp_files:
        raise FileNotFoundError(f"No shapefile in {tiger_dir}")
    print(f"  Loading TIGER shapefile: {shp_files[0].name}")
    gdf = gpd.read_file(shp_files[0])
    gdf["FIPS"] = (gdf["STATEFP"] + gdf["COUNTYFP"]).str.zfill(5)
    return gdf[["FIPS", "geometry"]].to_crs("EPSG:4326")


def cluster_counties(df: pd.DataFrame, k: int = 5) -> pd.DataFrame:
    feat_df = df[FEATURES].copy()
    feat_df = feat_df.apply(pd.to_numeric, errors="coerce")
    feat_df = feat_df.fillna(feat_df.median())
    scaler = StandardScaler()
    X = scaler.fit_transform(feat_df)
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    df = df.copy()
    df["_cluster_raw"] = km.fit_predict(X)
    # Rank clusters 0-4 by ascending mean risk score for deterministic labels
    means = df.groupby("_cluster_raw")["RISK_SCORE"].mean().sort_values()
    rank_map = {old: new for new, old in enumerate(means.index)}
    df["cluster_id"] = df["_cluster_raw"].map(rank_map)
    df["cluster_label"] = df["cluster_id"].map(CLUSTER_NAMES)
    return df.drop(columns=["_cluster_raw"])


def build_geojson(gdf: gpd.GeoDataFrame) -> dict:
    features = []
    for _, row in gdf.iterrows():
        if row.geometry is None or row.geometry.is_empty:
            continue
        def safe_float(col):
            v = row.get(col)
            return round(float(v), 2) if pd.notna(v) else None

        props = {
            "name":          str(row.get("COUNTY", "")),
            "state":         str(row.get("STATEABBRV", "")),
            "fips":          str(row["FIPS"]),
            "risk_score":    safe_float("RISK_SCORE"),
            "eal_score":     safe_float("EAL_SCORE"),
            "sovi_score":    safe_float("SOVI_SCORE"),
            "resl_score":    safe_float("RESL_SCORE"),
            "cluster_id":    int(row["cluster_id"]) if pd.notna(row.get("cluster_id")) else 0,
            "cluster_label": str(row.get("cluster_label", "") or ""),
        }
        features.append({
            "type": "Feature",
            "geometry": row.geometry.__geo_interface__,
            "properties": props,
        })
    return {"type": "FeatureCollection", "features": features}


def main() -> None:
    print("=== Spatial ML Pipeline ===")
    print("Step 1/3: Loading FEMA NRI county risk data...")
    nri = load_fema_nri()
    print(f"  {len(nri)} counties loaded")

    print("Step 2/3: Loading Census TIGER county geometries...")
    tigers = load_tiger()
    print(f"  {len(tigers)} geometries loaded")

    print("Step 3/3: Running K-Means clustering (k=5) and building GeoJSON...")
    nri = cluster_counties(nri)
    merged = tigers.merge(nri, on="FIPS", how="left")
    geojson = build_geojson(merged)

    out = DATA_DIR / "counties.geojson"
    with open(out, "w") as f:
        json.dump(geojson, f, separators=(",", ":"))
    print(f"  Wrote {len(geojson['features'])} features -> {out}")

    status = {
        "last_run":         datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "feature_count":    len(geojson["features"]),
        "pipeline_version": "1.0",
    }
    with open(DATA_DIR / "pipeline-status.json", "w") as f:
        json.dump(status, f, indent=2)
    print(f"  Status: {status['last_run']}")
    print("=== Done ===")


if __name__ == "__main__":
    main()
