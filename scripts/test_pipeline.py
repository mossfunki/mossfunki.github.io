import json
from pathlib import Path
import pandas as pd
import pytest
from update_map_data import cluster_counties, build_geojson, FEATURES


def make_sample_df(n=20):
    import numpy as np
    rng = np.random.default_rng(0)
    data = {"FIPS": [str(i).zfill(5) for i in range(n)],
            "COUNTY": [f"County{i}" for i in range(n)],
            "STATEABBRV": ["TX"] * n}
    for f in FEATURES:
        data[f] = rng.uniform(0, 100, n).tolist()
    return pd.DataFrame(data)


def test_cluster_counties_adds_columns():
    df = make_sample_df(25)
    result = cluster_counties(df, k=5)
    assert "cluster_id" in result.columns
    assert "cluster_label" in result.columns
    assert set(result["cluster_id"].unique()).issubset({0, 1, 2, 3, 4})


def test_cluster_counties_no_missing_labels():
    df = make_sample_df(25)
    result = cluster_counties(df, k=5)
    assert result["cluster_label"].notna().all()
    assert (result["cluster_label"] != "").all()


def test_build_geojson_structure():
    from shapely.geometry import shape
    import geopandas as gpd
    from shapely.geometry import box

    df = make_sample_df(5)
    df = cluster_counties(df, k=5)
    geoms = [box(i, i, i+1, i+1) for i in range(5)]
    gdf = gpd.GeoDataFrame(df, geometry=geoms, crs="EPSG:4326")
    result = build_geojson(gdf)

    assert result["type"] == "FeatureCollection"
    assert len(result["features"]) == 5
    feat = result["features"][0]
    assert feat["type"] == "Feature"
    assert "risk_score" in feat["properties"]
    assert "cluster_id" in feat["properties"]
    assert "cluster_label" in feat["properties"]
    assert "fips" in feat["properties"]


def test_build_geojson_skips_null_geometry():
    import geopandas as gpd
    from shapely.geometry import box

    df = make_sample_df(3)
    df = cluster_counties(df, k=3)
    geoms = [box(0, 0, 1, 1), None, box(2, 2, 3, 3)]
    gdf = gpd.GeoDataFrame(df, geometry=geoms, crs="EPSG:4326")
    result = build_geojson(gdf)
    assert len(result["features"]) == 2
