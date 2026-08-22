# Portfolio Spatial Redesign — GIS · Economics · Data Science · CI
_2026-04-20_

## Goal

Redesign mossfunki.github.io with a light minimal aesthetic and integrate spatial analytics, economics, and data science capabilities alongside the existing commercial intelligence positioning. Add a live interactive satellite map to the homepage driven by a real Python data pipeline (FEMA NRI + Census ACS), a visible pipeline status panel, a new `spatial.html` page, and update all pages to the new visual system.

## Audience

**Primary:** Recruiters and hiring managers for roles in:
- **Economics / Economic Analysis** — policy analysis, economic development, research analyst, applied economist
- **Data Science / Analytics** — data scientist, analytics engineer, quantitative analyst
- **GIS / Spatial Analytics** — GIS analyst, spatial data scientist, geospatial engineer
- **Commercial Intelligence / Strategy** — market intelligence, strategy analyst, competitive intelligence (existing positioning)

The site must signal credibility across all four role types from the homepage — a recruiter scanning for a GIS analyst and a recruiter scanning for a data scientist should both immediately see relevant skills. The spatial map + pipeline demo does this for GIS/DS; the CI case study does this for strategy; the economics background is woven through all of it.

---

## Visual Direction

**Old:** Dark theme (`#0d1117` background), terminal-inspired, dense.

**New:** Light Minimal — white/off-white background (`#fafafa`), gray text palette, Inter font, clean card components, satellite map as the single bold visual anchor. Feels like a consulting firm site or high-end research publication.

### Color System (new)
| Token | Value | Usage |
|---|---|---|
| Background | `#fafafa` | Page base |
| Surface | `#ffffff` | Cards, panels |
| Border | `#e5e7eb` | All borders |
| Text primary | `#111827` | Headings |
| Text secondary | `#6b7280` | Body, labels |
| Text muted | `#9ca3af` | Meta, timestamps |
| Accent | `#2563eb` | Links, active nav, pipeline panel |
| Success | `#15803d` | Pipeline status checks |
| Danger | `#dc2626` | Risk zone labels |

---

## Pages

### `style.css` — Full Replacement

Replace the existing dark CSS system with a new light minimal system. Preserve all existing class names where possible to minimize HTML edits. Key changes:
- `body`: `background: #fafafa; color: #111827`
- `nav`: `background: #fff; border-bottom: 1px solid #e5e7eb`
- `.hero-title`, `.page-title`: dark text, heavy weight
- `.btn-primary`: `background: #111827; color: #fff`
- `.btn-secondary`: `border: 1px solid #e5e7eb; color: #374151`
- `.proj-card`, `.exp-item`: white background, subtle border, no dark panel
- New classes: `.map-section`, `.pipeline-panel`, `.pipeline-stage`, `.layer-toggle`

---

### `index.html` — Updated

#### Nav
Add **Spatial** link between Intelligence and About:
```
Home · Projects · Intelligence · Spatial · About · Resume
```

#### Hero
- Eyebrow: `"Benjamin Lab — Economist · Data Scientist · GIS Analyst"`
- Title: `"Economics, Data Science & Spatial Analytics"`
- Subtitle: `"I build spatial ML pipelines, econometric models, and competitive intelligence systems that turn geographic, economic, and behavioral data into decisions — across public-sector planning, logistics, and AI infrastructure."`
- Tool tags: `Python · SQL · GIS · Econometrics · Spatial ML · Machine Learning`
- CTA buttons: `Explore Map (primary) · Intelligence Work · Projects · Resume`

#### Map Section (new — between hero and expertise cards)
Full-width section with:

**Header row:**
- Left: section label `"02 — Live Spatial Analysis"`, title `"Economic Risk + Logistics Network"`, subtitle `"US County · FEMA NRI + Census ACS · updated daily"`
- Right: three layer toggle buttons — `Risk Zones` (red), `Logistics Routes` (amber), `ML Clusters` (blue)

**Map:**
- Leaflet.js map, ~480px tall, full container width
- Basemap: Esri World Imagery (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) — free satellite tiles, no API key required
- Data layer: county polygons colored by FEMA NRI composite score (choropleth)
- Overlay: logistics route polylines (amber), risk zone circles (red/amber/green by severity), K-Means cluster labels (blue)
- Hover tooltip: county name, risk index, economic score, cluster label
- Layer toggles wired to Leaflet layer groups

**Pipeline Status Panel (below map):**
```
PIPELINE
[INGEST ✓ FEMA NRI — 3,143 counties]  [TRANSFORM ✓ Spatial Join — Census TIGER]  [MODEL ✓ K-Means — 5 clusters]
Last run: YYYY-MM-DD HH:MM UTC · View GitHub Actions →
```
Green success styling. GitHub Actions link goes to the repo's Actions tab.

#### Expertise Cards
Update card 01 from `"Supply Chain & Logistics"` to `"Spatial Analytics & GIS"` — description covers location-based insights, risk modeling, logistics efficiency, and spatial ML.

Keep card 02 (Data Science & ML) and card 03 (Market Intelligence) as-is with light minimal styling.

---

### `spatial.html` — New Page

Three sections:

**Section 1 — Pipeline Architecture**
How the data pipeline works end-to-end:
- Python script fetches FEMA NRI CSV + Census ACS via API → cleans and spatial-joins to Census TIGER county geometries → runs K-Means clustering (k=5) on composite economic/risk features → writes `data/counties.geojson` to repo
- GitHub Actions workflow (`.github/workflows/update-map-data.yml`) runs this daily at 06:00 UTC, commits the updated GeoJSON, triggers GitHub Pages rebuild
- Show a simplified flowchart as styled HTML: `FEMA NRI + Census ACS → Python (pandas, geopandas, scikit-learn) → counties.geojson → Leaflet.js`
- Link to the GitHub repo and the Actions workflow file

**Section 2 — Spatial ML Methods**
Brief technical writeup (3-4 paragraphs):
- Feature engineering: composite risk score from FEMA NRI sub-indices + Census economic indicators (median income, unemployment rate, industry mix)
- Clustering: K-Means (k=5) on standardized features; clusters labeled by dominant characteristic (e.g., "High Risk / Low Income", "Industrial Corridor", "Low Risk / High Economic Activity")
- Spatial regression note: OLS with spatial lag term to assess autocorrelation in risk distribution
- Visualization: choropleth by cluster label overlaid on satellite basemap

**Section 3 — Datasets**
| Dataset | Source | Update frequency | Variables used |
|---|---|---|---|
| FEMA National Risk Index | FEMA | Annual | Composite risk score, hazard sub-indices |
| ACS 5-Year Estimates | Census Bureau | Annual | Median income, unemployment, industry mix |
| TIGER County Geometries | Census Bureau | Annual | County boundary polygons |

---

### `intelligence.html` — Style Update Only

Preserve all existing content from the April 8 plan. Restyle to light minimal CSS system. No content changes.

---

### `projects.html` — Updated

- Restyle to light minimal
- Add `spatial` and `economics` filter buttons alongside existing filters
- Tag existing spatial projects (`Austin Investment Map`, `Competitive Labor Market Intelligence`, `Hydrogen Transit Infrastructure`) with `spatial` filter
- Add `economics` tag to relevant projects

---

### `about.html` — Updated

- Restyle to light minimal
- Update subtitle: `"Economist and spatial data scientist — GIS, econometrics, machine learning, and pipeline automation applied to economic development, logistics, and market intelligence."`
- Update "Who I am" paragraph: lead with B.S. Economics + Data Science + GIS concentration at Cal Poly Humboldt; then applied work across public-sector economic development, institutional research, and commercial intelligence; then technical skills
- Add to skills: `Spatial ML · GeoPandas · Leaflet.js · Pipeline Automation · GitHub Actions`

---

## Data Pipeline

### Python Script (`scripts/update_map_data.py`)
```
Input:  FEMA NRI county CSV (direct download URL)
        Census ACS API (county-level economic vars)
        Census TIGER county GeoJSON
Process: merge on FIPS code → standardize features → K-Means (k=5) → assign cluster labels
Output: docs/data/counties.geojson  (properties: name, fips, risk_score, income, unemployment, cluster_id, cluster_label)
```

### GitHub Actions (`.github/workflows/update-map-data.yml`)
- Trigger: `schedule: cron: '0 6 * * *'` + `workflow_dispatch`
- Steps: checkout → setup python → pip install → run script → git commit + push if changed
- The pipeline status panel on the homepage reads the last commit timestamp on `docs/data/counties.geojson` to show "Last run"

---

## Technical Notes

- Site remains static HTML/CSS on GitHub Pages — no server, no build step
- Leaflet.js loaded via CDN, GeoJSON fetched from `/data/counties.geojson` at relative path
- All new CSS scoped via new class names; existing class names updated in `style.css`
- `counties.geojson` committed to repo — Leaflet fetches it as a static asset
- Local working copy: `/Users/benjaminlab/Personal Website/mossfunki.github.io/` (docs only — not a git repo locally)
- Live repo: `https://github.com/mossfunki/mossfunki.github.io.git`
- Implementation clones live repo, makes all changes, pushes

---

## Out of Scope

- Backend server or database
- Mapbox (requires API key — Leaflet + CartoDB free tiles used instead)
- Real-time data feeds (daily pipeline is sufficient)
- New CI/health-tech analysis pieces (from April 8 plan — still in-progress section on `intelligence.html`)
- Resume file update
