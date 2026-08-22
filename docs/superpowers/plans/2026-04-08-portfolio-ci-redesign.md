# Portfolio CI Repositioning — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition mossfunki.github.io as a market intelligence / commercial analytics portfolio targeting digital health startup roles, with a new `intelligence.html` case study page and updated copy across all existing pages.

**Architecture:** Static HTML/CSS on GitHub Pages — no build step, no framework. All changes are direct HTML edits. The existing `style.css` is untouched. The new `intelligence.html` reuses all existing CSS classes and patterns from `index.html`.

**Tech Stack:** HTML5, CSS (existing `style.css`), vanilla JS (existing patterns), GitHub Pages

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `intelligence.html` | Create | New CI page — methodology header, Ix case study, in-progress section |
| `index.html` | Modify | Hero copy, expertise cards, featured project block, experience section, nav link |
| `about.html` | Modify | Positioning subtitle, Ix description, skills list, nav link |
| `projects.html` | Modify | New filter button, 4 new project cards, nav link |

---

## Setup

### Task 0: Clone repo and verify working state

**Files:**
- Working directory: `/tmp/portfolio-ci` (fresh clone)

- [ ] **Step 1: Clone the live repo**

```bash
git clone https://github.com/mossfunki/mossfunki.github.io.git /tmp/portfolio-ci
cd /tmp/portfolio-ci
```

- [ ] **Step 2: Verify file structure**

```bash
ls /tmp/portfolio-ci
```

Expected output includes: `index.html`, `about.html`, `projects.html`, `style.css`

- [ ] **Step 3: Open index.html in browser to confirm baseline**

```bash
open /tmp/portfolio-ci/index.html
```

Verify the current site loads with the old "Data Scientist & Spatial Analyst" hero.

---

## Task 1: Add Intelligence nav link to all pages

**Files:**
- Modify: `/tmp/portfolio-ci/index.html`
- Modify: `/tmp/portfolio-ci/about.html`
- Modify: `/tmp/portfolio-ci/projects.html`

The current nav `<ul>` in all three files looks like:
```html
<li><a href="index.html">Home</a></li>
<li><a href="projects.html">Projects</a></li>
<li><a href="about.html">About</a></li>
<li><a href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a></li>
```

- [ ] **Step 1: Update nav in `index.html`**

Replace the nav `<ul>` content with:
```html
<li><a href="index.html">Home</a></li>
<li><a href="projects.html">Projects</a></li>
<li><a href="intelligence.html">Intelligence</a></li>
<li><a href="about.html">About</a></li>
<li><a href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a></li>
```

- [ ] **Step 2: Update nav in `about.html`**

Same replacement as Step 1.

- [ ] **Step 3: Update nav in `projects.html`**

Same replacement as Step 1.

- [ ] **Step 4: Verify**

```bash
open /tmp/portfolio-ci/index.html
```

Confirm "Intelligence" appears in the nav between Projects and About on all three pages.

- [ ] **Step 5: Commit**

```bash
cd /tmp/portfolio-ci
git add index.html about.html projects.html
git commit -m "feat: add Intelligence nav link to all pages"
```

---

## Task 2: Update `index.html` hero section

**Files:**
- Modify: `/tmp/portfolio-ci/index.html`

- [ ] **Step 1: Update page `<title>` and meta description**

Replace:
```html
<title>Benjamin Lab — Data Scientist & Supply Chain Analyst</title>
<meta name="description" content="Benjamin Lab — data scientist and spatial analyst specializing in supply chain analytics, logistics optimization, and economic modeling.">
```

With:
```html
<title>Benjamin Lab — Market Intelligence & Strategy Analyst</title>
<meta name="description" content="Benjamin Lab — strategy and analytics analyst specializing in market intelligence, competitive analysis, and decision support for digital health and AI infrastructure.">
```

- [ ] **Step 2: Update hero eyebrow, title, and subtitle**

Replace:
```html
<p class="hero-eyebrow">Benjamin Lab &mdash; Data Scientist &amp; Spatial Analyst</p>
<h1 class="hero-title">
  Data science and spatial analytics for supply chain, logistics, and economic decisions.
</h1>
<p class="hero-subtitle">
  I build forecasting models, optimization tools, and geospatial analyses that translate
  complex operational and economic data into actionable insight—using Python, SQL, and GIS
  across the full project pipeline.
</p>
```

With:
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

- [ ] **Step 3: Update hero CTA buttons**

Replace:
```html
<div class="btn-row">
  <a class="btn btn-primary" href="projects.html">View Projects</a>
  <a class="btn btn-secondary" href="about.html">About Me</a>
  <a class="btn btn-secondary" href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a>
</div>
```

With:
```html
<div class="btn-row">
  <a class="btn btn-primary" href="intelligence.html">Intelligence Work</a>
  <a class="btn btn-secondary" href="projects.html">All Projects</a>
  <a class="btn btn-secondary" href="about.html">About Me</a>
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
  <span>GIS</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Supply Chain Optimization</span>
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
  <span>Competitive Intelligence</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Market Research</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Machine Learning</span>
  <span class="hero-tools-sep">&middot;</span>
  <span>Econometrics</span>
</div>
```

- [ ] **Step 5: Verify**

```bash
open /tmp/portfolio-ci/index.html
```

Confirm new hero title, subtitle, CTA buttons, and tool tags are visible.

- [ ] **Step 6: Commit**

```bash
cd /tmp/portfolio-ci
git add index.html
git commit -m "feat: reposition hero for market intelligence / CI analyst profile"
```

---

## Task 3: Update `index.html` expertise cards and featured project

**Files:**
- Modify: `/tmp/portfolio-ci/index.html`

- [ ] **Step 1: Update expertise card 01**

Replace:
```html
<div class="expertise-card reveal reveal-delay-1">
  <div class="expertise-number">01</div>
  <h3>Supply Chain & Logistics</h3>
  <p>Network optimization, facility siting, route analysis, and demand forecasting applied to real operational problems.</p>
</div>
```

With:
```html
<div class="expertise-card reveal reveal-delay-1">
  <div class="expertise-number">01</div>
  <h3>Market Intelligence & Competitive Analysis</h3>
  <p>Recurring competitor monitoring, signal synthesis from developer forums, funding data, and job listings — structured into decision-ready briefs for executive teams.</p>
</div>
```

- [ ] **Step 2: Update featured project block**

Replace the entire featured project section (the `section--alt` block) with:
```html
<section class="section section--alt reveal">
  <div class="section-heading">
    <div>
      <p class="section-label">03 &mdash; Featured Work</p>
      <h2 class="section-title">Featured Work</h2>
    </div>
    <span class="section-subtitle">Competitive Intelligence · Market Analysis · AI Infrastructure</span>
  </div>

  <div class="content-grid">
    <div>
      <h3 class="proj-title">AI Agent Memory Market — Competitive Landscape</h3>
      <p class="hero-subtitle">
        A recurring competitive intelligence system built from scratch at Ix — tracking 10+
        competitors across developer forums, funding announcements, and product launches,
        synthesized into weekly strategy briefs for executive leadership.
      </p>

      <ul class="project-bullets">
        <li>200+ competitor signals monitored across 20+ sources</li>
        <li>Behavioral cohort analysis driving 60% retention lift</li>
        <li>Landscape mapping: LangGraph, OpenAI, Neo4j, Mem0 and others</li>
      </ul>

      <div class="btn-row">
        <a class="btn btn-primary" href="intelligence.html">
          View Case Study
        </a>
        <a class="btn btn-secondary" href="projects.html">
          All Projects
        </a>
      </div>
    </div>

    <div class="highlight-box">
      <strong>Methods & tools</strong><br>
      Competitive Intelligence · Cohort Analysis · Signal Monitoring<br>
      Python · SQL · Tableau · Behavioral Analytics
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify**

```bash
open /tmp/portfolio-ci/index.html
```

Confirm expertise card 01 reads "Market Intelligence & Competitive Analysis" and featured project shows the Ix CI work.

- [ ] **Step 4: Commit**

```bash
cd /tmp/portfolio-ci
git add index.html
git commit -m "feat: update expertise cards and featured project for CI positioning"
```

---

## Task 4: Rewrite `index.html` experience section

**Files:**
- Modify: `/tmp/portfolio-ci/index.html`

- [ ] **Step 1: Replace the entire `exp-list` div**

Find the `<div class="exp-list">` block and replace its entire contents with:

```html
<div class="exp-item reveal">
  <div class="exp-meta">
    <div class="exp-company">Ix</div>
    <div class="exp-date">Dec 2025 &mdash; Present</div>
  </div>
  <div>
    <h3 class="exp-role">Market Intelligence &amp; Strategy Analyst</h3>
    <p style="color:var(--muted);font-size:0.88rem;margin-bottom:0.6rem;font-style:italic;">Early-Stage AI Infrastructure Startup — persistent world state &amp; memory layer for multi-agent AI systems</p>
    <ul class="exp-bullets">
      <li>Built a recurring competitive intelligence system tracking 10+ direct competitors — including LangGraph, OpenAI, Neo4j, and Mem0 — synthesizing product launches, funding rounds, and developer forum signals into weekly strategy briefs for executive leadership</li>
      <li>Drove a 60% increase in platform user retention by diagnosing engagement drop-off through behavioral cohort analysis and delivering targeted recommendations adopted by the product team</li>
      <li>Monitored 20+ sources — including developer forums (Reddit, HN, GitHub), academic research (arXiv), job listings, and funding announcements — to identify enterprise customer pipeline signals and map investor thesis alignment across the AI agent memory market</li>
      <li>Built and maintained telemetry-linked data pipelines supporting real-time product analytics, user behavior tracking, and executive reporting infrastructure</li>
      <li>Bridged product, engineering, and leadership by translating behavioral data and competitive findings into prioritized recommendations — serving as a core decision-support function in a resource-constrained, high-velocity environment</li>
    </ul>
  </div>
</div>

<div class="exp-item reveal">
  <div class="exp-meta">
    <div class="exp-company">Humboldt County</div>
    <div class="exp-date">Jan 2025 &mdash; May 2025</div>
  </div>
  <div>
    <h3 class="exp-role">GIS &amp; Economic Development Analyst</h3>
    <p style="color:var(--muted);font-size:0.88rem;margin-bottom:0.6rem;font-style:italic;">Department of Economic Development | Eureka, CA</p>
    <ul class="exp-bullets">
      <li>Built geospatial intelligence products using Python and ArcGIS to map regional assets and identify infrastructure gaps — deliverables incorporated into county economic development planning and resource allocation cycles</li>
      <li>Integrated spatial and tabular datasets to produce decision-support dashboards used in executive briefings and multi-stakeholder resource allocation planning</li>
      <li>Analyzed regional economic patterns to surface actionable insights on growth opportunities, directly informing policy recommendations submitted to county leadership</li>
    </ul>
  </div>
</div>

<div class="exp-item reveal">
  <div class="exp-meta">
    <div class="exp-company">Cal Poly Humboldt</div>
    <div class="exp-date">Jan 2024 &mdash; May 2024</div>
  </div>
  <div>
    <h3 class="exp-role">Research Analyst &mdash; IRAR</h3>
    <p style="color:var(--muted);font-size:0.88rem;margin-bottom:0.6rem;font-style:italic;">Institutional Research, Analytics &amp; Reporting | Arcata, CA</p>
    <ul class="exp-bullets">
      <li>Analyzed 140,000+ institutional records to evaluate program performance, enrollment trends, and resource allocation effectiveness across departments</li>
      <li>Designed automated data pipelines in Python to clean, standardize, and integrate multi-source datasets — improving reporting throughput and eliminating manual processing bottlenecks</li>
      <li>Produced executive-level analytical reports and Tableau dashboards used in leadership planning, accreditation reporting, and compliance audits</li>
    </ul>
  </div>
</div>

<div class="exp-item reveal">
  <div class="exp-meta">
    <div class="exp-company">Cal Poly Humboldt</div>
    <div class="exp-date">Aug 2025 &mdash; Dec 2025</div>
  </div>
  <div>
    <h3 class="exp-role">President &amp; Analytics Lead — Data Science Club</h3>
    <ul class="exp-bullets">
      <li>Led analytics teams delivering data projects for public agencies and research clients — managing scope, timelines, and stakeholder communication across concurrent workstreams</li>
      <li>Designed and taught technical curricula in Python, SQL, Tableau, and version control, building analytical capability across the organization</li>
    </ul>
  </div>
</div>
```

- [ ] **Step 2: Verify**

```bash
open /tmp/portfolio-ci/index.html
```

Confirm Ix role reads "Market Intelligence & Strategy Analyst" with the full CI bullet set. Confirm all four experience entries are present with correct dates and titles.

- [ ] **Step 3: Commit**

```bash
cd /tmp/portfolio-ci
git add index.html
git commit -m "feat: rewrite experience section — Ix CI role and updated titles/bullets"
```

---

## Task 5: Update `projects.html` — new filter and project cards

**Files:**
- Modify: `/tmp/portfolio-ci/projects.html`

- [ ] **Step 1: Add `market-intelligence` filter button**

In the filter bar, add after the existing `<button class="filter-btn" data-filter="ml">ML</button>`:

```html
<button class="filter-btn" data-filter="market-intelligence">Market Intelligence</button>
```

- [ ] **Step 2: Add 4 new project cards**

Before the closing `</section>` of the projects grid, add:

```html
<article class="proj-card reveal" data-category="market-intelligence gis analysis">
  <h3>Competitive Labor Market Intelligence</h3>
  <p>Mapped geographic supply-demand dynamics of app-based gig labor using Python and GIS, identifying market saturation zones and coverage gaps with direct applicability to commercial expansion planning.</p>
  <div class="proj-tag">Market Intelligence · GIS · Python</div>
</article>

<article class="proj-card reveal" data-category="analysis visualization">
  <h3>Workforce &amp; Equity Intelligence Dashboard</h3>
  <p>Combined census and institutional datasets to model workforce disparities and simulate policy impact scenarios across demographic and geographic dimensions.</p>
  <div class="proj-tag">Analysis · Tableau · Python</div>
</article>

<article class="proj-card reveal" data-category="analysis supply-chain">
  <h3>Hydrogen Transit Infrastructure — Operations &amp; Deployment Analysis</h3>
  <p>Built an interactive GIS decision tool to evaluate hydrogen bus deployment feasibility and infrastructure alignment; produced scenario analyses to support strategic investment planning.</p>
  <div class="proj-tag">GIS · Scenario Analysis · Python</div>
</article>

<article class="proj-card reveal" data-category="supply-chain logistics">
  <h3>Transportation Network Optimization Pipeline</h3>
  <p>Engineered an end-to-end analytics pipeline from data ingestion through route optimization to interactive visualization, producing a reusable decision tool for strategic network planning.</p>
  <div class="proj-tag">Supply Chain · Logistics · Python</div>
</article>
```

Note: No `proj-actions` / GitHub links are included for these four cards since repos are not confirmed. Add links if repos exist.

- [ ] **Step 3: Verify**

```bash
open /tmp/portfolio-ci/projects.html
```

Confirm "Market Intelligence" filter button appears. Click it — confirm "Competitive Labor Market Intelligence" card appears and others are hidden. Confirm all 4 new cards render with correct titles.

- [ ] **Step 4: Commit**

```bash
cd /tmp/portfolio-ci
git add projects.html
git commit -m "feat: add market-intelligence filter and 4 new project cards"
```

---

## Task 6: Update `about.html`

**Files:**
- Modify: `/tmp/portfolio-ci/about.html`

- [ ] **Step 1: Update page title and meta**

Replace:
```html
<title>About – Benjamin Lab</title>
<meta name="description" content="About Benjamin Lab — data scientist and spatial analyst specializing in supply chain analytics, logistics optimization, and economic modeling.">
```

With:
```html
<title>About – Benjamin Lab</title>
<meta name="description" content="About Benjamin Lab — strategy and analytics analyst specializing in market intelligence, competitive analysis, and decision support for digital health and AI infrastructure.">
```

- [ ] **Step 2: Update page subtitle**

Replace:
```html
<p class="page-subtitle">
    Data scientist and spatial analyst specializing in supply chain analytics,
    logistics optimization, and economic modeling.
</p>
```

With:
```html
<p class="page-subtitle">
    Strategy and analytics analyst specializing in market intelligence, competitive
    analysis, and decision support — built at the intersection of economics, data science,
    and AI infrastructure.
</p>
```

- [ ] **Step 3: Update "Who I am" paragraph**

Replace:
```html
<p>
    I'm Benjamin Lab, an Economics major at Cal Poly Humboldt with a
    concentration in Data Science and GIS. I specialize in applied
    quantitative analysis—combining econometric methods, machine
    learning, and spatial modeling to solve supply chain, logistics,
    and economic problems.
</p>
```

With:
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

- [ ] **Step 4: Fill in the Ix description (currently a `<!-- FILL IN -->` placeholder)**

Replace:
```html
<li>
    <strong>Ix — Founding Data Scientist.</strong>
    <!-- FILL IN: describe your role and key impact at Ix -->
</li>
```

With:
```html
<li>
    <strong>Ix — Market Intelligence &amp; Strategy Analyst.</strong>
    Built a recurring competitive intelligence system from scratch at an early-stage
    AI infrastructure startup — tracking 10+ competitors, monitoring 20+ sources
    (developer forums, arXiv, funding announcements, job listings), and delivering
    weekly strategy briefs to executive leadership. Drove a 60% lift in platform
    user retention through behavioral cohort analysis.
</li>
```

- [ ] **Step 5: Update technical skills block**

Replace the existing `<ul>` inside the highlight-box with:
```html
<ul style="margin-top:0.6rem;">
    <li>Python · pandas · NumPy · scikit-learn</li>
    <li>Competitive Intelligence · Market Research · Cohort Analysis</li>
    <li>SQL · data pipelines · Tableau · Streamlit</li>
    <li>Forecasting · econometrics · statistical modeling</li>
    <li>Spatial analysis · GeoPandas · ArcGIS · QGIS</li>
    <li>Machine learning · regression · classification</li>
    <li>AI pipeline integration · API pipelines · telemetry</li>
</ul>
```

- [ ] **Step 6: Verify**

```bash
open /tmp/portfolio-ci/about.html
```

Confirm new subtitle, updated "Who I am" paragraph, Ix description filled in, skills updated.

- [ ] **Step 7: Commit**

```bash
cd /tmp/portfolio-ci
git add about.html
git commit -m "feat: update about page — CI positioning, Ix description, skills"
```

---

## Task 7: Create `intelligence.html`

**Files:**
- Create: `/tmp/portfolio-ci/intelligence.html`

- [ ] **Step 1: Create the file**

Create `/tmp/portfolio-ci/intelligence.html` with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Intelligence Work — Benjamin Lab</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Commercial intelligence work by Benjamin Lab — competitive landscape analysis, market signal monitoring, and decision-support analytics.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@600;700&family=Inter:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/style.css">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">

  <style>
    .intel-wrapper { max-width: 860px; margin: 0 auto; padding: 6rem 1.25rem 4rem; }
    .case-study { border: 1px solid var(--border); background: var(--panel); padding: 2rem; margin-top: 2.5rem; }
    .case-study h3 { font-family: Merriweather, serif; color: var(--accent-2); font-size: 1.2rem; margin-bottom: 1rem; }
    .case-meta { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .case-meta-item { font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.05em; color: var(--muted); }
    .case-meta-item strong { color: var(--text); display: block; margin-bottom: 0.2rem; }
    .case-section { margin-top: 1.5rem; }
    .case-section h4 { font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.6rem; }
    .case-section p, .case-section li { color: var(--muted); font-size: 0.93rem; line-height: 1.75; }
    .case-section ul { padding-left: 1.2rem; }
    .signal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
    .signal-chip { border: 1px solid var(--border); padding: 0.5rem 0.75rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
    .signal-chip strong { color: var(--text); display: block; margin-bottom: 0.15rem; font-size: 0.78rem; }
    .in-progress-box { border: 1px dashed var(--border); padding: 1.75rem 2rem; margin-top: 3rem; }
    .in-progress-box p { color: var(--muted); font-size: 0.93rem; line-height: 1.75; margin-top: 0.5rem; }
    .outcome-row { display: flex; gap: 2rem; flex-wrap: wrap; margin-top: 0.75rem; }
    .outcome-stat { text-align: left; }
    .outcome-stat .stat-number { font-family: Merriweather, serif; font-size: 1.6rem; color: var(--accent-2); }
    .outcome-stat .stat-label { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.05em; color: var(--muted); margin-top: 0.15rem; }
  </style>
</head>
<body>

<nav>
  <div class="nav-container">
    <div class="nav-brand">Benjamin Lab</div>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="intelligence.html">Intelligence</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="Ben-Resume.pdf" target="_blank" rel="noopener">Resume</a></li>
    </ul>
  </div>
</nav>

<main class="intel-wrapper">

  <p class="section-label">Commercial Intelligence</p>
  <h1 class="page-title">Intelligence Work</h1>
  <p class="page-subtitle" style="max-width: 62ch;">
    Competitive intelligence means tracking what competitors are building, where the market
    is moving, and what signals — from hiring patterns to developer sentiment to funding flows
    — tell you before the press release does. The output is decision-ready, not academic.
  </p>

  <!-- CASE STUDY -->
  <div class="case-study reveal">
    <p class="section-label" style="margin-bottom: 0.75rem;">Case Study &mdash; 2025&ndash;2026</p>
    <h3>AI Agent Memory Market &mdash; Competitive Landscape</h3>

    <div class="case-meta">
      <div class="case-meta-item">
        <strong>Context</strong>
        Early-stage AI infrastructure startup
      </div>
      <div class="case-meta-item">
        <strong>Role</strong>
        Market Intelligence &amp; Strategy Analyst
      </div>
      <div class="case-meta-item">
        <strong>Duration</strong>
        Dec 2025 &mdash; Present
      </div>
      <div class="case-meta-item">
        <strong>Deliverable</strong>
        Recurring weekly strategy briefs
      </div>
    </div>

    <div class="case-section">
      <h4>Problem</h4>
      <p>
        Ix needed ongoing competitive awareness in the stateful AI infrastructure space — a
        fast-moving market with no dominant player, significant VC activity, and developer
        adoption as the key battleground metric. There was no dedicated CI function. The
        challenge was building a system that could track signal at scale and surface it in
        a form leadership could act on, week over week.
      </p>
    </div>

    <div class="case-section">
      <h4>System Built</h4>
      <p>
        A recurring monitoring pipeline across 20+ sources, structured to separate signal types
        and synthesize them into weekly executive briefs. Sources were typed by what they reveal:
      </p>
      <div class="signal-grid">
        <div class="signal-chip">
          <strong>Developer sentiment</strong>
          Reddit, Hacker News, GitHub issues
        </div>
        <div class="signal-chip">
          <strong>Product velocity</strong>
          Changelog monitoring, release notes, API changes
        </div>
        <div class="signal-chip">
          <strong>Investor thesis</strong>
          Funding announcements, round sizing, lead investors
        </div>
        <div class="signal-chip">
          <strong>Talent signals</strong>
          Job listings — role type, seniority, stack
        </div>
        <div class="signal-chip">
          <strong>Research frontier</strong>
          arXiv preprints in agent memory and stateful AI
        </div>
      </div>
    </div>

    <div class="case-section">
      <h4>Landscape Mapped</h4>
      <p>
        10+ direct competitors tracked across the stateful AI infrastructure space — including
        LangGraph, OpenAI (memory APIs), Neo4j, Mem0, and others — categorized by product
        positioning, developer traction, and funding stage. Landscape updated continuously as
        new entrants emerged and incumbents shipped.
      </p>
    </div>

    <div class="case-section">
      <h4>Outputs &amp; Impact</h4>
      <div class="outcome-row">
        <div class="outcome-stat">
          <div class="stat-number">10+</div>
          <div class="stat-label">Competitors tracked</div>
        </div>
        <div class="outcome-stat">
          <div class="stat-number">20+</div>
          <div class="stat-label">Signal sources monitored</div>
        </div>
        <div class="outcome-stat">
          <div class="stat-number">60%</div>
          <div class="stat-label">User retention lift</div>
        </div>
        <div class="outcome-stat">
          <div class="stat-number">Weekly</div>
          <div class="stat-label">Executive briefs delivered</div>
        </div>
      </div>
      <p style="margin-top: 1rem;">
        Beyond the competitive landscape: behavioral cohort analysis of platform users
        diagnosed engagement drop-off and surfaced targeted recommendations that drove a 60%
        increase in user retention — adopted directly by the product team. The CI system also
        identified enterprise customer pipeline signals and mapped investor thesis alignment
        across the AI agent memory market.
      </p>
    </div>
  </div>

  <!-- IN PROGRESS -->
  <div class="in-progress-box reveal">
    <p class="section-label" style="margin-bottom: 0.5rem;">In Development</p>
    <h2 style="font-family: Merriweather, serif; font-size: 1.1rem; color: var(--accent-2);">
      Next: Health Tech Commercial Intelligence
    </h2>
    <p>
      Applying the same CI methodology to the digital health space — market structure analysis,
      hiring signal breakdowns, pricing intelligence, and category mapping across health tech
      segments. Work in progress. <a href="mailto:benjaminmonroelab@gmail.com" style="color: var(--accent-2);">Reach out</a> if you're working in this space.
    </p>
  </div>

</main>

<footer>
  <div class="footer-inner">
    <span>&copy; 2025 Benjamin Lab</span>
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
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ observer.observe(el); });
  })();
</script>

</body>
</html>
```

- [ ] **Step 2: Verify**

```bash
open /tmp/portfolio-ci/intelligence.html
```

Confirm the page loads with: methodology header, Ix case study with all five sections (Problem, System Built, Landscape Mapped, Outputs & Impact including stat numbers), signal type chips, and the "Next: Health Tech" in-progress box. Confirm nav shows "Intelligence" as active.

- [ ] **Step 3: Commit**

```bash
cd /tmp/portfolio-ci
git add intelligence.html
git commit -m "feat: add intelligence.html — Ix CI case study and health tech in-progress section"
```

---

## Task 8: Final review and push

- [ ] **Step 1: Open all four pages and do a full visual pass**

```bash
open /tmp/portfolio-ci/index.html
open /tmp/portfolio-ci/about.html
open /tmp/portfolio-ci/projects.html
open /tmp/portfolio-ci/intelligence.html
```

Check:
- Nav shows Home / Projects / Intelligence / About / Resume on all four pages
- "Intelligence" nav link is active on `intelligence.html`
- Hero reads "Market Intelligence, business analysis, and operational decision support"
- Featured project on homepage links to `intelligence.html`
- Ix role reads "Market Intelligence & Strategy Analyst" with 5 bullets
- About page Ix description no longer has `<!-- FILL IN -->`
- Market Intelligence filter works on projects page
- All 4 new project cards visible under that filter

- [ ] **Step 2: Check git log**

```bash
cd /tmp/portfolio-ci
git log --oneline
```

Expected: 6 new commits on top of `d114619`.

- [ ] **Step 3: Push to GitHub**

```bash
cd /tmp/portfolio-ci
git push origin main
```

- [ ] **Step 4: Verify live site**

Wait ~60 seconds for GitHub Pages to rebuild, then open `https://mossfunki.github.io` in browser. Confirm the live site reflects all changes.

---

## Self-Review Notes

- All nav changes (Task 1) applied to index, about, projects — and the new intelligence.html is created with the correct nav in Task 7. No page is missing the Intelligence link.
- The Ix date discrepancy: resume says "December 2025", current site says "Jan 2026". Plan uses "Dec 2025" from the resume — the source of truth.
- The 4 new project cards have no `proj-actions` block intentionally — GitHub links not confirmed. If repos exist, add `<div class="proj-actions"><a class="primary" href="...">GitHub</a></div>` to each card.
- The `intelligence.html` email link uses `benjaminmonroelab@gmail.com` (from resume) not `bml65@humboldt.edu` (old address on existing pages). The footer email on existing pages should also be updated — add this to Task 8 Step 1 visual check and fix if noticed.
- The `style.css` is not modified. All new CSS in `intelligence.html` is scoped via page-specific classes.
