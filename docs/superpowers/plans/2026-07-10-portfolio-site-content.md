# Portfolio Site Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage Featured Work section into a tabbed, categorized 6-card grid; fix resume/site content drift against `Benjamin Lab - Resume.docx`; and shift the site's tone from personal to portfolio.

**Architecture:** Static Vite site, no framework. A new vanilla-JS component (`src/components/work-tabs.js`) renders category tab buttons and filters existing `.work-card` DOM elements by a `data-categories` attribute — same pattern as the existing `src/components/sidebar.js`. All other changes are direct HTML/CSS edits to `index.html`, `public/about.html`, and `resume.html`.

**Tech Stack:** Vite 5, vanilla JS, vitest + jsdom for unit tests, GSAP (existing, unchanged).

## Global Constraints

- No new npm dependencies — this is pure vanilla JS/HTML/CSS, matching every existing component in `src/components/`.
- Follow the existing component convention exactly: `initX()` / `setActiveX()` / `getActiveX()` exported functions, one file per component, colocated `__tests__` folder (see `src/components/sidebar.js` + `src/components/__tests__/sidebar.test.js` as the reference pattern).
- `npm run test` (vitest) must stay green after every task.
- All factual project/employer claims that touch `resume.html` must match `Benjamin Lab - Resume.docx` (the confirmed fact source of truth) — see `docs/superpowers/specs/2026-07-10-portfolio-reformat-design.md` §2.
- Work happens on a new branch `portfolio-reformat` inside this clone — do not commit to `main` directly, and do not push to `origin` without explicit confirmation (existing repo safety rules).

---

### Task 0: Create working branch

**Files:** none (git only)

- [ ] **Step 1: Create and switch to the feature branch**

```bash
cd /tmp/dashboard
git checkout -b portfolio-reformat
```

Expected: `Switched to a new branch 'portfolio-reformat'`

---

### Task 1: `work-tabs` component

**Files:**
- Create: `src/components/work-tabs.js`
- Test: `src/components/__tests__/work-tabs.test.js`

**Interfaces:**
- Consumes: DOM element `#work-tabs` (empty container to render buttons into) and any number of `.work-card` elements, each with a `data-categories` attribute (comma-separated category keys, e.g. `"gis,economics"`).
- Produces (used by Task 2's `main.js` wiring):
  - `initWorkTabs(): void` — renders one button per category (`all`, `logistics`, `gis`, `economics`) into `#work-tabs`, activates `all` by default.
  - `setActiveTab(category: string): void` — marks the matching button active, shows/hides `.work-card` elements by category membership (`all` shows everything).
  - `getActiveTab(): string | null` — returns the currently active category key, or `null` if `initWorkTabs` hasn't run.

- [ ] **Step 1: Write the failing tests**

Create `src/components/__tests__/work-tabs.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

function markup() {
  return `
    <div class="work-tabs" id="work-tabs"></div>
    <div class="work-grid">
      <div class="work-card" data-categories="gis,economics" data-testid="tod"></div>
      <div class="work-card" data-categories="logistics" data-testid="hydrogen"></div>
      <div class="work-card" data-categories="economics" data-testid="demand"></div>
    </div>
  `;
}

describe('work-tabs', () => {
  beforeEach(() => {
    document.body.innerHTML = markup();
    vi.resetModules();
  });

  it('renders one button per category plus All, with All active by default', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    const buttons = document.querySelectorAll('.work-tab-btn');
    expect(buttons.length).toBe(4);
    expect(document.querySelector('.work-tab-btn--active').dataset.category).toBe('all');
  });

  it('shows all cards when "all" is active', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    document.querySelectorAll('.work-card').forEach(card => {
      expect(card.style.display).not.toBe('none');
    });
  });

  it('filters cards by category on tab click', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    document.querySelector('[data-category="gis"]').click();
    expect(document.querySelector('[data-testid="tod"]').style.display).not.toBe('none');
    expect(document.querySelector('[data-testid="hydrogen"]').style.display).toBe('none');
    expect(document.querySelector('[data-testid="demand"]').style.display).toBe('none');
  });

  it('a card with multiple categories appears under each of its tabs', async () => {
    const { initWorkTabs } = await import('../work-tabs.js');
    initWorkTabs();
    document.querySelector('[data-category="economics"]').click();
    expect(document.querySelector('[data-testid="tod"]').style.display).not.toBe('none');
    expect(document.querySelector('[data-testid="demand"]').style.display).not.toBe('none');
    expect(document.querySelector('[data-testid="hydrogen"]').style.display).toBe('none');
  });

  it('getActiveTab returns the current category and updates on click', async () => {
    const { initWorkTabs, getActiveTab } = await import('../work-tabs.js');
    initWorkTabs();
    expect(getActiveTab()).toBe('all');
    document.querySelector('[data-category="logistics"]').click();
    expect(getActiveTab()).toBe('logistics');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /tmp/dashboard && npx vitest run src/components/__tests__/work-tabs.test.js
```

Expected: FAIL — `Failed to resolve import "../work-tabs.js"`

- [ ] **Step 3: Write the implementation**

Create `src/components/work-tabs.js`:

```javascript
const CATEGORY_LABELS = {
  all: 'All',
  logistics: 'Logistics & Supply Chain',
  gis: 'GIS & Spatial Analysis',
  economics: 'Economics & Analytics',
};

const CATEGORY_ORDER = ['all', 'logistics', 'gis', 'economics'];

let activeCategory = null;

export function initWorkTabs() {
  const tabBar = document.getElementById('work-tabs');
  if (!tabBar) return;

  tabBar.innerHTML = '';
  CATEGORY_ORDER.forEach(category => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'work-tab-btn';
    btn.dataset.category = category;
    btn.textContent = CATEGORY_LABELS[category];
    btn.addEventListener('click', () => setActiveTab(category));
    tabBar.appendChild(btn);
  });

  setActiveTab('all');
}

export function setActiveTab(category) {
  const tabBar = document.getElementById('work-tabs');
  if (!tabBar) return;

  activeCategory = category;

  tabBar.querySelectorAll('.work-tab-btn').forEach(btn => {
    btn.classList.toggle('work-tab-btn--active', btn.dataset.category === category);
  });

  document.querySelectorAll('.work-card').forEach(card => {
    const cardCategories = (card.dataset.categories || '').split(',').map(s => s.trim());
    const visible = category === 'all' || cardCategories.includes(category);
    card.style.display = visible ? '' : 'none';
  });
}

export function getActiveTab() {
  return activeCategory;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /tmp/dashboard && npx vitest run src/components/__tests__/work-tabs.test.js
```

Expected: PASS — all 5 tests green

- [ ] **Step 5: Run the full suite to confirm no regressions**

```bash
cd /tmp/dashboard && npm run test
```

Expected: all test files PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/work-tabs.js src/components/__tests__/work-tabs.test.js
git commit -m "feat: add work-tabs component for category filtering"
```

---

### Task 2: Rebuild Featured Work section in `index.html`

**Files:**
- Modify: `index.html:99-142` (FEATURED WORK section)
- Modify: `src/style.css:322-397` (section header + work card + new tab styles)
- Modify: `src/main.js` (import + call `initWorkTabs`)

**Interfaces:**
- Consumes: `initWorkTabs` from `src/components/work-tabs.js` (Task 1).

- [ ] **Step 1: Replace the Featured Work section markup**

In `index.html`, replace lines 99-142 (the entire `<!-- FEATURED WORK -->` section) with:

```html
  <!-- FEATURED WORK -->
  <section id="featured-work" class="portfolio-section">
    <div class="section-header">
      <span class="section-label">Featured Work</span>
      <h2 class="section-title">Spatial &amp; Logistics Analysis</h2>
      <p class="section-subtitle">Six pipelines across GIS, logistics, and economics. Real open data, real operational and policy questions.</p>
    </div>
    <div class="work-tabs" id="work-tabs" role="tablist"></div>
    <div class="work-grid">
      <div class="work-card" data-categories="gis,economics">
        <div class="work-card-label">GIS · Economics · King County Open Data</div>
        <h3 class="work-card-title">Transit-Oriented Development &amp; Affordability Model</h3>
        <p class="work-card-desc">Hedonic OLS regression across 531,000+ King County parcels quantifying how transit proximity shapes property values and housing affordability.</p>
        <div class="outcome-chips">
          <span>531k parcels</span>
          <span>OLS R²=0.50</span>
        </div>
        <div class="work-card-tags">GeoPandas · Statsmodels · PostGIS</div>
        <div class="work-card-actions">
          <a href="https://github.com/mossfunki/seattle-gis-portfolio" class="btn-primary" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      </div>
      <div class="work-card" data-categories="gis">
        <div class="work-card-label">GIS · SDOT Open Data</div>
        <h3 class="work-card-title">Automated Collision Risk Pipeline</h3>
        <p class="work-card-desc">DBSCAN clustering pipeline on SDOT collision data identifying 303 high-injury pedestrian and cyclist clusters for infrastructure prioritization.</p>
        <div class="outcome-chips">
          <span>303 clusters</span>
          <span>DBSCAN</span>
        </div>
        <div class="work-card-tags">scikit-learn · GeoPandas · Python</div>
        <div class="work-card-actions">
          <a href="https://github.com/mossfunki/seattle-gis-portfolio" class="btn-primary" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      </div>
      <div class="work-card" data-categories="gis">
        <div class="work-card-label">GIS · Climate</div>
        <h3 class="work-card-title">Urban Heat Island Prediction</h3>
        <p class="work-card-desc">Random Forest classifier with SHAP explainability predicting urban heat island risk across 1,545 census tracts; urban village designation outweighs tree density as a predictor.</p>
        <div class="outcome-chips">
          <span>1,545 tracts</span>
          <span>Random Forest + SHAP</span>
        </div>
        <div class="work-card-tags">scikit-learn · SHAP · GeoPandas</div>
        <div class="work-card-actions">
          <a href="https://github.com/mossfunki/seattle-gis-portfolio" class="btn-primary" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      </div>
      <div class="work-card" data-categories="logistics,gis">
        <div class="work-card-label">Logistics · GIS <span class="badge">New</span></div>
        <h3 class="work-card-title">Hydrogen Corridor Routing &amp; Infrastructure Gap Analysis</h3>
        <p class="work-card-desc">Elevation- and traffic-adjusted routing model built on OSMnx, SRTM, and NREL data, cutting projected fuel consumption 18.8% versus standard routing.</p>
        <div class="outcome-chips">
          <span>18.8% fuel savings</span>
        </div>
        <div class="work-card-tags">OSMnx · SRTM · NREL · Python</div>
        <div class="work-card-actions">
          <a href="https://github.com/mossfunki/hydrogen-route-elevation-analysis" class="btn-primary" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      </div>
      <div class="work-card" data-categories="logistics,economics">
        <div class="work-card-label">Logistics · Operations</div>
        <h3 class="work-card-title">Demand Forecasting &amp; Safety Stock Optimization</h3>
        <p class="work-card-desc">Prophet time-series forecasting on event-driven demand with dynamic safety stock recalculation. 31% fewer stockouts vs. static reorder model on held-out test data.</p>
        <div class="outcome-chips">
          <span>8.4% MAPE</span>
          <span>31% fewer stockouts</span>
        </div>
        <div class="work-card-tags">Python · Prophet · XGBoost · Streamlit</div>
        <div class="work-card-actions">
          <a href="https://github.com/mossfunki/demand-inventory-forecast" class="btn-primary" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      </div>
      <div class="work-card" data-categories="logistics,economics">
        <div class="work-card-label">Logistics · Economics <span class="badge">New</span></div>
        <h3 class="work-card-title">Energy-Adjusted Logistics Forecasting</h3>
        <p class="work-card-desc">Autonomous prediction model tracking how energy pricing moves through supply chain logistics costs, using multi-source public data for freight cost-variance analysis.</p>
        <div class="work-card-tags">Python · Multi-source public data</div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Update Featured Work CSS in `src/style.css`**

Replace the `.work-grid` rule (currently `grid-template-columns: 2fr 1fr 1fr;`) and remove the now-unused `.work-card--primary` rule:

```css
.work-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
```

(Delete the `.work-card--primary { grid-row: 1; }` rule entirely — no card uses that class anymore.)

Add new rules directly after `.work-card-actions { margin-top: auto; padding-top: 0.5rem; }`:

```css
.work-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.75rem; }
.work-tab-btn {
  padding: 0.45rem 0.9rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.work-tab-btn:hover { border-color: var(--border-glow); color: var(--text); }
.work-tab-btn--active { background: rgba(212,98,42,0.1); border-color: var(--border-glow); color: var(--accent-cyan); }
```

- [ ] **Step 3: Wire `initWorkTabs` into `src/main.js`**

Add the import at the top of `src/main.js`, alongside the other component import:

```javascript
import { initChartPanel, renderChart } from './components/chart-panel.js';
import { initWorkTabs } from './components/work-tabs.js';
```

Add the call right after the `/* ── GSAP work cards stagger ────────────────────────────── */` block (after the `gsap.from('.work-card', ...)` call, so the tab bar exists in the DOM by the time GSAP measures the cards):

```javascript
/* ── Featured work tabs ─────────────────────────────────── */

initWorkTabs();
```

- [ ] **Step 4: Run the full test suite**

```bash
cd /tmp/dashboard && npm run test
```

Expected: all test files PASS (work-tabs tests confirm the component logic; this step just guards against an accidental syntax break in `main.js`)

- [ ] **Step 5: Verify in the browser**

```bash
cd /tmp/dashboard && npm run dev
```

Open the printed local URL. Confirm: 4 tab buttons render above the grid, "All" shows 6 cards, clicking "GIS & Spatial Analysis" shows exactly TOD / Collision Risk / Heat Island / Hydrogen (4 cards — Hydrogen is tagged both logistics and gis), clicking "Logistics & Supply Chain" shows Hydrogen / Demand Forecasting / Energy-Adjusted Logistics, clicking "Economics & Analytics" shows TOD / Demand Forecasting / Energy-Adjusted Logistics. No "User Retention Analysis" card appears anywhere. Stop the dev server (Ctrl-C) when done.

- [ ] **Step 6: Commit**

```bash
git add index.html src/style.css src/main.js
git commit -m "feat: rebuild Featured Work as tabbed 6-card grid, drop User Retention card"
```

---

### Task 3: Site chrome consistency (Resume nav link, location fix, hobby de-emphasis)

**Files:**
- Modify: `index.html` (nav + hero eyebrow + footer)
- Modify: `public/about.html` (nav + Outside the Work section + its `<style>` block)

- [ ] **Step 1: Add "Resume" nav link to `index.html`**

Find (around line 18-24):

```html
      <div class="nav-links">
        <a href="https://github.com/mossfunki" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:benjaminmonroelab@gmail.com">Contact</a>
        <a href="/about.html" class="nav-links-about">About</a>
        <a href="#map-section" class="nav-cta">Explore Data ↓</a>
      </div>
```

Replace with:

```html
      <div class="nav-links">
        <a href="https://github.com/mossfunki" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:benjaminmonroelab@gmail.com">Contact</a>
        <a href="/about.html" class="nav-links-about">About</a>
        <a href="/resume.html" target="_blank" rel="noopener">Resume</a>
        <a href="#map-section" class="nav-cta">Explore Data ↓</a>
      </div>
```

- [ ] **Step 2: Add "Resume" nav link to `public/about.html`**

Find (around line 146-151):

```html
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="https://github.com/mossfunki" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:benjaminmonroelab@gmail.com">Contact</a>
        <a href="/about.html" class="active">About</a>
      </div>
```

Replace with:

```html
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="https://github.com/mossfunki" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:benjaminmonroelab@gmail.com">Contact</a>
        <a href="/about.html" class="active">About</a>
        <a href="/resume.html" target="_blank" rel="noopener">Resume</a>
      </div>
```

- [ ] **Step 3: Fix location in `index.html` hero eyebrow**

Find:

```html
        <p class="hero-eyebrow"><span class="live-dot"></span>San Diego, CA · Seattle, WA · Open to Work</p>
```

Replace with:

```html
        <p class="hero-eyebrow"><span class="live-dot"></span>Seattle, WA · Open to Work</p>
```

- [ ] **Step 4: Fix location in `index.html` footer**

Find:

```html
        <span class="footer-copy">© 2026 · San Diego, CA</span>
```

Replace with:

```html
        <span class="footer-copy">© 2026 · Seattle, WA</span>
```

- [ ] **Step 5: De-emphasize the "Outside the work" section in `public/about.html`**

Add new CSS rules to the `<style>` block, directly after the existing `.photo-item figcaption { ... }` rule (around line 125):

```css
    .about-section--quiet h2 { font-size: 0.72rem; color: var(--text-muted); border-bottom-color: transparent; opacity: 0.75; }
    .about-section--quiet .blurb { font-size: 0.8rem; max-width: 480px; }
    .photo-strip { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .photo-strip .photo-item { width: 110px; flex-shrink: 0; }
    .photo-strip .photo-item img { height: 90px; }
```

Then update the section markup itself. Find:

```html
    <div class="about-section">
      <h2>Outside the work</h2>
      <p class="blurb">When I'm not at a desk, I'm usually outside: road biking, backpacking, rock climbing, or on the water. The PNW and California coastline are hard to beat.</p>
      <div class="photo-grid">
```

Replace with:

```html
    <div class="about-section about-section--quiet">
      <h2>Outside the work</h2>
      <p class="blurb">When I'm not at a desk, I'm usually outside: road biking, backpacking, rock climbing, or on the water. The PNW and California coastline are hard to beat.</p>
      <div class="photo-strip">
```

And find the closing `</div>` of that same photo grid (immediately after the third `</figure>`, before the closing `</div>` of `about-section`):

```html
        <figure class="photo-item">
          <img src="/IMG_5733.png" alt="Kayaking on the coast" loading="lazy" />
          <figcaption>Kayaking the coast</figcaption>
        </figure>
      </div>
    </div>
```

This block's structure is unchanged (still 3 `<figure>` elements followed by two closing `</div>`s) — only the opening `<div class="photo-grid">` tag becomes `<div class="photo-strip">` as shown above; no other edit needed here, this is just confirming the closing tags stay matched.

- [ ] **Step 6: Verify with grep**

```bash
cd /tmp/dashboard && grep -c "San Diego" index.html
```

Expected: `0`

```bash
grep -n "resume.html" index.html public/about.html
```

Expected: one match in each file's nav block

- [ ] **Step 7: Verify in the browser**

```bash
npm run dev
```

Check the homepage hero and footer both read "Seattle, WA" (no San Diego), a "Resume" link appears in the nav on both `/` and `/about.html` and opens `resume.html` in a new tab, and the "Outside the work" section on `/about.html` now shows a smaller heading and a compact single-row photo strip instead of the large 3-column grid. Stop the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add index.html public/about.html
git commit -m "fix: unify location to Seattle WA, add Resume nav link, de-emphasize hobby section"
```

---

### Task 4: Resync `resume.html` Projects section and summary to the docx

**Files:**
- Modify: `resume.html:74` (Professional Summary paragraph)
- Modify: `resume.html:146-161` (Projects section)

- [ ] **Step 1: Update the Professional Summary paragraph**

Find (line 74):

```html
<p>Spatial data scientist with an economist&rsquo;s lens, I build end-to-end geospatial analysis pipelines from automated data ingestion through spatial feature engineering, econometric modeling, and interactive visualization. My portfolio includes a hedonic OLS regression quantifying transit proximity premiums across 531k King County parcels (R&sup2;=0.502), a DBSCAN-based pedestrian collision risk pipeline ranking 303 high-injury clusters for SDOT-style infrastructure prioritization, and a Random Forest + SHAP model predicting urban heat island risk across 1,545 census tracts. Technical stack: Python, GeoPandas, Statsmodels, scikit-learn, SHAP, MapLibre GL, PostGIS. B.S. Economics / Data Science, Cal Poly Humboldt.</p>
```

Replace with:

```html
<p>Spatial data scientist with an economist&rsquo;s lens, I build end-to-end geospatial analysis pipelines from automated data ingestion through spatial feature engineering, econometric modeling, and interactive visualization. My portfolio includes a hedonic OLS regression quantifying transit proximity premiums across 531k King County parcels (R&sup2;=0.502), a DBSCAN-based pedestrian collision risk pipeline ranking 303 high-injury clusters for SDOT-style infrastructure prioritization, an elevation- and traffic-adjusted hydrogen corridor routing model cutting projected fuel consumption 18.8%, and a Prophet-based demand forecasting model reducing stockouts 31%. Technical stack: Python, GeoPandas, Statsmodels, scikit-learn, Prophet, OSMnx, PostGIS. B.S. Economics / Data Science, Cal Poly Humboldt.</p>
```

- [ ] **Step 2: Replace the Projects section**

Find (lines 146-161):

```html
<h2>Projects</h2>

<div class="entry">
  <div class="project-title">Seattle GIS Portfolio, Transit, Collision Risk &amp; Urban Heat Island (2024)</div>
  <p>Three end-to-end geospatial analysis pipelines on King County and Seattle open data. (1) Hedonic OLS regression quantifying light rail proximity premiums across 531k parcels (R&sup2;=0.502, 7% premium in 400&ndash;800ft band). (2) DBSCAN pedestrian/bike collision clustering pipeline ranking 303 high-injury locations by composite risk score for infrastructure prioritization. (3) Random Forest classifier + SHAP predicting urban heat island risk across 1,545 census tracts, finding: urban village designation is a stronger heat predictor than tree density. Interactive scrollytelling page built with MapLibre GL and Scrollama.js. <a href="https://github.com/mossfunki/seattle-gis-portfolio" target="_blank">GitHub</a></p>
</div>

<div class="entry">
  <div class="project-title">Seattle Last-Mile Delivery Gap Analysis</div>
  <p>OSMnx network analysis generating 10/20/30-minute drive-time isochrones from five real King County distribution hubs. Census tract overlay produces a composite under-service score identifying zones underserved by existing logistics infrastructure.</p>
</div>

<div class="entry">
  <div class="project-title">Demand Forecasting &amp; Inventory Optimization</div>
  <p>Prophet time-series forecasting on event-driven demand (Seahawks games, PAX) with dynamic safety stock recalculation. 31% fewer stockouts vs. static reorder model on held-out test data; 8.4% MAPE.</p>
</div>

</body>
</html>
```

Replace with:

```html
<h2>Projects</h2>

<div class="entry">
  <div class="project-title">Transit-Oriented Development &amp; Affordability Model</div>
  <p>Hedonic OLS regression quantifying light rail proximity premiums across 531k King County parcels (R&sup2;=0.502, 7% premium in 400&ndash;800ft band). <a href="https://github.com/mossfunki/seattle-gis-portfolio" target="_blank">GitHub</a></p>
</div>

<div class="entry">
  <div class="project-title">Hydrogen Corridor Routing &amp; Infrastructure Gap Analysis</div>
  <p>OSMnx/SRTM/NREL-based routing model analyzing elevation and traffic data across a hydrogen refueling corridor, cutting projected fuel consumption by 18.8% versus standard routing. <a href="https://github.com/mossfunki/hydrogen-route-elevation-analysis" target="_blank">GitHub</a></p>
</div>

<div class="entry">
  <div class="project-title">Automated Collision Risk Pipeline</div>
  <p>DBSCAN pedestrian/bike collision clustering pipeline on SDOT data ranking 303 high-injury locations by composite risk score for infrastructure prioritization. <a href="https://github.com/mossfunki/seattle-gis-portfolio" target="_blank">GitHub</a></p>
</div>

<div class="entry">
  <div class="project-title">Demand Forecasting &amp; Safety Stock Optimization</div>
  <p>Prophet time-series forecasting on event-driven demand (Seahawks games, PAX) with dynamic safety stock recalculation. 31% fewer stockouts vs. static reorder model on held-out test data; 8.4% MAPE. <a href="https://github.com/mossfunki/demand-inventory-forecast" target="_blank">GitHub</a></p>
</div>

</body>
</html>
```

- [ ] **Step 3: Verify with grep**

```bash
cd /tmp/dashboard && grep -c "Last-Mile Delivery" resume.html
```

Expected: `0`

```bash
grep -c "Hydrogen Corridor Routing" resume.html
```

Expected: `1`

```bash
grep -c "Urban Heat Island" resume.html
```

Expected: `0` (Heat Island stays a site-only Featured Work card per the spec — it's intentionally not on the printable resume)

- [ ] **Step 4: Verify in the browser**

```bash
npm run dev
```

Open `/resume.html` directly. Confirm the Projects section lists exactly 4 entries — Transit-Oriented Development, Hydrogen Corridor Routing, Automated Collision Risk Pipeline, Demand Forecasting — each with a working GitHub link, matching the docx's Selected Projects list. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add resume.html
git commit -m "fix: resync resume.html projects and summary to Benjamin Lab - Resume.docx"
```

---

### Task 5: Full-suite verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

```bash
cd /tmp/dashboard && npm run test
```

Expected: all test files PASS, including the new `work-tabs.test.js`

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: build completes with no errors, `dist/` produced

- [ ] **Step 3: Preview the production build**

```bash
npm run preview
```

Open the printed local URL and re-check: Featured Work tabs filter correctly, no "San Diego" text anywhere, Resume nav link works from both `/` and `/about.html`, `/resume.html` shows the resynced 4-project list. Stop the preview server when done.

- [ ] **Step 4: Review the branch diff**

```bash
git log --oneline main..portfolio-reformat
git diff main..portfolio-reformat --stat
```

Confirm the diff only touches the files listed in this plan's tasks (`index.html`, `src/style.css`, `src/main.js`, `src/components/work-tabs.js`, `src/components/__tests__/work-tabs.test.js`, `public/about.html`, `resume.html`).

**Do not merge to `main` or push to `origin` yet — stop here and confirm with the user before doing either.**
