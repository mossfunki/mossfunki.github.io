# Dark Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild mossfunki.github.io as a futuristic dark data dashboard with four interactive analysis modules (Financial Flows, Real Estate, Labor Markets, Risk Index) using deck.gl GPU map layers, D3 charts, and Mapbox GL JS.

**Architecture:** Vite-bundled single-page app, no framework. Persistent sidebar nav swaps deck.gl layers and D3 charts between modules. All data served as static JSON/GeoJSON from `public/data/`. Deployed to GitHub Pages via gh-pages.

**Tech Stack:** Vite 5, deck.gl 9, Mapbox GL JS 3, D3 7, Vitest, gh-pages, Python 3 + pandas + requests (data prep)

## Global Constraints

- Node ≥ 18, Python ≥ 3.10
- `VITE_MAPBOX_TOKEN` must be set in `.env` locally and as a GitHub Actions secret for CI builds — never committed
- All data files live in `public/data/` and are fetched at runtime (not bundled) — large GeoJSON must not be imported statically
- Module class interface: every module implements `async load()`, `getLayers() → Layer[]`, `getStats() → Stats`, `getChartConfig() → ChartConfig | null`; may optionally set `viewState` property
- CSS custom properties only — no hardcoded color hex values in component files
- Vitest for JS unit tests; pytest for Python tests — run before every commit
- Commits are granular: one logical unit per commit

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `package.json` | Create | Deps + scripts |
| `vite.config.js` | Create | Build + Vitest config |
| `.env.example` | Create | Token template |
| `.gitignore` | Create/update | Exclude `.env`, `dist/`, `public/data/*.geojson` cache |
| `public/index.html` | Create | App shell — single mount point |
| `src/style.css` | Create | Full design system |
| `src/main.js` | Create | App entry: init map, overlay, module router |
| `src/components/sidebar.js` | Create | Nav + module switching |
| `src/components/stat-cards.js` | Create | Floating stat panel |
| `src/components/chart-panel.js` | Create | D3 chart container (bar/line/scatter/donut) |
| `src/modules/financial-flows.js` | Create | ArcLayer + net flow chart |
| `src/modules/real-estate.js` | Create | ColumnLayer + price history chart |
| `src/modules/labor-markets.js` | Create | HexagonLayer + wage scatter chart |
| `src/modules/risk-index.js` | Create | GeoJsonLayer + cluster donut chart |
| `src/modules/__tests__/financial-flows.test.js` | Create | Unit tests for normalizeArcs, computeNetFlows |
| `src/modules/__tests__/real-estate.test.js` | Create | Unit tests for normalizeCounties, appreciationColor |
| `src/modules/__tests__/labor-markets.test.js` | Create | Unit tests for normalizePoints |
| `src/modules/__tests__/risk-index.test.js` | Create | Unit tests for toRgb |
| `src/components/__tests__/sidebar.test.js` | Create | Unit tests for sidebar state |
| `scripts/prep_data.py` | Create | Download + normalize all datasets → public/data/ |
| `scripts/requirements.txt` | Create | Python deps |
| `scripts/tests/test_prep_data.py` | Create | pytest for normalize functions |
| `public/data/financial-flows.json` | Generate | Arc data (via prep script) |
| `public/data/real-estate.json` | Generate | Zillow county ZHVI (via prep script) |
| `public/data/labor-markets.json` | Generate | BLS county employment + metro wages (via prep script) |
| `public/data/counties.geojson` | Copy | FEMA NRI K-Means output from previous pipeline |
| `.github/workflows/deploy.yml` | Create | Build + deploy to gh-pages on push to main |

---

## Task 0: Clone repo and scaffold Vite project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `public/index.html`

- [ ] **Step 1: Clone the live repo**

```bash
git clone https://github.com/mossfunki/mossfunki.github.io.git /tmp/dashboard
cd /tmp/dashboard
```

- [ ] **Step 2: Archive old static HTML files**

```bash
mkdir -p archive
git mv index.html about.html projects.html intelligence.html style.css archive/ 2>/dev/null; true
git mv Ben-Resume.pdf archive/Ben-Resume.pdf 2>/dev/null; true
git commit -m "chore: archive old static HTML files before Vite migration" --allow-empty
```

- [ ] **Step 3: Init npm and install dependencies**

```bash
npm init -y
npm install mapbox-gl @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers @deck.gl/mapbox d3
npm install --save-dev vite vitest @vitest/coverage-v8 jsdom gh-pages
```

- [ ] **Step 4: Write `package.json` scripts block**

Replace the `"scripts"` section in `package.json` with:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "deploy": "npm run build && gh-pages -d dist"
}
```

- [ ] **Step 5: Write `vite.config.js`**

Create `/tmp/dashboard/vite.config.js`:

```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: { outDir: 'dist' },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

- [ ] **Step 6: Write `public/index.html`**

Create `/tmp/dashboard/public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Benjamin Lab — Analytics Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="app">
    <aside id="sidebar"></aside>
    <div id="main">
      <div id="map"></div>
      <div id="stat-cards"></div>
      <div id="chart-panel"></div>
      <div id="layer-toggles"></div>
    </div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 7: Write `.env.example`**

Create `/tmp/dashboard/.env.example`:

```
VITE_MAPBOX_TOKEN=pk.your_token_here
```

Then create your actual `.env` by copying and filling in your real Mapbox public token:

```bash
cp .env.example .env
# Edit .env and set VITE_MAPBOX_TOKEN=pk.<your real token>
```

- [ ] **Step 8: Write `.gitignore`**

Create `/tmp/dashboard/.gitignore`:

```
node_modules/
dist/
.env
public/data/_raw/
```

- [ ] **Step 9: Create required directories**

```bash
mkdir -p src/modules/__tests__ src/components/__tests__ public/data scripts/tests
```

- [ ] **Step 10: Commit scaffold**

```bash
cd /tmp/dashboard
git add package.json vite.config.js public/index.html .env.example .gitignore
git commit -m "feat: scaffold Vite project — deps, config, HTML shell"
```

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in Nms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` — you should see a blank dark page (no content yet). Stop server with Ctrl+C.

---

## Task 1: Design system

**Files:**
- Create: `src/style.css`

- [ ] **Step 1: Write `src/style.css`**

Create `/tmp/dashboard/src/style.css`:

```css
/* === TOKENS === */
:root {
  --bg: #080d1a;
  --surface: #0f1629;
  --panel: rgba(15, 22, 41, 0.72);
  --border: rgba(255, 255, 255, 0.07);
  --border-glow: rgba(0, 212, 255, 0.3);
  --accent-cyan: #00d4ff;
  --accent-amber: #f59e0b;
  --text: #e2e8f0;
  --text-muted: #4a5568;
  --success: #10b981;
  --danger: #ef4444;
  --font-ui: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --sidebar-w: 220px;
}

/* === RESET === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; }
body { background: var(--bg); color: var(--text); font-family: var(--font-ui); font-size: 14px; -webkit-font-smoothing: antialiased; }
a { color: var(--accent-cyan); text-decoration: none; }
a:hover { opacity: 0.8; }

/* === LAYOUT === */
#app { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
#sidebar { width: var(--sidebar-w); min-width: var(--sidebar-w); height: 100vh; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 10; }
#main { position: relative; flex: 1; height: 100vh; overflow: hidden; }
#map { position: absolute; inset: 0; }

/* === SIDEBAR === */
.sidebar-brand {
  padding: 1.25rem 1.25rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-cyan);
  font-family: var(--font-mono);
  border-bottom: 1px solid var(--border);
}
.sidebar-section-label {
  padding: 1rem 1.25rem 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.sidebar-btn {
  display: block;
  width: 100%;
  padding: 0.6rem 1.25rem;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  color: var(--text-muted);
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.sidebar-btn:hover { color: var(--text); background: rgba(255,255,255,0.03); }
.sidebar-btn--active { color: var(--accent-cyan); border-left-color: var(--accent-cyan); background: rgba(0,212,255,0.05); }
.sidebar-nav { flex: 1; overflow-y: auto; }
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.sidebar-footer a { color: var(--text-muted); }
.sidebar-footer a:hover { color: var(--text); opacity: 1; }

/* === GLASS PANELS === */
.glass-panel {
  background: var(--panel);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: 6px;
}
.glass-panel:hover { border-color: var(--border-glow); }

/* === STAT CARDS === */
#stat-cards {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 5;
  pointer-events: none;
}
.stat-card {
  padding: 0.75rem 1rem;
  min-width: 160px;
}
.stat-label {
  font-size: 0.62rem;
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}
.stat-value {
  font-size: 1.1rem;
  font-family: var(--font-mono);
  font-weight: 600;
  line-height: 1.2;
}
.stat-value--cyan   { color: var(--accent-cyan); }
.stat-value--amber  { color: var(--accent-amber); }
.stat-value--success { color: var(--success); }
.stat-value--danger  { color: var(--danger); }

/* === CHART PANEL === */
#chart-panel {
  position: absolute;
  bottom: 3rem;
  right: 1.5rem;
  width: 300px;
  padding: 1rem;
  z-index: 5;
}
.chart-title {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.6rem;
}
#chart-panel svg text { fill: var(--text-muted); font-size: 10px; font-family: var(--font-mono); }
#chart-panel svg .domain, #chart-panel svg .tick line { stroke: var(--border); }

/* === LOADING === */
#loading {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.4rem 1rem;
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
#loading.visible { opacity: 1; }

/* === MAPBOX OVERRIDES === */
.mapboxgl-ctrl-logo { display: none !important; }
.mapboxgl-ctrl-attrib { display: none !important; }
```

- [ ] **Step 2: Verify styles load**

```bash
npm run dev
```

Open `http://localhost:5173`. Page should show dark background (`#080d1a`). No layout yet — that's expected.

- [ ] **Step 3: Commit**

```bash
cd /tmp/dashboard
git add src/style.css
git commit -m "feat: add dark dashboard design system"
```

---

## Task 2: App shell

**Files:**
- Create: `src/main.js`

**Interfaces:**
- Produces: `activateModule(id: string): Promise<void>` — used by sidebar click handler
- Produces: `window` event `'re-module-update'` — listened to by main.js to re-render chart without full module swap (used by real-estate click handler)
- Consumes: `initSidebar(moduleIds, onActivate)` from `./components/sidebar.js`
- Consumes: `initStatCards(el)`, `updateStatCards(stats)` from `./components/stat-cards.js`
- Consumes: `initChartPanel(el)`, `renderChart(config)` from `./components/chart-panel.js`
- Consumes: module classes from `./modules/*.js`

- [ ] **Step 1: Write `src/main.js`**

Create `/tmp/dashboard/src/main.js`:

```js
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { initSidebar, setActiveModule } from './components/sidebar.js';
import { initStatCards, updateStatCards } from './components/stat-cards.js';
import { initChartPanel, renderChart } from './components/chart-panel.js';
import FinancialFlowsModule from './modules/financial-flows.js';
import RealEstateModule from './modules/real-estate.js';
import LaborMarketsModule from './modules/labor-markets.js';
import RiskIndexModule from './modules/risk-index.js';
import './style.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const INITIAL_VIEW = { center: [-98.35, 39.5], zoom: 4, pitch: 0, bearing: 0 };

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  ...INITIAL_VIEW,
  antialias: true
});

const overlay = new MapboxOverlay({ layers: [] });
map.addControl(overlay);

const MODULES = {
  'financial-flows': new FinancialFlowsModule(),
  'real-estate':     new RealEstateModule(),
  'labor-markets':   new LaborMarketsModule(),
  'risk-index':      new RiskIndexModule()
};

const MODULE_ORDER = ['financial-flows', 'real-estate', 'labor-markets', 'risk-index'];
let currentModuleId = null;

const loading = document.createElement('div');
loading.id = 'loading';
loading.textContent = 'Loading…';
document.getElementById('main').appendChild(loading);

async function activateModule(id) {
  const module = MODULES[id];
  if (!module) return;
  currentModuleId = id;
  setActiveModule(id);
  loading.classList.add('visible');
  try {
    await module.load();
    overlay.setProps({ layers: module.getLayers() });
    updateStatCards(module.getStats());
    renderChart(module.getChartConfig());
    if (module.viewState) {
      map.easeTo({ ...module.viewState, duration: 800 });
    }
  } catch (err) {
    console.error(`Module "${id}" failed to load:`, err);
  } finally {
    loading.classList.remove('visible');
  }
}

window.addEventListener('re-module-update', () => {
  const module = MODULES[currentModuleId];
  if (module) {
    overlay.setProps({ layers: module.getLayers() });
    renderChart(module.getChartConfig());
  }
});

map.on('load', () => {
  initSidebar(MODULE_ORDER, activateModule);
  initStatCards(document.getElementById('stat-cards'));
  initChartPanel(document.getElementById('chart-panel'));
  activateModule('financial-flows');
});
```

- [ ] **Step 2: Run dev server and verify map loads**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected:
- Dark Mapbox basemap fills the right panel
- Sidebar div is on the left (no content yet — components come next)
- No console errors except "Module load failed" for missing data (that's fine for now)

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: add app shell — Mapbox + MapboxOverlay + module router"
```

---

## Task 3: UI components — sidebar, stat cards, chart panel

**Files:**
- Create: `src/components/sidebar.js`
- Create: `src/components/stat-cards.js`
- Create: `src/components/chart-panel.js`
- Create: `src/components/__tests__/sidebar.test.js`

**Interfaces:**
- `initSidebar(moduleIds: string[], onActivate: (id: string) => void): void`
- `setActiveModule(id: string): void`
- `getActiveModule(): string | null`
- `initStatCards(el: HTMLElement): void`
- `updateStatCards(stats: { cards: Array<{ label: string, value: string, accent: string }> }): void`
- `initChartPanel(el: HTMLElement): void`
- `renderChart(config: { type: 'bar'|'line'|'scatter'|'donut', title: string, data: any[] } | null): void`

- [ ] **Step 1: Write the failing sidebar test**

Create `/tmp/dashboard/src/components/__tests__/sidebar.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

// jsdom is the environment — we can manipulate the DOM
document.body.innerHTML = '<aside id="sidebar"></aside>';

const { initSidebar, setActiveModule, getActiveModule } = await import('../sidebar.js');

describe('sidebar', () => {
  beforeEach(() => {
    document.body.innerHTML = '<aside id="sidebar"></aside>';
    vi.resetModules();
  });

  it('renders a button for each module id', async () => {
    const { initSidebar } = await import('../sidebar.js');
    initSidebar(['financial-flows', 'risk-index'], vi.fn());
    const buttons = document.querySelectorAll('.sidebar-btn');
    expect(buttons.length).toBe(2);
  });

  it('calls onActivate with the module id when a button is clicked', async () => {
    const { initSidebar } = await import('../sidebar.js');
    const onActivate = vi.fn();
    initSidebar(['financial-flows'], onActivate);
    document.querySelector('[data-module="financial-flows"]').click();
    expect(onActivate).toHaveBeenCalledWith('financial-flows');
  });

  it('sets active class on the correct button', async () => {
    const { initSidebar, setActiveModule } = await import('../sidebar.js');
    initSidebar(['financial-flows', 'risk-index'], vi.fn());
    setActiveModule('risk-index');
    const active = document.querySelectorAll('.sidebar-btn--active');
    expect(active.length).toBe(1);
    expect(active[0].dataset.module).toBe('risk-index');
  });

  it('getActiveModule returns the last activated id', async () => {
    const { initSidebar, setActiveModule, getActiveModule } = await import('../sidebar.js');
    initSidebar(['financial-flows', 'risk-index'], vi.fn());
    setActiveModule('risk-index');
    expect(getActiveModule()).toBe('risk-index');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../sidebar.js'`

- [ ] **Step 3: Write `src/components/sidebar.js`**

```js
const MODULE_LABELS = {
  'financial-flows': 'Financial Flows',
  'real-estate':     'Real Estate',
  'labor-markets':   'Labor Markets',
  'risk-index':      'Risk Index'
};

let _onActivate = null;
let _activeId = null;

export function initSidebar(moduleIds, onActivate) {
  _onActivate = onActivate;
  const aside = document.getElementById('sidebar');
  aside.innerHTML = `
    <div class="sidebar-brand">Benjamin Lab</div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">Analysis Modules</div>
      ${moduleIds.map(id => `
        <button class="sidebar-btn" data-module="${id}">
          ${MODULE_LABELS[id] || id}
        </button>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <a href="https://github.com/mossfunki" target="_blank" rel="noopener">GitHub</a>
      <a href="archive/Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a>
    </div>
  `;
  aside.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_onActivate) _onActivate(btn.dataset.module);
    });
  });
}

export function setActiveModule(id) {
  _activeId = id;
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.classList.toggle('sidebar-btn--active', btn.dataset.module === id);
  });
}

export function getActiveModule() {
  return _activeId;
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test
```

Expected: all sidebar tests PASS.

- [ ] **Step 5: Write `src/components/stat-cards.js`**

```js
let _container = null;

export function initStatCards(el) {
  _container = el;
}

export function updateStatCards({ cards }) {
  if (!_container) return;
  _container.innerHTML = cards.map(card => `
    <div class="stat-card glass-panel">
      <div class="stat-label">${card.label}</div>
      <div class="stat-value stat-value--${card.accent}">${card.value}</div>
    </div>
  `).join('');
}
```

- [ ] **Step 6: Write `src/components/chart-panel.js`**

```js
import * as d3 from 'd3';

let _container = null;
let _svg = null;
let _title = null;
const W = 268;
const H = 180;

export function initChartPanel(el) {
  _container = el;
  el.classList.add('glass-panel');
  el.innerHTML = `<div class="chart-title"></div><svg width="${W}" height="${H}"></svg>`;
  _title = el.querySelector('.chart-title');
  _svg = d3.select(el.querySelector('svg'));
}

export function renderChart(config) {
  if (!_svg || !config) return;
  _title.textContent = config.title;
  _svg.selectAll('*').remove();

  switch (config.type) {
    case 'bar':     _renderBar(config);     break;
    case 'line':    _renderLine(config);    break;
    case 'scatter': _renderScatter(config); break;
    case 'donut':   _renderDonut(config);   break;
  }
}

function _renderBar({ data }) {
  // data: Array<{ name: string, value: number }>
  const m = { top: 8, right: 16, bottom: 8, left: 72 };
  const w = W - m.left - m.right;
  const h = H - m.top - m.bottom;
  const g = _svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const extent = d3.extent(data, d => d.value);
  const x = d3.scaleLinear().domain([Math.min(0, extent[0]), Math.max(0, extent[1])]).range([0, w]);
  const y = d3.scaleBand().domain(data.map(d => d.name)).range([0, h]).padding(0.25);

  g.selectAll('rect').data(data).join('rect')
    .attr('y', d => y(d.name))
    .attr('height', y.bandwidth())
    .attr('x', d => d.value < 0 ? x(d.value) : x(0))
    .attr('width', d => Math.abs(x(d.value) - x(0)))
    .attr('fill', d => d.value >= 0 ? 'var(--accent-cyan)' : 'var(--accent-amber)')
    .attr('rx', 2);

  g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', h)
    .attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1);

  g.append('g').call(d3.axisLeft(y).tickSize(0).tickPadding(6))
    .select('.domain').remove();
}

function _renderLine({ data }) {
  // data: Array<{ date: Date, value: number }>
  if (!data.length) return;
  const m = { top: 8, right: 16, bottom: 24, left: 44 };
  const w = W - m.left - m.right;
  const h = H - m.top - m.bottom;
  const g = _svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, w]);
  const yExtent = d3.extent(data, d => d.value);
  const y = d3.scaleLinear().domain([yExtent[0] * 0.95, yExtent[1] * 1.05]).range([h, 0]);

  g.append('path').datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'var(--accent-cyan)')
    .attr('stroke-width', 2)
    .attr('d', d3.line().x(d => x(d.date)).y(d => y(d.value)).curve(d3.curveMonotoneX));

  // Area fill
  g.append('path').datum(data)
    .attr('fill', 'url(#line-grad)')
    .attr('d', d3.area().x(d => x(d.date)).y0(h).y1(d => y(d.value)).curve(d3.curveMonotoneX));

  const defs = _svg.append('defs');
  const grad = defs.append('linearGradient').attr('id', 'line-grad').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
  grad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--accent-cyan)').attr('stop-opacity', 0.2);
  grad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--accent-cyan)').attr('stop-opacity', 0);

  g.append('g').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat('%b %y')));
  g.append('g')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${(d / 1000).toFixed(0)}k`));
  g.selectAll('.domain').remove();
}

function _renderScatter({ data }) {
  // data: Array<{ name: string, wage: number, col: number, gigShare: number }>
  if (!data.length) return;
  const m = { top: 8, right: 16, bottom: 24, left: 44 };
  const w = W - m.left - m.right;
  const h = H - m.top - m.bottom;
  const g = _svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.col)).nice().range([0, w]);
  const y = d3.scaleLinear().domain(d3.extent(data, d => d.wage)).nice().range([h, 0]);
  const color = d3.scaleSequential(d3.interpolateCool).domain([0, 1]);

  g.selectAll('circle').data(data).join('circle')
    .attr('cx', d => x(d.col))
    .attr('cy', d => y(d.wage))
    .attr('r', 4)
    .attr('fill', d => color(d.gigShare))
    .attr('opacity', 0.75);

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(4));
  g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${(d / 1000).toFixed(0)}k`));
  g.selectAll('.domain').remove();
}

function _renderDonut({ data }) {
  // data: Array<{ label: string, count: number, color: string }>
  const radius = Math.min(W, H) / 2 - 24;
  const g = _svg.append('g').attr('transform', `translate(${W / 2},${H / 2})`);

  const pie = d3.pie().value(d => d.count).sort(null);
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

  g.selectAll('path').data(pie(data)).join('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', 'var(--bg)')
    .attr('stroke-width', 2);

  // Labels on large slices
  g.selectAll('text').data(pie(data)).join('text')
    .filter(d => (d.endAngle - d.startAngle) > 0.5)
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('font-size', 9)
    .attr('fill', 'rgba(255,255,255,0.7)')
    .text(d => d.data.label);
}
```

- [ ] **Step 7: Run dev server and verify UI renders**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected:
- Sidebar shows "Benjamin Lab" brand + "Analysis Modules" label + 4 module buttons
- Clicking a module button highlights it with cyan left border
- Stat cards area is visible top-left (empty until modules load)
- Chart panel is visible bottom-right (empty until modules load)

- [ ] **Step 8: Commit**

```bash
git add src/components/sidebar.js src/components/stat-cards.js src/components/chart-panel.js src/components/__tests__/sidebar.test.js
git commit -m "feat: add sidebar, stat-cards, and chart-panel components"
```

---

## Task 4: Data prep script

**Files:**
- Create: `scripts/prep_data.py`
- Create: `scripts/requirements.txt`
- Create: `scripts/tests/test_prep_data.py`

**Interfaces:**
- `normalize_zillow_csv(df: pd.DataFrame) → list[dict]` — testable pure function
- `make_financial_flows() → dict` — returns the full JSON object
- `normalize_bls_laus(county_df: pd.DataFrame, metro_wages: list[dict]) → dict` — testable pure function
- Outputs: `public/data/real-estate.json`, `public/data/financial-flows.json`, `public/data/labor-markets.json`

- [ ] **Step 1: Write `scripts/requirements.txt`**

```
pandas==2.2.2
requests==2.32.3
```

- [ ] **Step 2: Install Python deps**

```bash
pip install -r /tmp/dashboard/scripts/requirements.txt
```

- [ ] **Step 3: Write the failing tests**

Create `/tmp/dashboard/scripts/tests/test_prep_data.py`:

```python
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
```

- [ ] **Step 4: Run tests — expect failure**

```bash
cd /tmp/dashboard/scripts/tests
python -m pytest test_prep_data.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'prep_data'`

- [ ] **Step 5: Write `scripts/prep_data.py`**

Create `/tmp/dashboard/scripts/prep_data.py`:

```python
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
        if len(history) < 2:
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
    re = fetch_real_estate()
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
```

- [ ] **Step 6: Run Python tests — expect pass**

```bash
cd /tmp/dashboard/scripts/tests
python -m pytest test_prep_data.py -v
```

Expected:
```
test_prep_data.py::test_normalize_zillow_csv_basic_schema PASSED
test_prep_data.py::test_normalize_zillow_csv_yoy_change_computed PASSED
test_prep_data.py::test_normalize_zillow_csv_fips_is_5_digits PASSED
test_prep_data.py::test_make_financial_flows_schema PASSED
test_prep_data.py::test_normalize_bls_laus_schema PASSED
5 passed
```

- [ ] **Step 7: Run the full prep script to generate data files**

```bash
cd /tmp/dashboard
python scripts/prep_data.py
```

Expected output:
```
=== prep_data.py ===
Downloading Zillow ZHVI county data...
  → N counties with coordinates
financial-flows.json  → 20 arcs
real-estate.json      → N counties
labor-markets.json    → 20 points, 20 metros
counties.geojson      → NOT FOUND (or copied if available)
```

Verify outputs:
```bash
ls -lh /tmp/dashboard/public/data/
```

Expected: `financial-flows.json`, `real-estate.json`, `labor-markets.json` all present.

- [ ] **Step 8: Commit**

```bash
git add scripts/prep_data.py scripts/requirements.txt scripts/tests/test_prep_data.py public/data/financial-flows.json public/data/real-estate.json public/data/labor-markets.json
git commit -m "feat: add data prep script + generate financial-flows, real-estate, labor-markets JSON"
```

---

## Task 5: Risk Index module

**Files:**
- Create: `src/modules/risk-index.js`
- Create: `src/modules/__tests__/risk-index.test.js`

**Interfaces:**
- `toRgb(clusterId: number): [number, number, number]` — exported pure function, testable
- `default class RiskIndexModule` — implements `async load()`, `getLayers()`, `getStats()`, `getChartConfig()`

- [ ] **Step 1: Write the failing test**

Create `/tmp/dashboard/src/modules/__tests__/risk-index.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toRgb } from '../risk-index.js';

describe('toRgb', () => {
  it('returns a 3-element array for valid cluster ids', () => {
    for (let i = 0; i <= 4; i++) {
      const rgb = toRgb(i);
      expect(rgb).toHaveLength(3);
      rgb.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
    }
  });

  it('returns a fallback for unknown cluster id', () => {
    const rgb = toRgb(99);
    expect(rgb).toHaveLength(3);
  });
});

describe('RiskIndexModule', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: { name: 'Travis', state: 'TX', risk_score: 45, resl_score: 60, cluster_id: 2 } },
          { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: { name: 'King', state: 'WA', risk_score: 20, resl_score: 80, cluster_id: 0 } },
        ]
      })
    });
  });

  it('getLayers returns an empty array before load()', async () => {
    const { default: RiskIndexModule } = await import('../risk-index.js');
    const mod = new RiskIndexModule();
    expect(mod.getLayers()).toEqual([]);
  });

  it('getStats returns correct card count after load()', async () => {
    const { default: RiskIndexModule } = await import('../risk-index.js');
    const mod = new RiskIndexModule();
    await mod.load();
    const stats = mod.getStats();
    expect(stats.cards).toHaveLength(3);
    expect(stats.cards[0].label).toBe('High-Risk Counties');
  });

  it('getChartConfig returns donut type after load()', async () => {
    const { default: RiskIndexModule } = await import('../risk-index.js');
    const mod = new RiskIndexModule();
    await mod.load();
    const config = mod.getChartConfig();
    expect(config.type).toBe('donut');
    expect(config.data).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../risk-index.js'`

- [ ] **Step 3: Write `src/modules/risk-index.js`**

```js
import { GeoJsonLayer } from '@deck.gl/layers';

const CLUSTER_COLORS = {
  0: [34,  197,  94],   // green  — low risk / high resilience
  1: [134, 239, 172],   // mint   — low-moderate
  2: [245, 158,  11],   // amber  — moderate / mixed
  3: [239,  68,  68],   // red    — high risk / low resilience
  4: [ 59, 130, 246],   // blue   — coastal / weather-exposed
};

const CLUSTER_LABELS = {
  0: 'Low Risk',
  1: 'Low-Mod',
  2: 'Moderate',
  3: 'High Risk',
  4: 'Coastal',
};

export function toRgb(clusterId) {
  return CLUSTER_COLORS[clusterId] || [100, 100, 100];
}

export default class RiskIndexModule {
  constructor() {
    this._geojson = null;
    this.viewState = null;
  }

  async load() {
    if (this._geojson) return;
    const r = await fetch('./data/counties.geojson');
    if (!r.ok) throw new Error(`counties.geojson fetch failed: ${r.status}`);
    this._geojson = await r.json();
  }

  getLayers() {
    if (!this._geojson) return [];
    return [
      new GeoJsonLayer({
        id: 'risk-index-geojson',
        data: this._geojson,
        filled: true,
        stroked: true,
        getFillColor: f => [...toRgb(f.properties.cluster_id), 180],
        getLineColor: [255, 255, 255, 20],
        getLineWidth: 500,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 50],
      }),
    ];
  }

  getStats() {
    if (!this._geojson) return { cards: [] };
    const features = this._geojson.features;
    const highRisk = features.filter(f => (f.properties.risk_score || 0) > 50).length;
    const avgResilience = features.reduce((s, f) => s + (f.properties.resl_score || 0), 0) / features.length;
    const byState = {};
    features.forEach(f => {
      const st = f.properties.state || 'XX';
      byState[st] = (byState[st] || 0) + (f.properties.risk_score || 0);
    });
    const mostVulnerable = Object.entries(byState).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return {
      cards: [
        { label: 'High-Risk Counties',    value: String(highRisk),              accent: 'danger' },
        { label: 'Avg Resilience Score',  value: avgResilience.toFixed(1),       accent: 'cyan'   },
        { label: 'Most Vulnerable State', value: mostVulnerable,                 accent: 'amber'  },
      ],
    };
  }

  getChartConfig() {
    if (!this._geojson) return null;
    const data = [0, 1, 2, 3, 4].map(id => ({
      label: CLUSTER_LABELS[id],
      count: this._geojson.features.filter(f => f.properties.cluster_id === id).length,
      color: `rgb(${CLUSTER_COLORS[id].join(',')})`,
    }));
    return { type: 'donut', title: 'Cluster Distribution', data };
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test
```

Expected: all risk-index tests PASS.

- [ ] **Step 5: Verify in browser (requires counties.geojson)**

If `public/data/counties.geojson` is not yet present, copy it from the previous spatial pipeline:

```bash
# If you have the output from the previous pipeline:
cp /path/to/previous/data/counties.geojson /tmp/dashboard/public/data/

# Or run the previous pipeline script:
# python /tmp/dashboard/scripts/update_map_data.py  (if it exists)
```

```bash
npm run dev
```

Open `http://localhost:5173`. Click "Risk Index" in the sidebar. Expected:
- County choropleth renders on the dark satellite/dark basemap
- Stat cards show High-Risk Counties count, Avg Resilience, Most Vulnerable State
- Chart panel shows donut with 5 colored segments

- [ ] **Step 6: Commit**

```bash
git add src/modules/risk-index.js src/modules/__tests__/risk-index.test.js
git commit -m "feat: add Risk Index module — GeoJsonLayer + cluster donut chart"
```

---

## Task 6: Financial Flows module

**Files:**
- Create: `src/modules/financial-flows.js`
- Create: `src/modules/__tests__/financial-flows.test.js`

**Interfaces:**
- `normalizeArcs(rawArcs: array) → array` — exported pure function
- `computeNetFlows(arcs: array) → Array<{ name, value }>` — exported pure function
- `default class FinancialFlowsModule`

- [ ] **Step 1: Write the failing test**

Create `/tmp/dashboard/src/modules/__tests__/financial-flows.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeArcs, computeNetFlows } from '../financial-flows.js';

const RAW_ARCS = [
  { from: { name: 'NYC', lat: 40.71, lon: -74.01 }, to: { name: 'LA', lat: 34.05, lon: -118.24 }, volume: 95e9, direction: 'in' },
  { from: { name: 'Boston', lat: 42.36, lon: -71.06 }, to: { name: 'NYC', lat: 40.71, lon: -74.01 }, volume: 62e9, direction: 'out' },
];

describe('normalizeArcs', () => {
  it('converts lat/lon to [lon, lat] coordinates', () => {
    const result = normalizeArcs(RAW_ARCS);
    expect(result[0].from.coordinates).toEqual([-74.01, 40.71]);
    expect(result[0].to.coordinates).toEqual([-118.24, 34.05]);
  });

  it('preserves volume and direction', () => {
    const result = normalizeArcs(RAW_ARCS);
    expect(result[0].volume).toBe(95e9);
    expect(result[0].direction).toBe('in');
  });

  it('preserves metro names', () => {
    const result = normalizeArcs(RAW_ARCS);
    expect(result[0].from.name).toBe('NYC');
    expect(result[0].to.name).toBe('LA');
  });
});

describe('computeNetFlows', () => {
  it('produces net flow per metro sorted descending', () => {
    const arcs = normalizeArcs(RAW_ARCS);
    const result = computeNetFlows(arcs);
    expect(result.length).toBeGreaterThan(0);
    // First item should have higher or equal value than second
    if (result.length > 1) {
      expect(result[0].value).toBeGreaterThanOrEqual(result[1].value);
    }
  });

  it('sums inflows as positive, outflows as negative', () => {
    const arcs = normalizeArcs([
      { from: { name: 'A', lat: 0, lon: 0 }, to: { name: 'B', lat: 1, lon: 1 }, volume: 10e9, direction: 'in' },
      { from: { name: 'B', lat: 1, lon: 1 }, to: { name: 'C', lat: 2, lon: 2 }, volume: 5e9,  direction: 'out' },
    ]);
    const net = computeNetFlows(arcs);
    const b = net.find(d => d.name === 'B');
    expect(b?.value).toBe(-5e9);
  });
});

describe('FinancialFlowsModule', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ arcs: RAW_ARCS })
    });
  });

  it('getLayers returns empty before load()', async () => {
    const { default: FinancialFlowsModule } = await import('../financial-flows.js');
    const mod = new FinancialFlowsModule();
    expect(mod.getLayers()).toEqual([]);
  });

  it('getStats returns 3 cards after load()', async () => {
    const { default: FinancialFlowsModule } = await import('../financial-flows.js');
    const mod = new FinancialFlowsModule();
    await mod.load();
    expect(mod.getStats().cards).toHaveLength(3);
  });

  it('getChartConfig returns bar type after load()', async () => {
    const { default: FinancialFlowsModule } = await import('../financial-flows.js');
    const mod = new FinancialFlowsModule();
    await mod.load();
    expect(mod.getChartConfig().type).toBe('bar');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../financial-flows.js'`

- [ ] **Step 3: Write `src/modules/financial-flows.js`**

```js
import { ArcLayer } from '@deck.gl/layers';

export function normalizeArcs(rawArcs) {
  return rawArcs.map(a => ({
    from:      { name: a.from.name, coordinates: [a.from.lon, a.from.lat] },
    to:        { name: a.to.name,   coordinates: [a.to.lon,   a.to.lat]   },
    volume:    a.volume,
    direction: a.direction,
  }));
}

export function computeNetFlows(arcs) {
  const net = {};
  arcs.forEach(a => {
    if (a.direction === 'in') {
      net[a.to.name]   = (net[a.to.name]   || 0) + a.volume;
    } else {
      net[a.from.name] = (net[a.from.name] || 0) - a.volume;
    }
  });
  return Object.entries(net)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export default class FinancialFlowsModule {
  constructor() {
    this._arcs = null;
    this.viewState = null;
  }

  async load() {
    if (this._arcs) return;
    const r = await fetch('./data/financial-flows.json');
    if (!r.ok) throw new Error(`financial-flows.json fetch failed: ${r.status}`);
    const data = await r.json();
    this._arcs = normalizeArcs(data.arcs);
  }

  getLayers() {
    if (!this._arcs) return [];
    return [
      new ArcLayer({
        id: 'financial-flows-arc',
        data: this._arcs,
        getSourcePosition: d => d.from.coordinates,
        getTargetPosition: d => d.to.coordinates,
        getSourceColor:    d => d.direction === 'in' ? [0, 212, 255, 200] : [245, 158, 11, 200],
        getTargetColor:    d => d.direction === 'in' ? [0, 212, 255,  60] : [245, 158, 11,  60],
        getWidth:          d => Math.max(1, Math.sqrt(d.volume / 4e9)),
        greatCircle: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 80],
      }),
    ];
  }

  getStats() {
    if (!this._arcs) return { cards: [] };
    const total   = this._arcs.reduce((s, a) => s + a.volume, 0);
    const inflows = [...this._arcs].filter(a => a.direction === 'in').sort((a, b) => b.volume - a.volume);
    const outflows= [...this._arcs].filter(a => a.direction === 'out').sort((a, b) => b.volume - a.volume);
    return {
      cards: [
        { label: 'Total Flow Volume', value: `$${(total / 1e12).toFixed(2)}T`, accent: 'cyan'  },
        { label: 'Top Inflow Metro',  value: inflows[0]?.to.name   || '—',     accent: 'cyan'  },
        { label: 'Top Outflow Metro', value: outflows[0]?.from.name || '—',     accent: 'amber' },
      ],
    };
  }

  getChartConfig() {
    if (!this._arcs) return null;
    const net = computeNetFlows(this._arcs).slice(0, 10);
    return {
      type:  'bar',
      title: 'Net Flow by Metro ($B)',
      data:  net.map(d => ({ name: d.name, value: +(d.value / 1e9).toFixed(1) })),
    };
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test
```

Expected: all financial-flows tests PASS.

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. "Financial Flows" should be active by default. Expected:
- Great-circle arcs render between US metros (cyan = inflows, amber = outflows)
- Arc width varies by volume
- Stat cards show total volume, top inflow/outflow metros
- Chart panel shows horizontal bar chart of net flows by metro

- [ ] **Step 6: Commit**

```bash
git add src/modules/financial-flows.js src/modules/__tests__/financial-flows.test.js
git commit -m "feat: add Financial Flows module — ArcLayer + net flow bar chart"
```

---

## Task 7: Real Estate module

**Files:**
- Create: `src/modules/real-estate.js`
- Create: `src/modules/__tests__/real-estate.test.js`

**Interfaces:**
- `normalizeCounties(rawCounties: array) → array` — exported pure function
- `appreciationColor(yoy: number) → [number, number, number, number]` — exported pure function
- `getElevationScale(counties: array) → number` — exported pure function
- `default class RealEstateModule`

- [ ] **Step 1: Write the failing test**

Create `/tmp/dashboard/src/modules/__tests__/real-estate.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeCounties, appreciationColor, getElevationScale } from '../real-estate.js';

const RAW = [
  { fips: '48453', name: 'Travis County', state: 'TX', lat: 30.27, lon: -97.74,
    yoy_change: 8.5, price_history: [{ date: '2023-01-31', value: 400000 }, { date: '2024-01-31', value: 434000 }] },
  { fips: '06037', name: 'Los Angeles County', state: 'CA', lat: 34.05, lon: -118.24,
    yoy_change: -2.1, price_history: [{ date: '2023-01-31', value: 800000 }, { date: '2024-01-31', value: 783000 }] },
];

describe('normalizeCounties', () => {
  it('converts position to [lon, lat]', () => {
    const result = normalizeCounties(RAW);
    expect(result[0].position).toEqual([-97.74, 30.27]);
  });

  it('converts date strings to Date objects in priceHistory', () => {
    const result = normalizeCounties(RAW);
    expect(result[0].priceHistory[0].date).toBeInstanceOf(Date);
  });

  it('preserves yoyChange', () => {
    const result = normalizeCounties(RAW);
    expect(result[0].yoyChange).toBe(8.5);
    expect(result[1].yoyChange).toBe(-2.1);
  });
});

describe('appreciationColor', () => {
  it('returns blue-ish for steep decline', () => {
    const [r, g, b] = appreciationColor(-10);
    expect(b).toBeGreaterThan(r);
  });

  it('returns red-ish for strong appreciation', () => {
    const [r, , b] = appreciationColor(25);
    expect(r).toBeGreaterThan(b);
  });

  it('returns 4-element array (RGBA)', () => {
    expect(appreciationColor(5)).toHaveLength(4);
  });
});

describe('getElevationScale', () => {
  it('returns a positive number', () => {
    const counties = normalizeCounties(RAW);
    expect(getElevationScale(counties)).toBeGreaterThan(0);
  });
});

describe('RealEstateModule', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ counties: RAW })
    });
  });

  it('getLayers empty before load', async () => {
    const { default: RealEstateModule } = await import('../real-estate.js');
    expect(new RealEstateModule().getLayers()).toEqual([]);
  });

  it('getChartConfig type is line after load', async () => {
    const { default: RealEstateModule } = await import('../real-estate.js');
    const mod = new RealEstateModule();
    await mod.load();
    expect(mod.getChartConfig().type).toBe('line');
  });

  it('getStats has 3 cards after load', async () => {
    const { default: RealEstateModule } = await import('../real-estate.js');
    const mod = new RealEstateModule();
    await mod.load();
    expect(mod.getStats().cards).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../real-estate.js'`

- [ ] **Step 3: Write `src/modules/real-estate.js`**

```js
import { ColumnLayer } from '@deck.gl/layers';

export function normalizeCounties(rawCounties) {
  return rawCounties
    .filter(c => c.lat != null && c.lon != null)
    .map(c => ({
      fips:         c.fips,
      name:         c.name,
      state:        c.state,
      position:     [c.lon, c.lat],
      yoyChange:    c.yoy_change,
      priceHistory: (c.price_history || []).map(h => ({
        date:  new Date(h.date),
        value: h.value,
      })),
    }));
}

export function appreciationColor(yoy) {
  if (yoy < -5)  return [ 59, 130, 246, 210];  // blue — declining
  if (yoy < 0)   return [134, 239, 172, 210];  // mint — slight decline
  if (yoy < 8)   return [ 16, 185, 129, 210];  // green — stable
  if (yoy < 15)  return [245, 158,  11, 210];  // amber — appreciating
  return [239,  68,  68, 210];                  // red   — hot
}

export function getElevationScale(counties) {
  const max = Math.max(...counties.map(c => Math.abs(c.yoyChange || 0)), 1);
  return 40000 / max;
}

export default class RealEstateModule {
  constructor() {
    this._counties = null;
    this._selected  = null;
    this._elevScale = 1;
    this.viewState  = { pitch: 45 };
  }

  async load() {
    if (this._counties) return;
    const r = await fetch('./data/real-estate.json');
    if (!r.ok) throw new Error(`real-estate.json fetch failed: ${r.status}`);
    const data = await r.json();
    this._counties  = normalizeCounties(data.counties);
    this._elevScale = getElevationScale(this._counties);
    this._selected  = this._counties[0] || null;
  }

  getLayers() {
    if (!this._counties) return [];
    return [
      new ColumnLayer({
        id: 'real-estate-columns',
        data: this._counties,
        diskResolution: 6,
        radius: 10000,
        extruded: true,
        getPosition:   d => d.position,
        getElevation:  d => Math.abs(d.yoyChange) * this._elevScale,
        getFillColor:  d => appreciationColor(d.yoyChange),
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 120],
        onClick: ({ object }) => {
          if (object) {
            this._selected = object;
            window.dispatchEvent(new CustomEvent('re-module-update'));
          }
        },
      }),
    ];
  }

  getStats() {
    if (!this._counties) return { cards: [] };
    const sorted = [...this._counties].sort((a, b) => b.yoyChange - a.yoyChange);
    const natl   = this._counties.reduce((s, c) => s + c.yoyChange, 0) / this._counties.length;
    const sign   = natl >= 0 ? '+' : '';
    return {
      cards: [
        { label: 'Median YoY Change',  value: `${sign}${natl.toFixed(1)}%`,                           accent: natl >= 0 ? 'success' : 'danger' },
        { label: 'Hottest Market',     value: `${sorted[0]?.name}, ${sorted[0]?.state}` || '—',        accent: 'danger' },
        { label: 'Most Distressed',    value: `${sorted.at(-1)?.name}, ${sorted.at(-1)?.state}` || '—', accent: 'amber'  },
      ],
    };
  }

  getChartConfig() {
    if (!this._counties) return null;
    const target = this._selected || this._counties[0];
    return {
      type:  'line',
      title: target ? `${target.name}, ${target.state}` : 'Select a county',
      data:  target?.priceHistory || [],
    };
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test
```

Expected: all real-estate tests PASS.

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Click "Real Estate". Expected:
- 3D extruded columns per county, camera pitched to 45°
- Columns colored by appreciation (blue = decline, green = stable, amber/red = appreciation)
- Click a county column → line chart updates to that county's price history
- Stat cards show national YoY, hottest/most distressed markets

- [ ] **Step 6: Commit**

```bash
git add src/modules/real-estate.js src/modules/__tests__/real-estate.test.js
git commit -m "feat: add Real Estate module — 3D ColumnLayer + click-to-select price chart"
```

---

## Task 8: Labor Markets module

**Files:**
- Create: `src/modules/labor-markets.js`
- Create: `src/modules/__tests__/labor-markets.test.js`

**Interfaces:**
- `normalizePoints(rawPoints: array) → array` — exported pure function
- `default class LaborMarketsModule`

- [ ] **Step 1: Write the failing test**

Create `/tmp/dashboard/src/modules/__tests__/labor-markets.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizePoints } from '../labor-markets.js';

const RAW_POINTS = [
  { lat: 30.27, lon: -97.74, employment: 500000, median_wage: 68000, gig_share: 0.18 },
  { lat: 34.05, lon: -118.24, employment: 2000000, median_wage: 72000, gig_share: 0.19 },
];

describe('normalizePoints', () => {
  it('converts lat/lon to [lon, lat] position', () => {
    const result = normalizePoints(RAW_POINTS);
    expect(result[0].position).toEqual([-97.74, 30.27]);
  });

  it('preserves employment, medianWage, gigShare', () => {
    const result = normalizePoints(RAW_POINTS);
    expect(result[0].employment).toBe(500000);
    expect(result[0].medianWage).toBe(68000);
    expect(result[0].gigShare).toBe(0.18);
  });

  it('filters out points without lat/lon', () => {
    const withNull = [...RAW_POINTS, { lat: null, lon: null, employment: 0, median_wage: 0, gig_share: 0 }];
    expect(normalizePoints(withNull)).toHaveLength(2);
  });
});

describe('LaborMarketsModule', () => {
  const MOCK_DATA = {
    points: RAW_POINTS,
    metros: [{ name: 'Austin', lat: 30.27, lon: -97.74, median_wage: 68000, cost_of_living: 118, gig_share: 0.22 }]
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_DATA
    });
  });

  it('getLayers returns empty before load', async () => {
    const { default: LaborMarketsModule } = await import('../labor-markets.js');
    expect(new LaborMarketsModule().getLayers()).toEqual([]);
  });

  it('getStats returns 3 cards after load', async () => {
    const { default: LaborMarketsModule } = await import('../labor-markets.js');
    const mod = new LaborMarketsModule();
    await mod.load();
    expect(mod.getStats().cards).toHaveLength(3);
  });

  it('getChartConfig returns scatter type after load', async () => {
    const { default: LaborMarketsModule } = await import('../labor-markets.js');
    const mod = new LaborMarketsModule();
    await mod.load();
    expect(mod.getChartConfig().type).toBe('scatter');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../labor-markets.js'`

- [ ] **Step 3: Write `src/modules/labor-markets.js`**

```js
import { HexagonLayer } from '@deck.gl/aggregation-layers';

export function normalizePoints(rawPoints) {
  return rawPoints
    .filter(p => p.lat != null && p.lon != null)
    .map(p => ({
      position:   [p.lon, p.lat],
      employment: p.employment  || 0,
      medianWage: p.median_wage || 0,
      gigShare:   p.gig_share   || 0,
    }));
}

export default class LaborMarketsModule {
  constructor() {
    this._points = null;
    this._metros = [];
    this.viewState = { pitch: 40 };
  }

  async load() {
    if (this._points) return;
    const r = await fetch('./data/labor-markets.json');
    if (!r.ok) throw new Error(`labor-markets.json fetch failed: ${r.status}`);
    const data = await r.json();
    this._points = normalizePoints(data.points);
    this._metros = data.metros || [];
  }

  getLayers() {
    if (!this._points) return [];
    return [
      new HexagonLayer({
        id: 'labor-markets-hex',
        data: this._points,
        getPosition:       d => d.position,
        getElevationWeight: d => d.employment,
        getColorWeight:    d => d.medianWage,
        elevationScale: 60,
        radius: 50000,
        extruded: true,
        pickable: true,
        autoHighlight: true,
        colorRange: [
          [8,   13,  26,  255],
          [15,  30,  60,  255],
          [0,   80,  150, 255],
          [0,   150, 210, 255],
          [0,   200, 255, 255],
          [100, 230, 255, 255],
        ],
      }),
    ];
  }

  getStats() {
    if (!this._points) return { cards: [] };
    const avgWage = this._points.reduce((s, p) => s + p.medianWage, 0) / this._points.length;
    const avgGig  = this._points.reduce((s, p) => s + p.gigShare,   0) / this._points.length;
    return {
      cards: [
        { label: 'Avg Median Wage',     value: `$${(avgWage / 1000).toFixed(0)}k`,    accent: 'cyan'  },
        { label: 'Gig Economy Share',   value: `${(avgGig * 100).toFixed(1)}%`,        accent: 'amber' },
        { label: 'Metro Data Points',   value: String(this._points.length),            accent: 'cyan'  },
      ],
    };
  }

  getChartConfig() {
    if (!this._metros.length) return null;
    return {
      type:  'scatter',
      title: 'Wage vs. Cost of Living',
      data:  this._metros.map(m => ({
        name:     m.name,
        wage:     m.median_wage,
        col:      m.cost_of_living,
        gigShare: m.gig_share,
      })),
    };
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test
```

Expected: all labor-markets tests PASS.

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Click "Labor Markets". Expected:
- Hexagonal heatmap with navy-to-cyan color ramp and 3D elevation
- Stat cards show avg wage, gig share, metro count
- Chart panel shows scatter plot of wage vs. cost of living (colored by gig share)

- [ ] **Step 6: Run full test suite**

```bash
npm test
```

Expected: all tests across all modules PASS.

- [ ] **Step 7: Commit**

```bash
git add src/modules/labor-markets.js src/modules/__tests__/labor-markets.test.js
git commit -m "feat: add Labor Markets module — HexagonLayer + wage scatter chart"
```

---

## Task 9: Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Run production build locally**

```bash
npm run build
```

Expected: `dist/` created with `index.html`, `assets/`, `data/` copied from `public/`.

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4173`. Verify all four modules work identically to the dev server. Stop with Ctrl+C.

- [ ] **Step 3: Configure GitHub Pages to use gh-pages branch**

In the GitHub repo settings (Settings → Pages):
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `/ (root)`

- [ ] **Step 4: Deploy to GitHub Pages**

```bash
npm run deploy
```

Expected: `dist/` contents pushed to `gh-pages` branch. Wait ~60 seconds for Pages to rebuild.

Open `https://mossfunki.github.io` in browser. Verify:
- Dark dashboard loads
- All four modules switch correctly
- Maps render with data
- No console errors

- [ ] **Step 5: Write GitHub Actions deploy workflow**

Create `/tmp/dashboard/.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_MAPBOX_TOKEN: ${{ secrets.VITE_MAPBOX_TOKEN }}

      - name: Deploy to GitHub Pages
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          npx gh-pages -d dist -u "github-actions[bot] <github-actions[bot]@users.noreply.github.com>"
```

- [ ] **Step 6: Add VITE_MAPBOX_TOKEN secret to GitHub repo**

In GitHub: Settings → Secrets and variables → Actions → New repository secret:
- Name: `VITE_MAPBOX_TOKEN`
- Value: your Mapbox public token (`pk.xxx`)

- [ ] **Step 7: Commit and push — trigger CI**

```bash
cd /tmp/dashboard
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deploy workflow"
git push origin main
```

Monitor the Actions tab in GitHub. Expected: workflow runs, build succeeds, gh-pages branch updated.

- [ ] **Step 8: Final verification on live site**

Open `https://mossfunki.github.io`. Test all four modules:

| Module | Map renders | Stat cards update | Chart renders | Module switch works |
|---|---|---|---|---|
| Financial Flows | ✓ | ✓ | ✓ | ✓ |
| Real Estate | ✓ | ✓ | ✓ | ✓ |
| Labor Markets | ✓ | ✓ | ✓ | ✓ |
| Risk Index | ✓ | ✓ | ✓ | ✓ |

- [ ] **Step 9: Commit**

```bash
git add package.json
git commit -m "chore: confirm deploy setup complete"
```
