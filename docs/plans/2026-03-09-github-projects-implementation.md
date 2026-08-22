# GitHub Projects Cleanup & Site Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Write draft READMEs for all portfolio-worthy GitHub repos, push 3 local projects as new repos, then add all 7 as project cards on the portfolio site.

**Architecture:** Phase 1 uses parallel agents to write READMEs independently. Phase 2 uses git to push READMEs to existing repos and create new repos for local projects. Phase 3 edits `projects.html` to add new cards and filter tags.

**Tech Stack:** Static HTML/CSS, vanilla JS, git, GitHub API (WebFetch for reading repo contents)

---

## Repos in scope

### Existing GitHub repos (need README)
| Repo | URL |
|---|---|
| `Dashboards-Streamlit` | https://github.com/mossfunki/Dashboards-Streamlit |
| `webscraper` | https://github.com/mossfunki/webscraper |
| `Interactive-Map` | https://github.com/mossfunki/Interactive-Map |
| `DLogis` | https://github.com/mossfunki/DLogis (README exists — skip) |

### Local projects (create new repos)
| Local path | New repo name |
|---|---|
| `/Users/benjaminlab/Personal Website/Projects/seattle-transit-equity` | `seattle-transit-equity` |
| `/Users/benjaminlab/Personal Website/Projects/seattle-last-mile-logistics` | `seattle-last-mile-logistics` |
| `/Users/benjaminlab/Personal Website/Projects/pnw-supply-chain-dashboard` | `pnw-supply-chain-dashboard` |

### Excluded from website (not showcased)
- `Eureka-CPI-2025` — Excel file only
- `Data271_Final_Project` — school assignment

---

## Phase 1 — Write READMEs (dispatch parallel agents)

Use `superpowers:dispatching-parallel-agents` to run Tasks 1A, 1B, and 1C simultaneously.

---

### Task 1A: READMEs for Dashboards-Streamlit and webscraper

**Files:**
- Create: `/Users/benjaminlab/Personal Website/mossfunki.github.io/docs/readmes/Dashboards-Streamlit-README.md`
- Create: `/Users/benjaminlab/Personal Website/mossfunki.github.io/docs/readmes/webscraper-README.md`

**Step 1: Read Dashboards-Streamlit source**

Fetch these URLs to understand the project:
- `https://raw.githubusercontent.com/mossfunki/Dashboards-Streamlit/main/LabMarketResearchDash.py`
- `https://raw.githubusercontent.com/mossfunki/Dashboards-Streamlit/main/requirements.txt`

**Step 2: Write Dashboards-Streamlit README**

Write to `docs/readmes/Dashboards-Streamlit-README.md`. Include:

```markdown
# Machine Market Analyzer

A Streamlit dashboard for analyzing market pricing of industrial and laboratory equipment by comparing eBay sold listings against active listings.

## What it does

- Searches eBay for sold and active listings of lab/industrial equipment (centrifuges, microscopes, analyzers, spectrometers)
- Uses TF-IDF vectorization and cosine similarity to match user queries against a catalog of ~48 known equipment models
- Computes market metrics: median price, price distribution, market velocity (units/week), price gap between asking and sold prices
- Visualizes price distributions as histograms, box plots, and bar charts

## Tech stack

- Python · Streamlit · scikit-learn · SerpAPI · pandas · matplotlib

## Setup

```bash
pip install -r requirements.txt
streamlit run LabMarketResearchDash.py
```

Requires a SerpAPI key set as `SERPAPI_KEY` in your environment.

## Status

Work in progress — data is pulled live from SerpAPI on each run.
```

**Step 3: Read webscraper source**

Fetch: `https://raw.githubusercontent.com/mossfunki/webscraper/main/scraperjanuary.py`

**Step 4: Write webscraper README**

Write to `docs/readmes/webscraper-README.md`. Include:

```markdown
# Biopharma Lead Scraper

A Python script that scrapes contact emails from biopharmaceutical company websites and writes results to a Google Sheet.

## What it does

- Reads a biopharmaceutical company directory from biopharmguy.com
- Visits each company's website and locates contact/about pages
- Extracts and validates email addresses (filters system emails, junk addresses, and long strings)
- Writes up to 4 emails per company into a Google Sheet ("My BioPharm Leads"), organized by domain

## Tech stack

- Python · BeautifulSoup · requests · gspread · regex

## Setup

```bash
pip install -r requirements.txt
```

Requires a Google service account credentials file for Sheets write access. Update the credentials path in the script before running.

```bash
python scraperjanuary.py
```

## Status

Single-run script. Rate limiting is built in (1–6 second random delays between requests).
```

**Step 5: Commit the README files**

```bash
cd "/Users/benjaminlab/Personal Website/mossfunki.github.io"
git add docs/readmes/Dashboards-Streamlit-README.md docs/readmes/webscraper-README.md
git commit -m "docs: draft READMEs for Dashboards-Streamlit and webscraper"
```

---

### Task 1B: README for Interactive-Map

**Files:**
- Create: `/Users/benjaminlab/Personal Website/mossfunki.github.io/docs/readmes/Interactive-Map-README.md`

**Step 1: Read Interactive-Map source**

Fetch: `https://raw.githubusercontent.com/mossfunki/Interactive-Map/main/filtered_parcels_map.html`

Read enough of the file to understand what geographic area, data, and map library is used.

**Step 2: Write Interactive-Map README**

Write to `docs/readmes/Interactive-Map-README.md`. Template (fill in specifics from the HTML):

```markdown
# Interactive Parcel Map

An interactive web map visualizing filtered parcel data for [region]. Built as a standalone HTML file using [Folium/Leaflet/other].

## What it does

- Displays geographically filtered parcel data on an interactive map
- Allows users to explore parcel boundaries and attributes
- [Add any tooltips, popups, or filtering controls found in the HTML]

## Tech stack

- HTML · [Folium / Leaflet.js] · Python (data preparation)

## Usage

Open `filtered_parcels_map.html` directly in a browser — no server needed.

## Status

Standalone visualization. Data is embedded in the HTML file.
```

**Step 3: Commit**

```bash
cd "/Users/benjaminlab/Personal Website/mossfunki.github.io"
git add docs/readmes/Interactive-Map-README.md
git commit -m "docs: draft README for Interactive-Map"
```

---

### Task 1C: READMEs for 3 local projects

**Files:**
- Create: `/Users/benjaminlab/Personal Website/Projects/seattle-transit-equity/README.md`
- Create: `/Users/benjaminlab/Personal Website/Projects/seattle-last-mile-logistics/README.md`
- Create: `/Users/benjaminlab/Personal Website/Projects/pnw-supply-chain-dashboard/README.md`

**Step 1: Read seattle-transit-equity notebooks**

Read these files in order to understand the project:
- `/Users/benjaminlab/Personal Website/Projects/seattle-transit-equity/notebooks/01_fetch_data.ipynb`
- `/Users/benjaminlab/Personal Website/Projects/seattle-transit-equity/notebooks/02_process.ipynb`
- `/Users/benjaminlab/Personal Website/Projects/seattle-transit-equity/notebooks/03_analysis.ipynb`

Also read `.env.example` if it exists to understand what APIs/data sources are used.

**Step 2: Write seattle-transit-equity README**

Write based on what the notebooks do. Follow this structure:

```markdown
# Seattle Transit Equity Analysis

[1-2 sentence description of what the project analyzes and why]

## What it does

- [Key step 1 from notebook 01]
- [Key step 2 from notebook 02]
- [Key findings/outputs from notebook 03]

## Tech stack

- Python · pandas · geopandas · [other libs from requirements]

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Fill in API keys in .env
```

Run notebooks in order:
1. `notebooks/01_fetch_data.ipynb`
2. `notebooks/02_process.ipynb`
3. `notebooks/03_analysis.ipynb`

## Status

Work in progress — analysis notebooks are functional, outputs subject to revision.
```

**Step 3: Read seattle-last-mile-logistics notebooks**

Read:
- `/Users/benjaminlab/Personal Website/Projects/seattle-last-mile-logistics/notebooks/01_fetch_network.ipynb`
- `/Users/benjaminlab/Personal Website/Projects/seattle-last-mile-logistics/notebooks/02_isochrones.ipynb`
- `/Users/benjaminlab/Personal Website/Projects/seattle-last-mile-logistics/notebooks/03_analysis.ipynb`

**Step 4: Write seattle-last-mile-logistics README**

```markdown
# Seattle Last-Mile Logistics Analysis

[1-2 sentence description based on notebooks]

## What it does

- Fetches and processes the Seattle road/network graph
- Computes isochrones (service area polygons) for [delivery points / facilities]
- Analyzes [coverage, gaps, efficiency metrics] based on travel time

## Tech stack

- Python · OSMnx · NetworkX · geopandas · [other libs]

## Setup

```bash
pip install -r requirements.txt
```

Run notebooks in order:
1. `notebooks/01_fetch_network.ipynb`
2. `notebooks/02_isochrones.ipynb`
3. `notebooks/03_analysis.ipynb`

## Status

Work in progress.
```

**Step 5: Read pnw-supply-chain-dashboard notebooks and app**

Read:
- `/Users/benjaminlab/Personal Website/Projects/pnw-supply-chain-dashboard/notebooks/01_fetch_data.ipynb`
- `/Users/benjaminlab/Personal Website/Projects/pnw-supply-chain-dashboard/notebooks/02_process.ipynb`
- `/Users/benjaminlab/Personal Website/Projects/pnw-supply-chain-dashboard/notebooks/03_eda.ipynb`
- `/Users/benjaminlab/Personal Website/Projects/pnw-supply-chain-dashboard/app/app.py`

**Step 6: Write pnw-supply-chain-dashboard README**

```markdown
# PNW Supply Chain Dashboard

[1-2 sentence description based on notebooks and app.py]

## What it does

- [Data fetching and processing from notebooks]
- [EDA findings]
- Interactive Streamlit dashboard showing [key metrics/visualizations]

## Tech stack

- Python · Streamlit · pandas · [other libs from requirements]

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env  # if applicable
```

Run the dashboard:
```bash
streamlit run app/app.py
```

Or explore the analysis notebooks first:
1. `notebooks/01_fetch_data.ipynb`
2. `notebooks/02_process.ipynb`
3. `notebooks/03_eda.ipynb`

## Status

Work in progress.
```

**Step 7: No commit here** — these files live in the project directories, not the portfolio repo. They'll be committed when the repos are created in Phase 2.

---

## Phase 2 — Push READMEs and create new repos

> Run these tasks sequentially (each depends on the previous completing).

---

### Task 2A: Verify GitHub credentials

**Step 1: Check git identity and SSH access**

```bash
git config --global user.name
git config --global user.email
ssh -T git@github.com
```

Expected: `Hi mossfunki! You've successfully authenticated...`

If SSH fails, try HTTPS. If neither works, stop and ask the user to set up credentials before continuing.

**Step 2: Check if gh CLI is available**

```bash
which gh && gh auth status
```

If `gh` is available, prefer it for repo creation in Tasks 2C–2E. If not, use GitHub API via curl or ask the user to create repos manually.

---

### Task 2B: Push READMEs to existing repos

For each of the 3 repos (Dashboards-Streamlit, webscraper, Interactive-Map):

**Step 1: Clone the repo into a temp directory**

```bash
cd /tmp
git clone git@github.com:mossfunki/Dashboards-Streamlit.git
```

**Step 2: Copy the draft README in**

```bash
cp "/Users/benjaminlab/Personal Website/mossfunki.github.io/docs/readmes/Dashboards-Streamlit-README.md" /tmp/Dashboards-Streamlit/README.md
```

**Step 3: Commit and push**

```bash
cd /tmp/Dashboards-Streamlit
git add README.md
git commit -m "docs: add README"
git push origin main
```

**Step 4: Verify on GitHub**

Check that `https://github.com/mossfunki/Dashboards-Streamlit` now shows the README.

**Step 5: Repeat for webscraper and Interactive-Map**

Same steps with paths substituted.

**Step 6: Clean up temp clones**

```bash
rm -rf /tmp/Dashboards-Streamlit /tmp/webscraper /tmp/Interactive-Map
```

---

### Task 2C: Create new repo — seattle-transit-equity

**Step 1: Create the repo on GitHub**

If `gh` is available:
```bash
gh repo create mossfunki/seattle-transit-equity --public --description "Transit equity analysis for Seattle using spatial data and Python notebooks"
```

If `gh` is not available, ask the user to create the repo at https://github.com/new with the name `seattle-transit-equity` (public, no auto-init), then continue.

**Step 2: Initialize git in the local project**

```bash
cd "/Users/benjaminlab/Personal Website/Projects/seattle-transit-equity"
git init
git add .
git commit -m "initial commit: transit equity analysis notebooks"
```

**Step 3: Push to GitHub**

```bash
git remote add origin git@github.com:mossfunki/seattle-transit-equity.git
git branch -M main
git push -u origin main
```

**Step 4: Verify**

Visit `https://github.com/mossfunki/seattle-transit-equity` and confirm README and notebooks are visible.

---

### Task 2D: Create new repo — seattle-last-mile-logistics

Same steps as Task 2C with:
- Repo name: `seattle-last-mile-logistics`
- Description: `Last-mile logistics network analysis and isochrone mapping for Seattle`
- Local path: `/Users/benjaminlab/Personal Website/Projects/seattle-last-mile-logistics`

---

### Task 2E: Create new repo — pnw-supply-chain-dashboard

Same steps as Task 2C with:
- Repo name: `pnw-supply-chain-dashboard`
- Description: `Supply chain analytics dashboard for the Pacific Northwest — Streamlit + Python`
- Local path: `/Users/benjaminlab/Personal Website/Projects/pnw-supply-chain-dashboard`

---

## Phase 3 — Update portfolio website

**Files:**
- Modify: `/Users/benjaminlab/Personal Website/mossfunki.github.io/projects.html`

---

### Task 3A: Add new filter tags

**Step 1: Read current projects.html**

Read `/Users/benjaminlab/Personal Website/mossfunki.github.io/projects.html` lines 62–67.

**Step 2: Update the filter bar**

Replace the existing `<div class="filter-bar">` block with:

```html
<div class="filter-bar">
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="gis">GIS</button>
  <button class="filter-btn" data-filter="analysis">Data Analysis</button>
  <button class="filter-btn" data-filter="visualization">Visualization</button>
  <button class="filter-btn" data-filter="supply-chain">Supply Chain</button>
  <button class="filter-btn" data-filter="ml">ML</button>
  <button class="filter-btn" data-filter="logistics">Logistics</button>
</div>
```

---

### Task 3B: Add project cards for existing GitHub repos

**Step 1: Add cards after the existing 3 Austin cards**

Add inside `<section class="projects-grid">`, after the last existing `</article>`:

```html
<article class="proj-card reveal" data-category="ml visualization">
  <h3>Machine Market Analyzer</h3>
  <p>Streamlit dashboard that uses TF-IDF and cosine similarity to compare eBay sold vs. active listings for lab and industrial equipment, surfacing pricing gaps and market velocity.</p>
  <div class="proj-actions">
    <a class="primary" href="https://github.com/mossfunki/Dashboards-Streamlit" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="proj-tag">ML · Streamlit · Python</div>
</article>

<article class="proj-card reveal" data-category="logistics supply-chain visualization">
  <h3>Logistics Route Monitor</h3>
  <p>Real-time logistics monitoring system that ingests route and traffic data via Google Sheets and presents an interactive Streamlit dashboard with cost, fuel, and delay KPIs.</p>
  <div class="proj-actions">
    <a class="primary" href="https://github.com/mossfunki/DLogis" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="proj-tag">Supply Chain · Streamlit · Python</div>
</article>

<article class="proj-card reveal" data-category="analysis">
  <h3>Biopharma Lead Scraper</h3>
  <p>Python scraper that collects and validates contact emails from biopharmaceutical company websites, with built-in rate limiting and direct Google Sheets export.</p>
  <div class="proj-actions">
    <a class="primary" href="https://github.com/mossfunki/webscraper" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="proj-tag">Python · BeautifulSoup · Automation</div>
</article>

<article class="proj-card reveal" data-category="gis visualization">
  <h3>Interactive Parcel Map</h3>
  <p>Standalone interactive web map visualizing filtered parcel data. Explore boundaries and attributes directly in-browser — no server required.</p>
  <div class="proj-actions">
    <a class="primary" href="https://github.com/mossfunki/Interactive-Map" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="proj-tag">GIS · HTML · Visualization</div>
</article>
```

---

### Task 3C: Add project cards for new local repos

**Step 1: Add cards for the 3 new repos (after Task 3B cards)**

```html
<article class="proj-card reveal" data-category="gis analysis supply-chain">
  <h3>Seattle Transit Equity Analysis</h3>
  <p>Spatial analysis of transit access equity across Seattle neighborhoods, combining GTFS data, demographic indicators, and GIS to surface coverage gaps and underserved areas.</p>
  <div class="proj-actions">
    <a class="primary" href="https://github.com/mossfunki/seattle-transit-equity" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="proj-tag">GIS · Python · Spatial Analysis</div>
</article>

<article class="proj-card reveal" data-category="gis logistics supply-chain">
  <h3>Seattle Last-Mile Logistics</h3>
  <p>Network analysis and isochrone mapping for last-mile delivery in Seattle, using OSMnx to model road network coverage and identify service area gaps by travel time.</p>
  <div class="proj-actions">
    <a class="primary" href="https://github.com/mossfunki/seattle-last-mile-logistics" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="proj-tag">Logistics · OSMnx · GIS</div>
</article>

<article class="proj-card reveal" data-category="supply-chain visualization analysis">
  <h3>PNW Supply Chain Dashboard</h3>
  <p>Interactive Streamlit dashboard for supply chain analytics in the Pacific Northwest — exploratory data analysis, processing pipelines, and live KPI views built on regional logistics data.</p>
  <div class="proj-actions">
    <a class="primary" href="https://github.com/mossfunki/pnw-supply-chain-dashboard" target="_blank" rel="noopener">GitHub</a>
  </div>
  <div class="proj-tag">Supply Chain · Streamlit · Python</div>
</article>
```

**Step 2: Update the `data-category` on the 3 existing Austin cards if needed**

No changes needed — existing cards use `gis`, `analysis`, `visualization` which are still valid filter values.

---

### Task 3D: Verify and commit the website changes

**Step 1: Open the site locally and check all 10 project cards appear**

Open `/Users/benjaminlab/Personal Website/mossfunki.github.io/projects.html` in a browser.

Verify:
- All 10 cards render correctly
- Filter buttons work (each filter shows the right subset)
- GitHub links are correct

**Step 2: Commit**

```bash
cd "/Users/benjaminlab/Personal Website/mossfunki.github.io"
git add projects.html
git commit -m "feat: add 7 GitHub project cards to projects page"
git push origin main
```

**Step 3: Verify live site**

Visit `https://mossfunki.github.io/projects.html` and confirm all cards are visible.

---

## Summary of commits expected

1. `docs: draft READMEs for Dashboards-Streamlit and webscraper` (portfolio repo)
2. `docs: draft README for Interactive-Map` (portfolio repo)
3. `docs: add README` × 3 (in each existing GitHub repo)
4. `initial commit: ...` × 3 (new repos for local projects)
5. `feat: add 7 GitHub project cards to projects page` (portfolio repo)
