# Portfolio Spatial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign mossfunki.github.io to a light minimal aesthetic and add a live satellite map driven by a Python/GitHub Actions pipeline (FEMA NRI + Census TIGER → K-Means → GeoJSON → Leaflet.js), a pipeline status panel, and a new `spatial.html` page — targeting Economics / Data Science / GIS / CI roles.

**Architecture:** Static HTML/CSS on GitHub Pages. Python script fetches FEMA NRI + Census TIGER data, runs K-Means clustering, writes `data/counties.geojson` and `data/pipeline-status.json` to the repo. GitHub Actions runs this daily. Leaflet.js loads the GeoJSON as a static asset. No backend, no API keys required.

**Tech Stack:** HTML5, CSS3, Leaflet.js (CDN), Python 3.11 (geopandas, pandas, scikit-learn, requests), GitHub Actions

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `style.css` | Replace | New light minimal CSS design system |
| `index.html` | Modify | Hero, map section, pipeline panel, expertise cards, nav |
| `spatial.html` | Create | Pipeline architecture, spatial ML methods, dataset table |
| `intelligence.html` | Modify | CSS variable aliases only — no content changes |
| `projects.html` | Modify | New spatial/economics filter buttons + tag updates |
| `about.html` | Modify | New bio, updated skills |
| `scripts/update_map_data.py` | Create | Python data pipeline |
| `scripts/requirements.txt` | Create | Python dependencies |
| `scripts/test_pipeline.py` | Create | Pipeline unit tests |
| `.github/workflows/update-map-data.yml` | Create | GitHub Actions daily cron |
| `data/counties.geojson` | Generate | K-Means clustered county data (via pipeline run) |
| `data/pipeline-status.json` | Generate | Pipeline metadata (via pipeline run) |

---

## Setup

### Task 0: Clone repo and verify structure

- [ ] **Step 1: Clone the live repo**

```bash
git clone https://github.com/mossfunki/mossfunki.github.io.git /tmp/portfolio-redesign
cd /tmp/portfolio-redesign
```

- [ ] **Step 2: Verify file structure**

```bash
ls /tmp/portfolio-redesign
```

Expected: `index.html`, `about.html`, `projects.html`, `intelligence.html`, `style.css`, `Ben-Resume.pdf`

- [ ] **Step 3: Create required directories**

```bash
mkdir -p /tmp/portfolio-redesign/data
mkdir -p /tmp/portfolio-redesign/scripts
mkdir -p /tmp/portfolio-redesign/.github/workflows
```

- [ ] **Step 4: Open current site in browser**

```bash
open /tmp/portfolio-redesign/index.html
```

Confirm site loads with current dark theme. This is the baseline.

---

## Task 1: Replace style.css with light minimal design system

**Files:**
- Replace: `/tmp/portfolio-redesign/style.css`

- [ ] **Step 1: Write new style.css**

Replace the entire contents of `style.css` with:

```css
/* ===========================
   Light Minimal Design System
   =========================== */

:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --accent: #2563eb;
  --success: #15803d;
  --danger: #dc2626;
  --warning: #d97706;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
  --font-serif: 'Merriweather', Georgia, serif;
  /* Compatibility aliases for intelligence.html inline styles */
  --panel: var(--surface);
  --accent-2: var(--accent);
  --muted: var(--text-secondary);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* NAV */
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
}
.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}
.nav-brand { font-weight: 700; font-size: 0.95rem; color: var(--text); }
nav ul { list-style: none; display: flex; align-items: center; gap: 1.75rem; }
nav ul li a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.15s;
}
nav ul li a:hover { color: var(--text); }
nav ul li a.nav-active { color: var(--text); font-weight: 600; }
nav ul li:last-child a {
  background: var(--text);
  color: #fff;
  padding: 0.35rem 0.85rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}
nav ul li:last-child a:hover { background: #374151; color: #fff; }

/* BUTTONS */
.btn-row { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1.2rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
  border: 1px solid transparent;
}
.btn-primary { background: var(--text); color: #fff; }
.btn-primary:hover { background: #374151; }
.btn-secondary { background: transparent; border-color: var(--border); color: var(--text-secondary); }
.btn-secondary:hover { border-color: #d1d5db; color: var(--text); background: var(--surface); }

/* HERO */
.hero { padding: 6rem 1.25rem 4rem; max-width: 1100px; margin: 0 auto; }
.hero-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.hero-title {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--text);
  margin-bottom: 1.25rem;
}
.hero-subtitle {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 62ch;
  margin-bottom: 1.75rem;
}
.hero-tools {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}
.hero-tools-sep { color: var(--border); }

/* SECTIONS */
.section { padding: 5rem 1.25rem; max-width: 1100px; margin: 0 auto; }
.section--alt {
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 5rem 1.25rem;
}
.section--alt > * { max-width: 1100px; margin-left: auto; margin-right: auto; }
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.section-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}
.section-title { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }
.section-subtitle { font-size: 0.85rem; color: var(--text-secondary); font-family: var(--font-mono); }

/* MAP SECTION */
.map-section {
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 3rem 1.25rem;
}
.map-section-inner { max-width: 1100px; margin: 0 auto; }
.map-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.layer-toggles { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.layer-toggle {
  padding: 0.3rem 0.75rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  background: transparent;
  transition: opacity 0.15s;
}
.layer-toggle.active { opacity: 1; }
.layer-toggle.inactive { opacity: 0.35; }
.layer-toggle--risk { color: var(--danger); border-color: #fecaca; }
.layer-toggle--clusters { color: var(--accent); border-color: #bfdbfe; }
#map { height: 480px; width: 100%; border-radius: 4px; border: 1px solid var(--border); }

/* PIPELINE PANEL */
.pipeline-panel {
  margin-top: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  padding: 1rem 1.25rem;
}
.pipeline-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--success);
  font-weight: 600;
  margin-bottom: 0.6rem;
}
.pipeline-stages {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}
.pipeline-stage {
  background: var(--surface);
  border: 1px solid #dcfce7;
  border-radius: 3px;
  padding: 0.5rem 0.75rem;
}
.pipeline-stage-name {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}
.pipeline-stage-status { font-size: 0.78rem; font-weight: 600; color: var(--success); }
.pipeline-stage-meta { font-family: var(--font-mono); font-size: 0.62rem; color: var(--text-muted); margin-top: 0.15rem; }
.pipeline-footer { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); text-align: right; }
.pipeline-footer a { color: var(--accent); text-decoration: none; }

/* EXPERTISE CARDS */
.expertise-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
.expertise-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.75rem;
  transition: border-color 0.15s;
}
.expertise-card:hover { border-color: #d1d5db; }
.expertise-number { font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.75rem; }
.expertise-card h3 { font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
.expertise-card p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; }

/* FEATURED / CONTENT GRID */
.content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; align-items: start; }
.proj-title { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text); margin-bottom: 1rem; }
.project-bullets { padding-left: 1.2rem; margin: 1rem 0 1.5rem; }
.project-bullets li { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 0.35rem; }
.highlight-box { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 1.5rem; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.75; }

/* EXPERIENCE */
.exp-list { display: flex; flex-direction: column; gap: 2.5rem; }
.exp-item {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
}
.exp-item:last-child { border-bottom: none; padding-bottom: 0; }
.exp-company { font-size: 0.875rem; font-weight: 700; color: var(--text); margin-bottom: 0.2rem; }
.exp-date { font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); }
.exp-role { font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
.exp-bullets { padding-left: 1.2rem; margin-top: 0.5rem; }
.exp-bullets li { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 0.4rem; }

/* PROJECTS */
.filter-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
.filter-btn {
  padding: 0.35rem 0.85rem;
  border-radius: 3px;
  font-size: 0.78rem;
  font-family: var(--font-mono);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.15s;
}
.filter-btn:hover, .filter-btn.active { background: var(--text); color: #fff; border-color: var(--text); }
.proj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
.proj-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 1.5rem; transition: border-color 0.15s; }
.proj-card:hover { border-color: #d1d5db; }
.proj-card h3 { font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 0.6rem; line-height: 1.4; }
.proj-card p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 0.75rem; }
.proj-tag { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }
.proj-actions { margin-top: 1rem; display: flex; gap: 0.5rem; }
.proj-actions a { font-size: 0.78rem; font-weight: 600; text-decoration: none; padding: 0.3rem 0.75rem; border-radius: 3px; border: 1px solid var(--border); color: var(--text-secondary); transition: all 0.15s; }
.proj-actions a.primary { background: var(--text); color: #fff; border-color: var(--text); }
.proj-actions a:hover { border-color: #d1d5db; color: var(--text); }
.proj-actions a.primary:hover { background: #374151; }

/* PAGE HEADER (about, intelligence, projects, spatial) */
.page-header { padding: 5.5rem 1.25rem 3rem; max-width: 1100px; margin: 0 auto; }
.page-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; letter-spacing: -0.03em; color: var(--text); margin-bottom: 0.75rem; }
.page-subtitle { font-size: 1.05rem; color: var(--text-secondary); line-height: 1.7; max-width: 60ch; }

/* SPATIAL PAGE */
.pipeline-flow { display: flex; align-items: center; flex-wrap: wrap; gap: 0; margin: 1.5rem 0; }
.flow-step { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 0.75rem 1rem; }
.flow-step-label { font-family: var(--font-mono); font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.2rem; }
.flow-step-content { font-weight: 600; color: var(--text); font-size: 0.78rem; }
.flow-arrow { color: var(--text-muted); padding: 0 0.6rem; font-size: 1.1rem; }
.method-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 1.5rem; margin-bottom: 1rem; }
.method-card h4 { font-size: 0.875rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
.method-card p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; }

/* INTELLIGENCE PAGE — inline style compatibility */
.intel-wrapper { max-width: 860px; margin: 0 auto; padding: 6rem 1.25rem 4rem; }
.case-study { border: 1px solid var(--border); background: var(--surface); padding: 2rem; margin-top: 2.5rem; }
.case-study h3 { font-family: var(--font-serif); color: var(--accent); font-size: 1.2rem; margin-bottom: 1rem; }
.case-meta { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.case-meta-item { font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.05em; color: var(--text-secondary); }
.case-meta-item strong { color: var(--text); display: block; margin-bottom: 0.2rem; }
.case-section { margin-top: 1.5rem; }
.case-section h4 { font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.6rem; }
.case-section p, .case-section li { color: var(--text-secondary); font-size: 0.93rem; line-height: 1.75; }
.case-section ul { padding-left: 1.2rem; }
.signal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
.signal-chip { border: 1px solid var(--border); padding: 0.5rem 0.75rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary); }
.signal-chip strong { color: var(--text); display: block; margin-bottom: 0.15rem; font-size: 0.78rem; }
.in-progress-box { border: 1px dashed var(--border); padding: 1.75rem 2rem; margin-top: 3rem; }
.in-progress-box p { color: var(--text-secondary); font-size: 0.93rem; line-height: 1.75; margin-top: 0.5rem; }
.outcome-row { display: flex; gap: 2rem; flex-wrap: wrap; margin-top: 0.75rem; }
.outcome-stat { text-align: left; }
.outcome-stat .stat-number { font-family: var(--font-serif); font-size: 1.6rem; color: var(--accent); }
.outcome-stat .stat-label { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 0.15rem; }

/* FOOTER */
footer { background: var(--surface); border-top: 1px solid var(--border); padding: 1.75rem 1.25rem; }
.footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap; gap: 0.75rem; }
.footer-links { display: flex; gap: 1.5rem; }
.footer-links a { color: var(--text-secondary); text-decoration: none; transition: color 0.15s; }
.footer-links a:hover { color: var(--text); }

/* REVEAL */
.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
.reveal.visible { opacity: 1; transform: none; }
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .exp-item { grid-template-columns: 1fr; gap: 0.5rem; }
}
@media (max-width: 640px) {
  .nav-container { flex-direction: column; height: auto; padding: 0.75rem 1.25rem; gap: 0.5rem; }
  nav ul { gap: 1rem; }
  .pipeline-stages { grid-template-columns: 1fr; }
  #map { height: 320px; }
}
```

- [ ] **Step 2: Open index.html in browser**

```bash
open /tmp/portfolio-redesign/index.html
```

Confirm the page has switched to white/light background. Nav is white with border. All text is dark. Layout may look partially broken until the HTML classes are aligned — that's expected at this stage.

- [ ] **Step 3: Commit**

```bash
cd /tmp/portfolio-redesign
git add style.css
git commit -m "feat: replace style.css with light minimal design system"
```

---

## Task 2: Build Python data pipeline

**Files:**
- Create: `/tmp/portfolio-redesign/scripts/update_map_data.py`
- Create: `/tmp/portfolio-redesign/scripts/requirements.txt`
- Create: `/tmp/portfolio-redesign/scripts/test_pipeline.py`

- [ ] **Step 1: Write requirements.txt**

Create `/tmp/portfolio-redesign/scripts/requirements.txt`:

```
geopandas==0.14.4
pandas==2.2.2
scikit-learn==1.5.0
requests==2.32.3
numpy==1.26.4
```

- [ ] **Step 2: Install dependencies**

```bash
pip install -r /tmp/portfolio-redesign/scripts/requirements.txt
```

Expected: all packages install without error.

- [ ] **Step 3: Write the pipeline script**

Create `/tmp/portfolio-redesign/scripts/update_map_data.py`:

```python
#!/usr/bin/env python3
"""
Portfolio data pipeline: FEMA NRI + Census TIGER -> counties.geojson
Run locally or via GitHub Actions (daily cron).
"""
import io
import json
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


def download_zip(url: str, extract_to: Path) -> None:
    print(f"Downloading {url} ...")
    resp = requests.get(url, stream=True, timeout=180)
    resp.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(resp.content)) as z:
        z.extractall(extract_to)


def load_fema_nri() -> pd.DataFrame:
    nri_dir = DATA_DIR / "_nri_raw"
    if not any(nri_dir.glob("*.csv")):
        nri_dir.mkdir(exist_ok=True)
        download_zip(FEMA_NRI_URL, nri_dir)
    csv_files = list(nri_dir.glob("NRI_Table_Counties*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No NRI CSV in {nri_dir}")
    df = pd.read_csv(csv_files[0], dtype={"STCOFIPS": str}, low_memory=False)
    df["FIPS"] = df["STCOFIPS"].str.zfill(5)
    cols = ["FIPS", "COUNTY", "STATEABBRV"] + FEATURES
    return df[[c for c in cols if c in df.columns]].copy()


def load_tiger() -> gpd.GeoDataFrame:
    tiger_dir = DATA_DIR / "_tiger_raw"
    if not any(tiger_dir.glob("*.shp")):
        tiger_dir.mkdir(exist_ok=True)
        download_zip(TIGER_URL, tiger_dir)
    shp_files = list(tiger_dir.glob("*.shp"))
    if not shp_files:
        raise FileNotFoundError(f"No shapefile in {tiger_dir}")
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
        props = {
            "name":          str(row.get("COUNTY", "")),
            "state":         str(row.get("STATEABBRV", "")),
            "fips":          str(row["FIPS"]),
            "risk_score":    round(float(row.get("RISK_SCORE") or 0), 2),
            "eal_score":     round(float(row.get("EAL_SCORE") or 0), 2),
            "sovi_score":    round(float(row.get("SOVI_SCORE") or 0), 2),
            "resl_score":    round(float(row.get("RESL_SCORE") or 0), 2),
            "cluster_id":    int(row.get("cluster_id", 0)),
            "cluster_label": str(row.get("cluster_label", "")),
        }
        features.append({
            "type": "Feature",
            "geometry": row.geometry.__geo_interface__,
            "properties": props,
        })
    return {"type": "FeatureCollection", "features": features}


def main() -> None:
    nri = load_fema_nri()
    tigers = load_tiger()
    nri = cluster_counties(nri)
    merged = tigers.merge(nri, on="FIPS", how="left")
    geojson = build_geojson(merged)

    out = DATA_DIR / "counties.geojson"
    with open(out, "w") as f:
        json.dump(geojson, f, separators=(",", ":"))
    print(f"Wrote {len(geojson['features'])} features to {out}")

    status = {
        "last_run":        datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "feature_count":   len(geojson["features"]),
        "pipeline_version": "1.0",
    }
    with open(DATA_DIR / "pipeline-status.json", "w") as f:
        json.dump(status, f, indent=2)
    print(f"Status: {status['last_run']}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Write unit tests**

Create `/tmp/portfolio-redesign/scripts/test_pipeline.py`:

```python
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
```

- [ ] **Step 5: Run tests**

```bash
cd /tmp/portfolio-redesign/scripts
python -m pytest test_pipeline.py -v
```

Expected output:
```
test_pipeline.py::test_cluster_counties_adds_columns PASSED
test_pipeline.py::test_cluster_counties_no_missing_labels PASSED
test_pipeline.py::test_build_geojson_structure PASSED
test_pipeline.py::test_build_geojson_skips_null_geometry PASSED
4 passed
```

- [ ] **Step 6: Run the full pipeline to generate data files**

```bash
cd /tmp/portfolio-redesign/scripts
python update_map_data.py
```

Expected (downloads ~150MB, takes 2-5 min on first run):
```
Downloading https://hazards.fema.gov/... 
Downloading https://www2.census.gov/...
Wrote 3143 features to .../data/counties.geojson
Status: 2026-04-20 HH:MM UTC
```

Verify outputs:
```bash
ls -lh /tmp/portfolio-redesign/data/
```

Expected: `counties.geojson` (10-25 MB), `pipeline-status.json` (< 1KB), `_nri_raw/`, `_tiger_raw/`

- [ ] **Step 7: Add .gitignore for raw data cache**

Add to `/tmp/portfolio-redesign/.gitignore` (create if it doesn't exist):

```
data/_nri_raw/
data/_tiger_raw/
```

- [ ] **Step 8: Commit**

```bash
cd /tmp/portfolio-redesign
git add scripts/update_map_data.py scripts/requirements.txt scripts/test_pipeline.py .gitignore data/counties.geojson data/pipeline-status.json
git commit -m "feat: add spatial ML data pipeline and generate counties.geojson"
```

---

## Task 3: Add GitHub Actions workflow

**Files:**
- Create: `/tmp/portfolio-redesign/.github/workflows/update-map-data.yml`

- [ ] **Step 1: Write the workflow file**

Create `/tmp/portfolio-redesign/.github/workflows/update-map-data.yml`:

```yaml
name: Update Map Data

on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: scripts/requirements.txt

      - name: Install dependencies
        run: pip install -r scripts/requirements.txt

      - name: Run pipeline
        run: python scripts/update_map_data.py

      - name: Commit updated data
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/counties.geojson data/pipeline-status.json
          git diff --staged --quiet || git commit -m "chore: update map data [skip ci]"
          git push
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/portfolio-redesign
git add .github/workflows/update-map-data.yml
git commit -m "feat: add GitHub Actions workflow for daily map data pipeline"
```

---

## Task 4: Update nav on all pages (add Spatial link)

**Files:**
- Modify: `/tmp/portfolio-redesign/index.html`
- Modify: `/tmp/portfolio-redesign/about.html`
- Modify: `/tmp/portfolio-redesign/projects.html`
- Modify: `/tmp/portfolio-redesign/intelligence.html`

The current nav `<ul>` in all four files looks like:
```html
<li><a href="index.html">Home</a></li>
<li><a href="projects.html">Projects</a></li>
<li><a href="intelligence.html">Intelligence</a></li>
<li><a href="about.html">About</a></li>
<li><a href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a></li>
```

Note: if `intelligence.html` nav does not yet have the Intelligence link (it was added in the April 2026 plan), add it as part of this step.

- [ ] **Step 1: Replace nav `<ul>` in all four files**

In each of `index.html`, `about.html`, `projects.html`, `intelligence.html`, find the nav `<ul>` and replace its content so the final nav reads:

```html
<li><a href="index.html">Home</a></li>
<li><a href="projects.html">Projects</a></li>
<li><a href="intelligence.html">Intelligence</a></li>
<li><a href="spatial.html">Spatial</a></li>
<li><a href="about.html">About</a></li>
<li><a href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a></li>
```

- [ ] **Step 2: Verify**

```bash
open /tmp/portfolio-redesign/index.html
```

Confirm nav shows: Home · Projects · Intelligence · **Spatial** · About · Resume on all four pages.

- [ ] **Step 3: Commit**

```bash
cd /tmp/portfolio-redesign
git add index.html about.html projects.html intelligence.html
git commit -m "feat: add Spatial nav link to all pages"
```

---

## Task 5: Rewrite index.html hero section

**Files:**
- Modify: `/tmp/portfolio-redesign/index.html`

- [ ] **Step 1: Update `<title>` and meta description**

Replace:
```html
<title>Benjamin Lab — Market Intelligence & Strategy Analyst</title>
<meta name="description" content="Benjamin Lab — strategy and analytics analyst specializing in market intelligence, competitive analysis, and decision support for digital health and AI infrastructure.">
```

With:
```html
<title>Benjamin Lab — Economist · Data Scientist · GIS Analyst</title>
<meta name="description" content="Benjamin Lab — economist and spatial data scientist specializing in GIS, econometrics, spatial ML pipelines, and competitive intelligence.">
```

- [ ] **Step 2: Update hero eyebrow, title, subtitle**

Replace:
```html
<p class="hero-eyebrow">Benjamin Lab &mdash; Strategy &amp; Analytics Analyst</p>
<h1 class="hero-title">
  Market intelligence, business analysis, and operational decision support.
</h1>
<p class="hero-subtitle">
  I build competitive intelligence systems, forecasting models, and analytical infrastructure
  that translate market signals and behavioral data into strategy&mdash;at the speed
  early-stage teams actually operate.
</p>
```

With:
```html
<p class="hero-eyebrow">Benjamin Lab &mdash; Economist &middot; Data Scientist &middot; GIS Analyst</p>
<h1 class="hero-title">
  Economics, Data Science<br>&amp; Spatial Analytics
</h1>
<p class="hero-subtitle">
  I build spatial ML pipelines, econometric models, and competitive intelligence systems
  that turn geographic, economic, and behavioral data into decisions&mdash;across
  public-sector planning, logistics, and AI infrastructure.
</p>
```

- [ ] **Step 3: Update hero CTA buttons**

Replace:
```html
<div class="btn-row">
  <a class="btn btn-primary" href="intelligence.html">Intelligence Work</a>
  <a class="btn btn-secondary" href="projects.html">All Projects</a>
  <a class="btn btn-secondary" href="about.html">About Me</a>
  <a class="btn btn-secondary" href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a>
</div>
```

With:
```html
<div class="btn-row">
  <a class="btn btn-primary" href="#map-section">Explore Map</a>
  <a class="btn btn-secondary" href="intelligence.html">Intelligence Work</a>
  <a class="btn btn-secondary" href="projects.html">Projects</a>
  <a class="btn btn-secondary" href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a>
</div>
```

- [ ] **Step 4: Update hero tool tags**

Replace:
```html
<div class="hero-tools">
  <span>Python</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>SQL</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Competitive Intelligence</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Market Research</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Machine Learning</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Econometrics</span>
</div>
```

With:
```html
<div class="hero-tools">
  <span>Python</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>SQL</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>GIS</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Econometrics</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Spatial ML</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Machine Learning</span>
</div>
```

- [ ] **Step 5: Verify**

```bash
open /tmp/portfolio-redesign/index.html
```

Hero reads "Economics, Data Science & Spatial Analytics". Buttons are: Explore Map · Intelligence Work · Projects · Resume. Tool tags include GIS, Econometrics, Spatial ML.

- [ ] **Step 6: Commit**

```bash
cd /tmp/portfolio-redesign
git add index.html
git commit -m "feat: rewrite hero for economist/GIS/data-science positioning"
```

---

## Task 6: Add map section to index.html

**Files:**
- Modify: `/tmp/portfolio-redesign/index.html`

The map section goes immediately after the `</section>` that closes the hero (the first `<section>` tag after `<main>`).

- [ ] **Step 1: Add Leaflet.js CDN links to `<head>`**

In `index.html`, inside `<head>`, add before `</head>`:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
```

- [ ] **Step 2: Insert map section HTML**

After the hero `<section>` closing tag (find `</section>` right after the hero `<div class="btn-row">` block), insert:

```html
<section class="map-section reveal" id="map-section">
  <div class="map-section-inner">
    <div class="map-section-header">
      <div>
        <p class="section-label">02 &mdash; Live Spatial Analysis</p>
        <h2 class="section-title">Economic Risk &amp; County Clusters</h2>
        <p class="section-subtitle" style="margin-top:0.3rem;">US County &middot; FEMA NRI + Census TIGER &middot; K-Means Spatial ML &middot; updated daily</p>
      </div>
      <div class="layer-toggles">
        <button class="layer-toggle layer-toggle--risk active" data-layer="risk">Risk Zones</button>
        <button class="layer-toggle layer-toggle--clusters active" data-layer="clusters">ML Clusters</button>
      </div>
    </div>
    <div id="map"></div>
    <div class="pipeline-panel">
      <p class="pipeline-label">Pipeline</p>
      <div class="pipeline-stages">
        <div class="pipeline-stage">
          <div class="pipeline-stage-name">Ingest</div>
          <div class="pipeline-stage-status">&#10003; FEMA NRI</div>
          <div class="pipeline-stage-meta">3,143 counties</div>
        </div>
        <div class="pipeline-stage">
          <div class="pipeline-stage-name">Transform</div>
          <div class="pipeline-stage-status">&#10003; Spatial Join</div>
          <div class="pipeline-stage-meta">Census TIGER 20m</div>
        </div>
        <div class="pipeline-stage">
          <div class="pipeline-stage-name">Model</div>
          <div class="pipeline-stage-status">&#10003; K-Means</div>
          <div class="pipeline-stage-meta">5 clusters</div>
        </div>
      </div>
      <p class="pipeline-footer">
        Last run: <span id="pipeline-last-run">—</span>
        &nbsp;&middot;&nbsp;
        <a href="https://github.com/mossfunki/mossfunki.github.io/actions" target="_blank" rel="noopener">View GitHub Actions &rarr;</a>
        &nbsp;&middot;&nbsp;
        <a href="spatial.html">How it&rsquo;s built &rarr;</a>
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add map JavaScript before `</body>`**

Find the existing `<script>` block near `</body>` in `index.html` and add a new `<script>` block immediately before it:

```html
<script>
(function () {
  var map = L.map('map', {
    center: [39.5, -98.35],
    zoom: 4,
    scrollWheelZoom: false
  });

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, AEX, GeoEye',
      maxZoom: 18
    }
  ).addTo(map);

  var CLUSTER_COLORS = ['#22c55e', '#86efac', '#f59e0b', '#ef4444', '#3b82f6'];

  function riskColor(score) {
    if (!score) return '#d1d5db88';
    if (score < 15)  return '#22c55e88';
    if (score < 30)  return '#86efac88';
    if (score < 50)  return '#fde68a88';
    if (score < 70)  return '#f9730088';
    return '#ef444488';
  }

  var riskLayer = null;
  var clustersLayer = null;
  var toggleState = { risk: true, clusters: true };

  fetch('data/counties.geojson')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      riskLayer = L.geoJSON(data, {
        style: function (f) {
          return {
            fillColor: riskColor(f.properties.risk_score),
            weight: 0.3,
            opacity: 0.7,
            color: '#ffffff',
            fillOpacity: 0.7
          };
        },
        onEachFeature: function (f, layer) {
          var p = f.properties;
          layer.bindTooltip(
            '<strong>' + (p.name || 'County') + ', ' + (p.state || '') + '</strong>' +
            '<br>Risk Score: ' + p.risk_score +
            '<br>Cluster: ' + (p.cluster_label || '—'),
            { sticky: true, className: 'map-tooltip' }
          );
        }
      });

      clustersLayer = L.geoJSON(data, {
        style: function (f) {
          var c = CLUSTER_COLORS[f.properties.cluster_id % CLUSTER_COLORS.length];
          return {
            fillColor: c,
            weight: 0.3,
            opacity: 0.5,
            color: '#ffffff',
            fillOpacity: 0.5
          };
        },
        onEachFeature: function (f, layer) {
          var p = f.properties;
          layer.bindTooltip(
            '<strong>' + (p.name || 'County') + ', ' + (p.state || '') + '</strong>' +
            '<br>Cluster: ' + (p.cluster_label || '—') +
            '<br>Risk Score: ' + p.risk_score,
            { sticky: true, className: 'map-tooltip' }
          );
        }
      });

      riskLayer.addTo(map);

      fetch('data/pipeline-status.json')
        .then(function (r) { return r.json(); })
        .then(function (s) {
          var el = document.getElementById('pipeline-last-run');
          if (el) el.textContent = s.last_run;
        })
        .catch(function () {});
    })
    .catch(function () {
      document.getElementById('map').innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;' +
        'color:#9ca3af;font-size:0.875rem;background:#f9fafb;">Map data not found — run scripts/update_map_data.py first</div>';
    });

  document.querySelectorAll('.layer-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var layer = btn.dataset.layer;
      if (layer === 'risk' && riskLayer) {
        toggleState.risk = !toggleState.risk;
        toggleState.risk ? map.addLayer(riskLayer) : map.removeLayer(riskLayer);
        btn.classList.toggle('active', toggleState.risk);
        btn.classList.toggle('inactive', !toggleState.risk);
      } else if (layer === 'clusters' && clustersLayer) {
        toggleState.clusters = !toggleState.clusters;
        toggleState.clusters ? map.addLayer(clustersLayer) : map.removeLayer(clustersLayer);
        btn.classList.toggle('active', toggleState.clusters);
        btn.classList.toggle('inactive', !toggleState.clusters);
      }
    });
  });
}());
</script>
```

- [ ] **Step 4: Serve the page locally (required for fetch() to work)**

```bash
cd /tmp/portfolio-redesign
python -m http.server 8080
```

Open `http://localhost:8080/index.html` in browser. Confirm:
- Satellite map loads showing US counties
- Counties are colored by risk score (green = low, red = high)
- Hovering shows tooltip with county name, risk score, cluster label
- "Risk Zones" and "ML Clusters" toggles work
- Pipeline panel shows last run timestamp

Stop server with Ctrl+C when done.

- [ ] **Step 5: Commit**

```bash
cd /tmp/portfolio-redesign
git add index.html
git commit -m "feat: add satellite map section and pipeline panel to homepage"
```

---

## Task 7: Update index.html expertise cards

**Files:**
- Modify: `/tmp/portfolio-redesign/index.html`

- [ ] **Step 1: Replace expertise card 01**

Find and replace:
```html
<div class="expertise-card reveal reveal-delay-1">
  <div class="expertise-number">01</div>
  <h3>Market Intelligence &amp; Competitive Analysis</h3>
  <p>Recurring competitor monitoring, signal synthesis from developer forums, funding data, and job listings — structured into decision-ready briefs for executive teams.</p>
</div>
```

With:
```html
<div class="expertise-card reveal reveal-delay-1">
  <div class="expertise-number">01</div>
  <h3>Spatial Analytics &amp; GIS</h3>
  <p>Location-based intelligence, risk modeling, logistics efficiency analysis, and spatial ML — building pipelines that turn geographic data into operational decisions.</p>
</div>
```

- [ ] **Step 2: Verify section numbering**

Open `http://localhost:8080/index.html` (restart server if needed). Confirm card 01 reads "Spatial Analytics & GIS". Cards 02 and 03 unchanged.

- [ ] **Step 3: Commit**

```bash
cd /tmp/portfolio-redesign
git add index.html
git commit -m "feat: update expertise card 01 to Spatial Analytics & GIS"
```

---

## Task 8: Create spatial.html

**Files:**
- Create: `/tmp/portfolio-redesign/spatial.html`

- [ ] **Step 1: Read index.html for font/meta `<head>` block to copy**

```bash
head -20 /tmp/portfolio-redesign/index.html
```

Copy the `<head>` meta/font block from `index.html` for use in the next step.

- [ ] **Step 2: Create spatial.html**

Create `/tmp/portfolio-redesign/spatial.html` with the following content (replace the `<head>` block with what you copied from index.html, updating the title and description):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Spatial Analytics — Benjamin Lab</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Spatial ML pipeline, GIS methods, and automated data infrastructure by Benjamin Lab — FEMA NRI, Census TIGER, K-Means clustering, GitHub Actions.">
  <!-- copy font preconnect/link tags from index.html here -->
  <link rel="stylesheet" href="style.css">
</head>
<body>

<nav>
  <div class="nav-container">
    <div class="nav-brand">Benjamin Lab</div>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="intelligence.html">Intelligence</a></li>
      <li><a href="spatial.html">Spatial</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a></li>
    </ul>
  </div>
</nav>

<div class="page-header">
  <p class="section-label">Spatial Analytics &amp; GIS</p>
  <h1 class="page-title">Spatial ML Pipeline</h1>
  <p class="page-subtitle">
    A live data pipeline — FEMA National Risk Index + Census TIGER county geometries,
    processed with Python, clustered with K-Means, served as GeoJSON to a Leaflet.js
    satellite map. Runs daily on GitHub Actions.
  </p>
</div>

<main>

  <!-- PIPELINE ARCHITECTURE -->
  <section class="section">
    <p class="section-label">01 &mdash; Pipeline Architecture</p>
    <h2 class="section-title">How It&rsquo;s Built</h2>

    <div class="pipeline-flow" style="margin-top:2rem;">
      <div class="flow-step">
        <div class="flow-step-label">Source A</div>
        <div class="flow-step-content">FEMA NRI CSV</div>
      </div>
      <div class="flow-arrow">&rarr;</div>
      <div class="flow-step">
        <div class="flow-step-label">Source B</div>
        <div class="flow-step-content">Census TIGER SHP</div>
      </div>
      <div class="flow-arrow">&rarr;</div>
      <div class="flow-step">
        <div class="flow-step-label">Process</div>
        <div class="flow-step-content">Python · pandas · geopandas</div>
      </div>
      <div class="flow-arrow">&rarr;</div>
      <div class="flow-step">
        <div class="flow-step-label">Model</div>
        <div class="flow-step-content">K-Means (scikit-learn)</div>
      </div>
      <div class="flow-arrow">&rarr;</div>
      <div class="flow-step">
        <div class="flow-step-label">Output</div>
        <div class="flow-step-content">counties.geojson</div>
      </div>
      <div class="flow-arrow">&rarr;</div>
      <div class="flow-step">
        <div class="flow-step-label">Serve</div>
        <div class="flow-step-content">Leaflet.js · GitHub Pages</div>
      </div>
    </div>

    <div style="margin-top:2rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
      <div class="method-card">
        <h4>Data Ingestion</h4>
        <p>
          The pipeline downloads the FEMA National Risk Index county-level CSV (~130 MB) and
          the Census TIGER 20m county boundary shapefile directly via HTTP — no API keys required.
          Raw files are cached locally and excluded from the repo via <code>.gitignore</code>.
        </p>
      </div>
      <div class="method-card">
        <h4>Spatial Join</h4>
        <p>
          County records are joined on 5-digit FIPS code. TIGER geometries are reprojected to
          WGS84 (EPSG:4326) for Leaflet compatibility. GeoPandas handles the merge — the output
          is a GeoDataFrame with both geometry and risk attributes per county.
        </p>
      </div>
      <div class="method-card">
        <h4>Automation</h4>
        <p>
          A GitHub Actions workflow triggers daily at 06:00 UTC. It runs the Python script,
          commits the updated <code>counties.geojson</code> and <code>pipeline-status.json</code>
          back to the repo, and GitHub Pages rebuilds automatically. The homepage map reflects
          the latest data on the next page load.
        </p>
      </div>
      <div class="method-card">
        <h4>Stack</h4>
        <p>
          Python 3.11 · pandas · geopandas · scikit-learn · requests · Leaflet.js 1.9 ·
          Esri World Imagery satellite tiles · GitHub Actions · GitHub Pages
        </p>
      </div>
    </div>

    <div style="margin-top:1.5rem;">
      <a class="btn btn-secondary" href="https://github.com/mossfunki/mossfunki.github.io/blob/main/scripts/update_map_data.py" target="_blank" rel="noopener">View pipeline script &rarr;</a>
      &nbsp;
      <a class="btn btn-secondary" href="https://github.com/mossfunki/mossfunki.github.io/actions" target="_blank" rel="noopener">View GitHub Actions &rarr;</a>
    </div>
  </section>

  <!-- SPATIAL ML METHODS -->
  <section class="section--alt">
    <div style="max-width:1100px;margin:0 auto;padding:5rem 0;">
      <p class="section-label">02 &mdash; Spatial ML</p>
      <h2 class="section-title">Methods</h2>

      <div style="margin-top:2rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
        <div class="method-card">
          <h4>Feature Engineering</h4>
          <p>
            Seven features from the FEMA NRI are used: composite risk score, expected annual
            loss score, social vulnerability index (SoVI), community resilience score, and
            annualized frequency rates for hurricanes, tornadoes, and riverine flooding.
            All features are standardized (zero mean, unit variance) before clustering.
          </p>
        </div>
        <div class="method-card">
          <h4>K-Means Clustering (k=5)</h4>
          <p>
            K-Means is run with k=5 and random_state=42 for reproducibility. Clusters are
            relabeled post-hoc by ascending mean risk score so that cluster 0 always
            represents the lowest-risk group — making the output deterministic across pipeline
            runs regardless of initialization order.
          </p>
        </div>
        <div class="method-card">
          <h4>Cluster Profiles</h4>
          <p>
            The five clusters capture distinct county risk profiles: low-risk/high-resilience
            (predominantly Mountain West and Upper Midwest), rural/low-exposure,
            moderate-risk/mixed, coastal/weather-exposed (Gulf Coast, Atlantic seaboard),
            and high-risk/low-resilience (predominantly Deep South and lower Mississippi).
          </p>
        </div>
        <div class="method-card">
          <h4>Spatial Autocorrelation</h4>
          <p>
            Risk scores exhibit strong positive spatial autocorrelation — neighboring counties
            tend to share similar risk profiles. This is expected given shared climate exposure
            and regional economic patterns. A spatial lag term could be added to regression
            models to account for this clustering effect (Moran&rsquo;s I &asymp; 0.6 for RISK_SCORE).
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- DATASETS -->
  <section class="section">
    <p class="section-label">03 &mdash; Data Sources</p>
    <h2 class="section-title">Datasets</h2>

    <div style="margin-top:2rem;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:0.6rem 1rem 0.6rem 0;color:var(--text);font-weight:700;">Dataset</th>
            <th style="text-align:left;padding:0.6rem 1rem;color:var(--text);font-weight:700;">Source</th>
            <th style="text-align:left;padding:0.6rem 1rem;color:var(--text);font-weight:700;">Update freq.</th>
            <th style="text-align:left;padding:0.6rem 1rem;color:var(--text);font-weight:700;">Variables used</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:0.75rem 1rem 0.75rem 0;color:var(--text);font-weight:600;">FEMA National Risk Index</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);">FEMA (hazards.fema.gov)</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);">Annual</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);font-family:var(--font-mono);font-size:0.75rem;">RISK_SCORE, EAL_SCORE, SOVI_SCORE, RESL_SCORE, HWAV_AFREQ, TRND_AFREQ, RFLD_AFREQ</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:0.75rem 1rem 0.75rem 0;color:var(--text);font-weight:600;">Census TIGER County Boundaries</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);">US Census Bureau</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);">Annual</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);font-family:var(--font-mono);font-size:0.75rem;">County polygons (20m simplified, EPSG:4326)</td>
          </tr>
          <tr>
            <td style="padding:0.75rem 1rem 0.75rem 0;color:var(--text);font-weight:600;">Esri World Imagery</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);">Esri / ArcGIS Online</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);">Continuous</td>
            <td style="padding:0.75rem 1rem;color:var(--text-secondary);font-family:var(--font-mono);font-size:0.75rem;">Satellite tile basemap (XYZ tiles, free)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

</main>

<footer>
  <div class="footer-inner">
    <span>&copy; 2026 Benjamin Lab</span>
    <div class="footer-links">
      <a href="mailto:benjaminmonroelab@gmail.com">Email</a>
      <a href="https://www.linkedin.com/in/benjamin-lab-577792240/" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://github.com/mossfunki" target="_blank" rel="noopener">GitHub</a>
    </div>
  </div>
</footer>

<script>
  (function(){
    var p = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(function(a){
      if(a.getAttribute('href') === p) a.classList.add('nav-active');
    });
  })();
  (function(){
    if(!('IntersectionObserver' in window)){
      document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
  })();
</script>

</body>
</html>
```

- [ ] **Step 3: Copy font preconnect/link tags from index.html into spatial.html `<head>`**

Read the `<head>` of index.html and copy the Google Fonts preconnect and `<link>` tags into the corresponding spot in spatial.html's `<head>` (replacing the `<!-- copy font ... -->` comment).

- [ ] **Step 4: Verify**

```bash
cd /tmp/portfolio-redesign && python -m http.server 8080
```

Open `http://localhost:8080/spatial.html`. Confirm:
- Nav shows "Spatial" as active
- Pipeline flow diagram renders with 6 steps connected by arrows
- All 4 method cards render in a 2-column grid
- Dataset table renders with 3 rows
- Footer shows

- [ ] **Step 5: Commit**

```bash
cd /tmp/portfolio-redesign
git add spatial.html
git commit -m "feat: create spatial.html with pipeline architecture and ML methods"
```

---

## Task 9: Update intelligence.html — add CSS variable aliases

**Files:**
- Modify: `/tmp/portfolio-redesign/intelligence.html`

The existing `intelligence.html` has a `<style>` block with inline CSS using dark-theme variables (`--border`, `--panel`, `--accent-2`, `--muted`, `--text`, `--font-mono`). The new `style.css` already defines compatibility aliases for all of these, so the inline styles should work automatically. This task verifies that and removes any remaining dark-mode overrides.

- [ ] **Step 1: Open intelligence.html and check for any hardcoded dark colors**

```bash
grep -n "#0d1117\|#161b22\|#1a1f2e\|background.*#0\|color.*#0" /tmp/portfolio-redesign/intelligence.html
```

If any matches are found, replace those hardcoded hex values with their light equivalents:
- `#0d1117` → `#fafafa`
- `#161b22` → `#f9fafb`
- `#1a1f2e` → `#f3f4f6`

- [ ] **Step 2: Remove the inline `<style>` block from intelligence.html**

Find the `<style>` block inside `<head>` of `intelligence.html` (it starts with `.intel-wrapper {` and ends before `</style>`). Delete the entire block. The new `style.css` covers all those classes.

- [ ] **Step 3: Verify**

```bash
cd /tmp/portfolio-redesign && python -m http.server 8080
```

Open `http://localhost:8080/intelligence.html`. Confirm:
- Page has white background
- CI case study renders with light borders and dark text
- Signal chips, outcome stats, in-progress box all look correct
- No dark backgrounds remain

- [ ] **Step 4: Commit**

```bash
cd /tmp/portfolio-redesign
git add intelligence.html
git commit -m "feat: restyle intelligence.html to light minimal — remove inline dark styles"
```

---

## Task 10: Update projects.html

**Files:**
- Modify: `/tmp/portfolio-redesign/projects.html`

- [ ] **Step 1: Add spatial and economics filter buttons**

In the filter bar (find `<div class="filter-bar">` or the `<div>` containing `<button class="filter-btn"`), add two new buttons after the existing `market-intelligence` button:

```html
<button class="filter-btn" data-filter="spatial">Spatial / GIS</button>
<button class="filter-btn" data-filter="economics">Economics</button>
```

- [ ] **Step 2: Tag existing spatial projects**

For the following existing project cards, add `spatial` to their `data-category` attribute:
- Austin Investment Map → add `spatial`
- Competitive Labor Market Intelligence → add `spatial economics`
- Hydrogen Transit Infrastructure → add `spatial`

Example: if a card has `data-category="gis analysis"`, change it to `data-category="gis analysis spatial"`.

- [ ] **Step 3: Tag economics projects**

For these existing cards, add `economics` to `data-category`:
- Workforce & Equity Intelligence Dashboard → add `economics`
- Competitive Labor Market Intelligence → add `economics` (already done in Step 2)
- Any econometrics/economic analysis project

- [ ] **Step 4: Verify**

Open `http://localhost:8080/projects.html`. Confirm:
- "Spatial / GIS" and "Economics" filter buttons appear
- Clicking "Spatial / GIS" shows only spatially-tagged cards
- Clicking "Economics" shows only economics-tagged cards
- "All" button shows everything

- [ ] **Step 5: Commit**

```bash
cd /tmp/portfolio-redesign
git add projects.html
git commit -m "feat: add spatial and economics filters to projects page"
```

---

## Task 11: Update about.html

**Files:**
- Modify: `/tmp/portfolio-redesign/about.html`

- [ ] **Step 1: Update meta description**

Replace:
```html
<meta name="description" content="About Benjamin Lab — strategy and analytics analyst specializing in market intelligence, competitive analysis, and decision support for digital health and AI infrastructure.">
```

With:
```html
<meta name="description" content="About Benjamin Lab — economist and spatial data scientist specializing in GIS, econometrics, spatial ML pipelines, and competitive intelligence.">
```

- [ ] **Step 2: Update page subtitle**

Replace:
```html
<p class="page-subtitle">
    Strategy and analytics analyst specializing in market intelligence, competitive
    analysis, and decision support — built at the intersection of economics, data science,
    and AI infrastructure.
</p>
```

With:
```html
<p class="page-subtitle">
    Economist and spatial data scientist &mdash; GIS, econometrics, machine learning,
    and pipeline automation applied to economic development, logistics, and market intelligence.
</p>
```

- [ ] **Step 3: Update "Who I am" paragraph**

Replace:
```html
<p>
    I'm Benjamin Lab, an economist and data scientist with a B.S. in Economics
    and Data Science from Cal Poly Humboldt. I specialize in commercial intelligence
    and analytical decision support — building the systems that track markets, synthesize
    signals, and translate behavioral and competitive data into strategy. My background
    spans econometrics, machine learning, and GIS, applied across AI infrastructure,
    public-sector economic planning, and institutional research.
</p>
```

With:
```html
<p>
    I&rsquo;m Benjamin Lab, an economist and data scientist with a B.S. in Economics
    (concentration: Data Science &amp; GIS) from Cal Poly Humboldt. My work sits at the
    intersection of spatial analysis, econometrics, and pipeline automation &mdash; building
    systems that turn geographic and economic data into decisions. I&rsquo;ve applied these
    skills across public-sector economic development, institutional research, and commercial
    intelligence at an AI infrastructure startup.
</p>
```

- [ ] **Step 4: Update skills list**

Find the `<ul>` inside the highlight-box on the about page and replace with:

```html
<ul style="margin-top:0.6rem;">
    <li>Python &middot; pandas &middot; NumPy &middot; scikit-learn</li>
    <li>Spatial ML &middot; GeoPandas &middot; Leaflet.js &middot; ArcGIS &middot; QGIS</li>
    <li>SQL &middot; data pipelines &middot; GitHub Actions &middot; pipeline automation</li>
    <li>Econometrics &middot; statistical modeling &middot; forecasting</li>
    <li>Competitive Intelligence &middot; Market Research &middot; Cohort Analysis</li>
    <li>Tableau &middot; Streamlit &middot; data visualization</li>
    <li>Machine learning &middot; regression &middot; classification &middot; clustering</li>
</ul>
```

- [ ] **Step 5: Verify**

Open `http://localhost:8080/about.html`. Confirm:
- Subtitle reads "Economist and spatial data scientist..."
- "Who I am" paragraph leads with Economics + GIS background
- Skills list includes Spatial ML, GeoPandas, Leaflet.js, GitHub Actions

- [ ] **Step 6: Commit**

```bash
cd /tmp/portfolio-redesign
git add about.html
git commit -m "feat: update about page — GIS/econ/data science positioning and skills"
```

---

## Task 12: Final review and push

- [ ] **Step 1: Full visual pass — serve all pages**

```bash
cd /tmp/portfolio-redesign && python -m http.server 8080
```

Open and check each page:

| URL | Check |
|---|---|
| `http://localhost:8080/index.html` | Light background, new hero ("Economics, Data Science & Spatial Analytics"), satellite map loads, pipeline panel shows last run, layer toggles work, Spatial in nav |
| `http://localhost:8080/spatial.html` | Pipeline flow diagram, 4 method cards, dataset table, nav active on Spatial |
| `http://localhost:8080/intelligence.html` | White background, CI case study intact, all sections render cleanly |
| `http://localhost:8080/projects.html` | Spatial/GIS and Economics filter buttons visible and working |
| `http://localhost:8080/about.html` | Economist/GIS subtitle, updated skills list |

- [ ] **Step 2: Check git log**

```bash
cd /tmp/portfolio-redesign
git log --oneline
```

Expected: 9+ commits since the original baseline, covering style.css, pipeline, Actions, nav, hero, map, spatial.html, intelligence, projects, about.

- [ ] **Step 3: Push to GitHub**

```bash
cd /tmp/portfolio-redesign
git push origin main
```

- [ ] **Step 4: Verify live site**

Wait ~60 seconds for GitHub Pages rebuild, then open `https://mossfunki.github.io` in browser. Confirm the live site reflects all changes — light theme, new hero, satellite map section (may show "Map data not found" until the first GitHub Actions run completes or you manually trigger it).

- [ ] **Step 5: Trigger GitHub Actions to populate live map data**

In the GitHub repo UI: Actions → "Update Map Data" → "Run workflow". Wait for completion (~5 min). Reload live site — satellite map should now render with county data.
