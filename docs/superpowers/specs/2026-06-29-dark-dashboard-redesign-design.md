# Dark Data Dashboard Redesign
_2026-06-29_

## Goal

Rebuild mossfunki.github.io as a futuristic dark data dashboard — a Palantir/Bloomberg-style command center showcasing economic and financial analysis through interactive deck.gl maps and D3 charts. Replace the previous light minimal static HTML site with a Vite-bundled single-page app deployed to GitHub Pages.

## Audience

Recruiters and hiring managers for economics, data science, financial analysis, GIS, and commercial intelligence roles. The site must immediately read as a real analytical tool — not a portfolio template.

---

## Visual System

### Aesthetic
Dark data dashboard: deep navy background, glassmorphism floating panels, cyan + amber accent palette, GPU-rendered glowing map layers. Feels like mission control or an internal quant research tool.

### Color Tokens
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#080d1a` | Page base, map background |
| `--surface` | `#0f1629` | Sidebar, card bases |
| `--panel` | `rgba(15,22,41,0.72)` | Floating glass panels (backdrop-blur: 16px) |
| `--border` | `rgba(255,255,255,0.07)` | All borders |
| `--accent-cyan` | `#00d4ff` | Active nav, primary highlights, glows |
| `--accent-amber` | `#f59e0b` | Secondary data, financial flows |
| `--text` | `#e2e8f0` | Primary text |
| `--text-muted` | `#4a5568` | Labels, meta |
| `--success` | `#10b981` | Positive indicators |
| `--danger` | `#ef4444` | Risk / negative indicators |

### Typography
- UI: `Inter` (Google Fonts)
- Data labels, monospaced values: `JetBrains Mono` (Google Fonts)

### Signature Effects
- Floating panels: `backdrop-filter: blur(16px)` + `border: 1px solid var(--border)` + cyan border glow on hover
- Map arc layers: additive blending so overlapping arcs glow brighter at intersections
- Active sidebar item: `border-left: 2px solid var(--accent-cyan)` + faint background tint
- Stat card values: large monospaced number in cyan or amber depending on metric type

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (220px fixed)  │  MAIN VIEWPORT (flex-fill)        │
│                         │                                    │
│  ● Benjamin Lab         │  [Full-screen deck.gl map]        │
│                         │                                    │
│  — ANALYSIS MODULES —   │  ┌─────────┐  ┌──────────────┐   │
│                         │  │ Stat    │  │ Chart panel  │   │
│  ▸ Financial Flows      │  │ cards   │  │ (glass)      │   │
│    Real Estate          │  └─────────┘  └──────────────┘   │
│    Labor Markets        │                                    │
│    Risk Index           │  [Layer toggles, bottom-right]    │
│                         │                                    │
│  — — — — — — — — — —    │                                    │
│  [GitHub] [Resume]      │                                    │
└─────────────────────────────────────────────────────────────┘
```

- Sidebar: `220px` fixed left, full viewport height, `var(--surface)` background, right border
- Main viewport: `calc(100vw - 220px)`, full viewport height, map fills it entirely
- Floating stat cards: `position: absolute; top: 1.5rem; left: 1.5rem` — 2–3 cards stacked vertically
- Floating chart panel: `position: absolute; bottom: 3rem; right: 1.5rem` — ~320px wide
- Layer toggles: `position: absolute; bottom: 1.5rem; left: 1.5rem`

---

## Analysis Modules

Each module is a JS class implementing two methods:
- `getLayers()` → array of deck.gl layer instances
- `getChartConfig()` → config object consumed by the D3 chart panel

Switching modules calls `deckgl.setProps({ layers: module.getLayers() })` and re-renders the chart panel. The map, sidebar, stat cards, and chart panel chrome stay mounted — only content changes.

### Module 1 — Financial Flows

**Map layer:** `ArcLayer`
- Arcs between US metro areas representing capital/financial flows
- `getSourceColor`: cyan `[0, 212, 255]` for inflows
- `getTargetColor`: amber `[245, 158, 11]` for outflows
- `getWidth`: scaled to flow volume
- `parameters: { blendingMode: 'additive' }` — dense corridors glow
- Animation: arc dash offset animated via `requestAnimationFrame`

**Data:** `src/data/financial-flows.json`
- Schema: `{ arcs: [{ from: { name, lat, lon }, to: { name, lat, lon }, volume, direction }] }`
- Sourced from: Fed H.8 commercial bank credit data (public) + existing CI project repurposed as signal-flow data
- Prepared by: `scripts/prep_data.py`

**Stat cards:**
- Total Flow Volume (formatted as $B)
- Top Inflow Metro
- Top Outflow Metro

**Chart panel:** D3 horizontal bar chart — top 10 metros by net flow, ranked descending. Cyan bars for net positive, amber for net negative.

---

### Module 2 — Real Estate

**Map layer:** `ColumnLayer`
- One 3D column per county centroid
- `getElevation`: median home price appreciation % (scaled 0–50,000 for visual height)
- `getFillColor`: cool-to-hot ramp — blue (depreciation) → green (stable) → orange → red (rapid appreciation)
- Map camera pitched to 45° when this module is active (`viewState.pitch = 45`)

**Data:** `src/data/real-estate.json`
- Schema: `{ counties: [{ fips, name, state, lat, lon, price_index, yoy_change, price_history: [{date, value}] }] }`
- Sourced from: Zillow Research public county-level Home Value Index CSV (free, no API key)
- Austin Investment Map project data merged in
- Prepared by: `scripts/prep_data.py`

**Interaction:** Click a column → selected county FIPS stored in module state → chart panel updates to show that county's price history line chart

**Stat cards:**
- Median Price Change YoY (national)
- Hottest Market (highest appreciation county)
- Most Distressed (steepest decline county)

**Chart panel:** D3 line chart — price trajectory over time for selected county (defaults to national median on load). X axis: dates. Y axis: price index. Cyan line.

---

### Module 3 — Labor Markets

**Map layer:** `HexagonLayer`
- Hexagonal heatmap aggregated from point-level employment data
- `getElevation`: job density (count of workers per hex)
- `colorRange`: 6-step ramp from dark navy → bright cyan
- Radius: 40km hexagons
- Reuses existing Gig Economy Spatial Analysis project data

**Data:** `src/data/labor-markets.json`
- Schema: `{ points: [{ lat, lon, employment, median_wage, gig_share }] }`
- Sourced from: BLS Quarterly Census of Employment and Wages (QCEW), public
- Existing Gig Economy Spatial Analysis data merged in
- Prepared by: `scripts/prep_data.py`

**Stat cards:**
- National Unemployment Rate
- Median Wage
- Gig Economy Share

**Chart panel:** D3 scatter plot — median wage (Y) vs. cost-of-living index (X) by metro. Dots colored by gig share. Hover tooltip shows metro name.

---

### Module 4 — Risk Index

**Map layer:** `GeoJsonLayer`
- County-level choropleth from existing FEMA NRI + K-Means pipeline
- `getFillColor`: 5-color cluster palette matching previous spatial work
- `getLineWidth`: 0.5px white border between counties
- Hover tooltip: county name, risk score, cluster label

**Data:** `src/data/counties.geojson`
- Existing output from `scripts/update_map_data.py` (FEMA NRI + Census TIGER + K-Means)
- No changes needed — reuse as-is

**Stat cards:**
- High-Risk Counties (count)
- Avg Resilience Score
- Most Vulnerable State

**Chart panel:** D3 donut chart — cluster distribution (count of counties per cluster, colored by cluster palette). Clicking a segment filters the map to highlight that cluster.

---

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| Vite | ^5.x | Dev server + build bundler |
| deck.gl | ^9.x | GPU map layers (ArcLayer, ColumnLayer, HexagonLayer, GeoJsonLayer) |
| Mapbox GL JS | ^3.x | Dark basemap (`mapbox://styles/mapbox/dark-v11`), free tier |
| D3.js | ^7.x | All charts (bar, line, scatter, donut) |
| gh-pages | ^6.x | Deploy `dist/` to `gh-pages` branch |

No framework (React, Vue, etc.) — plain ES modules. Keeps bundle small and avoids hydration complexity for a static site.

---

## File Structure

```
mossfunki.github.io/
├── src/
│   ├── main.js                    # App entry: init map, sidebar, module router
│   ├── style.css                  # Design system (CSS variables, layout, components)
│   ├── modules/
│   │   ├── financial-flows.js     # ArcLayer + chart config
│   │   ├── real-estate.js         # ColumnLayer + chart config + click handler
│   │   ├── labor-markets.js       # HexagonLayer + chart config
│   │   └── risk-index.js          # GeoJsonLayer + chart config
│   ├── components/
│   │   ├── sidebar.js             # Nav rendering + module switching
│   │   ├── stat-cards.js          # Floating stat panel — updates per module
│   │   └── chart-panel.js         # D3 chart container — renders per module config
│   └── data/
│       ├── financial-flows.json
│       ├── real-estate.json
│       ├── labor-markets.json
│       └── counties.geojson
├── public/
│   └── index.html                 # Shell HTML — single div#app mount point
├── scripts/
│   ├── prep_data.py               # Downloads + normalizes all public datasets
│   └── requirements.txt
├── vite.config.js
└── package.json
```

---

## Data Preparation

`scripts/prep_data.py` is run once locally (and optionally on a GitHub Actions schedule). It:
1. Downloads Zillow county HVI CSV → normalizes to `real-estate.json`
2. Downloads BLS QCEW data → normalizes to `labor-markets.json`
3. Constructs financial flows from Fed H.8 data → `financial-flows.json`
4. Copies existing `counties.geojson` from previous pipeline output

Outputs are committed to `src/data/`. No runtime fetching of external APIs.

---

## Deployment

```
npm run build     → Vite outputs to dist/
npm run deploy    → gh-pages pushes dist/ to gh-pages branch
```

GitHub Pages is configured to serve from the `gh-pages` branch root. The Vite config sets `base: '/'` — the site lives at the root domain (`mossfunki.github.io`), not a subdirectory.

---

## Mapbox API Key

Mapbox free tier requires an access token. The token is:
- Stored in a `.env` file locally: `VITE_MAPBOX_TOKEN=pk.xxx`
- Added as a GitHub Actions secret `VITE_MAPBOX_TOKEN` for CI builds
- Never committed to the repo

---

## Testing

Each implementation task includes a verification step before moving on:
- After scaffold: dev server loads at `localhost:5173`, map renders, sidebar is visible
- After each module: module switches correctly, map layers render, stat cards update, chart panel renders
- After data prep: validate JSON shape against module schemas, confirm county count in GeoJSON
- After deploy: live site loads at `mossfunki.github.io`, all four modules work in production

---

## Out of Scope

- Backend server or database
- React/Vue/Svelte framework
- Real-time data feeds (static JSON sufficient for now)
- Mobile layout optimization (desktop-first for this phase)
- New analysis beyond the four existing modules
- Resume file update
