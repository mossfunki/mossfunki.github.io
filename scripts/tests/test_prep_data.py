import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import io
import pytest
import pandas as pd
from prep_data import normalize_zillow_csv, make_financial_flows, normalize_bls_laus


def test_normalize_zillow_csv_basic_schema():
    """Output list has required fields per county."""
    df = pd.DataFrame({
        'RegionName': ['Travis County', 'King County'],
        'State':      ['TX', 'WA'],
        'StateCodeFIPS': ['48', '53'],
        'MunicipalCodeFIPS': ['453', '033'],
        '2020-01-31': [250000, 400000],
        '2023-01-31': [310000, 480000],
        '2024-01-31': [320000, 470000],
    })
    result = normalize_zillow_csv(df)
    assert len(result) == 2
    county = result[0]
    assert 'fips' in county
    assert 'name' in county
    assert 'state' in county
    assert 'yoy_change' in county
    assert 'price_history' in county
    assert isinstance(county['price_history'], list)
    assert county['price_history'][0].keys() >= {'date', 'value'}


def test_normalize_zillow_csv_yoy_change_computed():
    df = pd.DataFrame({
        'RegionName': ['Travis County'],
        'State':      ['TX'],
        'StateCodeFIPS': ['48'],
        'MunicipalCodeFIPS': ['453'],
        '2023-01-31': [300000],
        '2024-01-31': [315000],
    })
    result = normalize_zillow_csv(df)
    assert abs(result[0]['yoy_change'] - 5.0) < 0.1


def test_normalize_zillow_csv_fips_is_5_digits():
    df = pd.DataFrame({
        'RegionName': ['A County'],
        'State':      ['TX'],
        'StateCodeFIPS': ['48'],
        'MunicipalCodeFIPS': ['1'],
        '2024-01-31': [200000],
    })
    result = normalize_zillow_csv(df)
    assert result[0]['fips'] == '48001'


def test_make_financial_flows_schema():
    result = make_financial_flows()
    assert 'arcs' in result
    assert len(result['arcs']) > 0
    arc = result['arcs'][0]
    assert 'from' in arc and 'to' in arc
    assert 'lat' in arc['from'] and 'lon' in arc['from']
    assert 'volume' in arc
    assert arc['direction'] in ('in', 'out')


def test_normalize_bls_laus_schema():
    county_df = pd.DataFrame({
        'area_fips':      ['48453', '53033'],
        'avg_annual_pay': [65000, 85000],
        'annual_avg_emplvl': [500000, 800000],
    })
    metro_wages = [
        {'name': 'Austin', 'lat': 30.3, 'lon': -97.7, 'median_wage': 68000, 'cost_of_living': 105, 'gig_share': 0.12},
    ]
    result = normalize_bls_laus(county_df, metro_wages)
    assert 'points' in result
    assert 'metros' in result
    pt = result['points'][0]
    assert 'lat' in pt and 'lon' in pt
    assert 'employment' in pt
    assert 'median_wage' in pt
    assert 'gig_share' in pt
