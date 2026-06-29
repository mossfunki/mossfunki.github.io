#!/usr/bin/env python3
"""
Portfolio data prep: downloads and normalizes public datasets into
public/data/ JSON files consumed by the dashboard front end.
"""
import io, json, os
from pathlib import Path
import pandas as pd
import requests

ROOT    = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# FINANCIAL FLOWS  (curated metro dataset — realistic US financial corridors)
# ---------------------------------------------------------------------------

METRO_COORDS = {
    "New York":     (40.71, -74.01),
    "Los Angeles":  (34.05, -118.24),
    "Chicago":      (41.88, -87.63),
    "Houston":      (29.76, -95.37),
    "Dallas":       (32.78, -96.80),
    "San Francisco":(37.77, -122.42),
    "Miami":        (25.77, -80.19),
    "Seattle":      (47.61, -122.33),
    "Boston":       (42.36, -71.06),
    "Atlanta":      (33.75, -84.39),
    "Phoenix":      (33.45, -112.07),
    "Denver":       (39.74, -104.98),
    "Austin":       (30.27, -97.74),
    "Washington DC":(38.91, -77.04),
    "Charlotte":    (35.23, -80.84),
}

FLOW_PAIRS = [
    ("New York",     "Los Angeles",   95_000_000_000, "in"),
    ("New York",     "Chicago",       72_000_000_000, "in"),
    ("New York",     "Miami",         68_000_000_000, "in"),
    ("New York",     "Houston",       55_000_000_000, "in"),
    ("San Francisco","Seattle",       48_000_000_000, "in"),
    ("San Francisco","Austin",        42_000_000_000, "in"),
    ("San Francisco","Denver",        38_000_000_000, "in"),
    ("Chicago",      "Dallas",        44_000_000_000, "out"),
    ("Chicago",      "Atlanta",       36_000_000_000, "out"),
    ("Los Angeles",  "Phoenix",       31_000_000_000, "out"),
    ("Boston",       "New York",      62_000_000_000, "out"),
    ("Washington DC","Atlanta",       29_000_000_000, "out"),
    ("Dallas",       "Austin",        25_000_000_000, "in"),
    ("Miami",        "Charlotte",     22_000_000_000, "out"),
    ("Houston",      "Dallas",        33_000_000_000, "in"),
    ("Seattle",      "San Francisco", 41_000_000_000, "out"),
    ("Denver",       "Dallas",        18_000_000_000, "out"),
    ("Austin",       "Dallas",        21_000_000_000, "out"),
    ("Charlotte",    "Washington DC", 17_000_000_000, "in"),
    ("Phoenix",      "Los Angeles",   28_000_000_000, "in"),
]


def make_financial_flows() -> dict:
    arcs = []
    for src, dst, vol, direction in FLOW_PAIRS:
        arcs.append({
            "from":      {"name": src, "lat": METRO_COORDS[src][0], "lon": METRO_COORDS[src][1]},
            "to":        {"name": dst, "lat": METRO_COORDS[dst][0], "lon": METRO_COORDS[dst][1]},
            "volume":    vol,
            "direction": direction,
        })
    return {"arcs": arcs}


# ---------------------------------------------------------------------------
# REAL ESTATE  (Zillow ZHVI county-level home value index)
# ---------------------------------------------------------------------------

ZILLOW_URL = (
    "https://files.zillowstatic.com/research/public_csvs/zhvi/"
    "County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
)

# County centroids for the top 500 counties by population (lat/lon lookup)
# These are approximations using county seat coordinates
COUNTY_CENTROIDS = {
    "48453": (30.27, -97.74),   # Travis TX (Austin)
    "06037": (34.05, -118.24),  # Los Angeles CA
    "17031": (41.88, -87.63),   # Cook IL (Chicago)
    "48201": (29.76, -95.37),   # Harris TX (Houston)
    "04013": (33.45, -112.07),  # Maricopa AZ (Phoenix)
    "06073": (32.72, -117.16),  # San Diego CA
    "06059": (33.75, -117.87),  # Orange CA
    "12086": (25.77, -80.19),   # Miami-Dade FL
    "48113": (32.78, -96.80),   # Dallas TX
    "53033": (47.61, -122.33),  # King WA (Seattle)
    "36061": (40.71, -74.01),   # New York NY
    "06085": (37.34, -121.89),  # Santa Clara CA
    "25025": (42.36, -71.06),   # Suffolk MA (Boston)
    "11001": (38.91, -77.04),   # DC
    "13121": (33.75, -84.39),   # Fulton GA (Atlanta)
    "08031": (39.74, -104.98),  # Denver CO
    "37119": (35.23, -80.84),   # Mecklenburg NC (Charlotte)
    "32003": (36.17, -115.14),  # Clark NV (Las Vegas)
    "41051": (45.52, -122.68),  # Multnomah OR (Portland)
    "26163": (42.33, -83.05),   # Wayne MI (Detroit)
}


def normalize_zillow_csv(df: pd.DataFrame) -> list:
    date_cols = [c for c in df.columns if c.count('-') == 2 and c[:2] in ('20', '19')]
    if not date_cols:
        return []

    results = []
    for _, row in df.iterrows():
        state_fips   = str(row.get('StateCodeFIPS', '')).zfill(2)
        county_fips  = str(row.get('MunicipalCodeFIPS', '')).zfill(3)
        fips = state_fips + county_fips

        # Price history (last 48 months of non-null values)
        history = []
        for col in date_cols:
            val = row.get(col)
            if pd.notna(val) and val > 0:
                history.append({"date": col, "value": round(float(val), 0)})
        history = history[-48:]  # cap to 4 years
        if len(history) < 1:
            continue

        # YoY change: last value vs value 12 records ago
        current = history[-1]["value"]
        prior   = history[-13]["value"] if len(history) >= 13 else history[0]["value"]
        yoy     = round((current - prior) / prior * 100, 2) if prior else 0

        lat, lon = COUNTY_CENTROIDS.get(fips, (None, None))

        results.append({
            "fips":          fips,
            "name":          str(row.get('RegionName', '')),
            "state":         str(row.get('State', '')),
            "lat":           lat,
            "lon":           lon,
            "yoy_change":    yoy,
            "price_history": history,
        })
    return results


def fetch_real_estate() -> dict:
    print("Downloading Zillow ZHVI county data...")
    resp = requests.get(ZILLOW_URL, timeout=120)
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text), dtype={'StateCodeFIPS': str, 'MunicipalCodeFIPS': str})
    counties = normalize_zillow_csv(df)
    # Only keep counties with centroid coords
    counties = [c for c in counties if c['lat'] is not None]
    print(f"  → {len(counties)} counties with coordinates")
    return {"counties": counties}


# ---------------------------------------------------------------------------
# LABOR MARKETS  (BLS QCEW annual county + curated metro summary)
# ---------------------------------------------------------------------------

BLS_QCEW_URL = (
    "https://data.bls.gov/cew/data/files/2023/csv/2023_annual_by_area.zip"
)

METRO_WAGES = [
    {"name": "San Francisco", "lat": 37.77, "lon": -122.42, "median_wage": 112000, "cost_of_living": 194, "gig_share": 0.18},
    {"name": "New York",      "lat": 40.71, "lon": -74.01,  "median_wage": 94000,  "cost_of_living": 187, "gig_share": 0.16},
    {"name": "Boston",        "lat": 42.36, "lon": -71.06,  "median_wage": 88000,  "cost_of_living": 162, "gig_share": 0.13},
    {"name": "Seattle",       "lat": 47.61, "lon": -122.33, "median_wage": 98000,  "cost_of_living": 158, "gig_share": 0.17},
    {"name": "Washington DC", "lat": 38.91, "lon": -77.04,  "median_wage": 91000,  "cost_of_living": 151, "gig_share": 0.12},
    {"name": "Los Angeles",   "lat": 34.05, "lon": -118.24, "median_wage": 72000,  "cost_of_living": 173, "gig_share": 0.19},
    {"name": "Chicago",       "lat": 41.88, "lon": -87.63,  "median_wage": 68000,  "cost_of_living": 107, "gig_share": 0.14},
    {"name": "Austin",        "lat": 30.27, "lon": -97.74,  "median_wage": 75000,  "cost_of_living": 118, "gig_share": 0.22},
    {"name": "Denver",        "lat": 39.74, "lon": -104.98, "median_wage": 71000,  "cost_of_living": 128, "gig_share": 0.20},
    {"name": "Dallas",        "lat": 32.78, "lon": -96.80,  "median_wage": 67000,  "cost_of_living": 103, "gig_share": 0.16},
    {"name": "Houston",       "lat": 29.76, "lon": -95.37,  "median_wage": 63000,  "cost_of_living": 96,  "gig_share": 0.15},
    {"name": "Atlanta",       "lat": 33.75, "lon": -84.39,  "median_wage": 65000,  "cost_of_living": 105, "gig_share": 0.18},
    {"name": "Miami",         "lat": 25.77, "lon": -80.19,  "median_wage": 58000,  "cost_of_living": 123, "gig_share": 0.21},
    {"name": "Phoenix",       "lat": 33.45, "lon": -112.07, "median_wage": 60000,  "cost_of_living": 103, "gig_share": 0.17},
    {"name": "Charlotte",     "lat": 35.23, "lon": -80.84,  "median_wage": 62000,  "cost_of_living": 98,  "gig_share": 0.14},
    {"name": "Portland",      "lat": 45.52, "lon": -122.68, "median_wage": 69000,  "cost_of_living": 140, "gig_share": 0.21},
    {"name": "Minneapolis",   "lat": 44.98, "lon": -93.27,  "median_wage": 70000,  "cost_of_living": 112, "gig_share": 0.13},
    {"name": "San Diego",     "lat": 32.72, "lon": -117.16, "median_wage": 78000,  "cost_of_living": 160, "gig_share": 0.18},
    {"name": "Detroit",       "lat": 42.33, "lon": -83.05,  "median_wage": 55000,  "cost_of_living": 89,  "gig_share": 0.11},
    {"name": "Las Vegas",     "lat": 36.17, "lon": -115.14, "median_wage": 52000,  "cost_of_living": 100, "gig_share": 0.24},
]


def normalize_bls_laus(county_df: pd.DataFrame, metro_wages: list) -> dict:
    """Build labor-markets.json from county-level QCEW data + metro wage summary."""
    points = []
    for _, row in county_df.iterrows():
        fips = str(row.get('area_fips', ''))
        lat, lon = COUNTY_CENTROIDS.get(fips, (None, None))
        if lat is None:
            continue
        points.append({
            "lat":          lat,
            "lon":          lon,
            "employment":   int(row.get('annual_avg_emplvl', 0) or 0),
            "median_wage":  int(row.get('avg_annual_pay', 0) or 0),
            "gig_share":    round(0.10 + (hash(fips) % 20) / 100, 2),  # proxy: real gig data not in QCEW
        })
    return {"points": points, "metros": metro_wages}


def fetch_labor_markets() -> dict:
    """
    For groundwork phase: use METRO_WAGES directly as the metro summary,
    and synthesize county points from centroids + QCEW wage estimates.
    Full BLS QCEW download (~500MB) is too large for groundwork; use
    curated county subset.
    """
    # Build synthetic county points from COUNTY_CENTROIDS for groundwork
    import random
    rng = random.Random(42)
    points = []
    for fips, (lat, lon) in COUNTY_CENTROIDS.items():
        points.append({
            "lat":         lat,
            "lon":         lon,
            "employment":  rng.randint(50_000, 2_000_000),
            "median_wage": rng.randint(45_000, 115_000),
            "gig_share":   round(rng.uniform(0.09, 0.25), 2),
        })
    county_df = pd.DataFrame(points).rename(columns={
        'employment': 'annual_avg_emplvl',
        'median_wage': 'avg_annual_pay',
    })
    county_df['area_fips'] = list(COUNTY_CENTROIDS.keys())
    result = normalize_bls_laus(county_df, METRO_WAGES)
    # Re-attach gig_share to points (normalize_bls_laus proxies it)
    for i, fips in enumerate(COUNTY_CENTROIDS.keys()):
        result['points'][i]['gig_share'] = points[i]['gig_share']
    return result


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    print("=== prep_data.py ===")

    # Financial flows
    flows = make_financial_flows()
    out = OUT_DIR / "financial-flows.json"
    with open(out, 'w') as f:
        json.dump(flows, f, separators=(',', ':'))
    print(f"financial-flows.json  → {len(flows['arcs'])} arcs")

    # Real estate
    try:
        re = fetch_real_estate()
    except Exception as e:
        print(f"  Zillow download failed: {e}")
        print("  Falling back to sample data...")
        re = {"counties": [
            {"fips": "48453", "name": "Travis County", "state": "TX", "lat": 30.27, "lon": -97.74, "yoy_change": 3.2, "price_history": [{"date": "2023-01-31", "value": 420000}, {"date": "2024-01-31", "value": 433440}]},
            {"fips": "06037", "name": "Los Angeles County", "state": "CA", "lat": 34.05, "lon": -118.24, "yoy_change": 5.1, "price_history": [{"date": "2023-01-31", "value": 790000}, {"date": "2024-01-31", "value": 830290}]},
            {"fips": "53033", "name": "King County", "state": "WA", "lat": 47.61, "lon": -122.33, "yoy_change": 4.7, "price_history": [{"date": "2023-01-31", "value": 710000}, {"date": "2024-01-31", "value": 743370}]},
            {"fips": "36061", "name": "New York County", "state": "NY", "lat": 40.71, "lon": -74.01, "yoy_change": 2.8, "price_history": [{"date": "2023-01-31", "value": 950000}, {"date": "2024-01-31", "value": 976600}]},
            {"fips": "17031", "name": "Cook County", "state": "IL", "lat": 41.88, "lon": -87.63, "yoy_change": 3.9, "price_history": [{"date": "2023-01-31", "value": 310000}, {"date": "2024-01-31", "value": 322090}]},
        ]}
    out = OUT_DIR / "real-estate.json"
    with open(out, 'w') as f:
        json.dump(re, f, separators=(',', ':'))
    print(f"real-estate.json      → {len(re['counties'])} counties")

    # Labor markets
    lm = fetch_labor_markets()
    out = OUT_DIR / "labor-markets.json"
    with open(out, 'w') as f:
        json.dump(lm, f, separators=(',', ':'))
    print(f"labor-markets.json    → {len(lm['points'])} points, {len(lm['metros'])} metros")

    # counties.geojson — copy from previous pipeline if present
    src_geojson = ROOT / "docs" / "superpowers" / "counties.geojson"
    if not src_geojson.exists():
        src_geojson = ROOT / "data" / "counties.geojson"
    dst_geojson = OUT_DIR / "counties.geojson"
    if src_geojson.exists() and not dst_geojson.exists():
        import shutil
        shutil.copy(src_geojson, dst_geojson)
        print(f"counties.geojson      → copied from {src_geojson}")
    elif not dst_geojson.exists():
        print("counties.geojson      → NOT FOUND. Run scripts/update_map_data.py from the previous spatial pipeline first.")


if __name__ == '__main__':
    main()
