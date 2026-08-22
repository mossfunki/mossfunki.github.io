# Portfolio Redesign — Commercial Intelligence Positioning
_2026-04-08_

## Goal

Reposition mossfunki.github.io from a data science / GIS portfolio toward a **market intelligence and commercial analytics** profile targeting **digital health / health tech startup** roles (commercial intelligence analyst, strategy analyst, market research). The Ix competitive intelligence work becomes the centerpiece. A new dedicated Intelligence page establishes the CI methodology and anchors future health/biotech work as it develops.

## Audience

Recruiters and hiring managers at digital health / health tech startups looking for a commercial intelligence, strategy analyst, or market research hire — someone who can build the analytical function from scratch in a fast-moving environment.

## Scope

### Pages changed
| Page | Type | Summary |
|---|---|---|
| `index.html` | Update | New hero copy, rewritten Ix experience, updated other roles, new featured project block |
| `about.html` | Update | Updated title/summary, fleshed-out Ix description, updated skills |
| `projects.html` | Update | 4 new project cards, new `market-intelligence` filter |
| `intelligence.html` | New | Dedicated CI page with Ix case study and in-progress health/biotech section |

### Nav change
Add **Intelligence** link between Projects and About across all pages.

---

## Design

### 1. Positioning

**Old:** *"Data Scientist & Spatial Analyst — supply chain, logistics, GIS"*

**New:** *"Strategy & Analytics Analyst | Market Intelligence · Business Analysis · AI Infrastructure"*

**Hero subtitle (new):**
> "I build competitive intelligence systems, forecasting models, and analytical infrastructure that translate market signals and behavioral data into strategy — at the speed early-stage teams actually operate."

**Hero tool tags (updated):**
- Remove: Supply Chain Optimization, GIS
- Add: Competitive Intelligence, Market Research
- Keep: Python, SQL, Machine Learning, Econometrics

**Hero CTA buttons:**
- View Projects (existing)
- Intelligence Work (new — links to `intelligence.html`)
- About Me (existing)
- Resume (existing)

---

### 2. `intelligence.html` — New Page

Three zones:

**Zone 1 — Methodology header**
Brief framing: what commercial intelligence means in practice — tracking competitor moves, hiring patterns, funding flows, and developer sentiment; synthesizing them into decision-ready analysis. Not academic. Operational.

**Zone 2 — Ix CI Case Study (anchor artifact)**
Named: *"AI Agent Memory Market — Competitive Landscape, 2025–2026"*

Structured as a written case study:
- **Problem:** Seed-stage AI infrastructure startup needed ongoing competitive awareness with no dedicated CI function
- **System built:** Recurring monitoring of 20+ sources (Reddit, HN, GitHub, arXiv, job listings, funding announcements) structured into weekly executive strategy briefs
- **Landscape mapped:** 10+ competitors — LangGraph, OpenAI, Neo4j, Mem0 and others — categorized by product positioning, developer traction, and funding stage
- **Outputs:** Weekly strategy briefs for executive leadership; behavioral cohort analysis driving a 60% increase in platform user retention; enterprise customer pipeline signals from job listing and forum analysis
- **Method note:** How signal sources were typed (developer sentiment vs. investor thesis vs. product velocity) and synthesized

This reads as a sample deliverable — shows the thinking, not just the outcome.

**Zone 3 — In Progress**
Titled: *"Next: Health Tech Commercial Intelligence"*
1-2 sentences signaling that health/biotech domain CI work is in development. Invites conversation. No fake work or placeholder analysis.

---

### 3. `index.html` — Updates

**Experience section — Ix**
- Role: **Market Intelligence & Strategy Analyst** (was: Founding Data Scientist)
- Bullets from resume:
  - Built recurring CI system tracking 10+ direct competitors (LangGraph, OpenAI, Neo4j, Mem0), synthesizing product launches, funding rounds, and forum signals into weekly strategy briefs
  - 60% increase in platform user retention via behavioral cohort analysis
  - 20+ source monitoring pipeline for enterprise pipeline signals and investor thesis mapping
  - Telemetry-linked data pipelines for real-time product analytics and executive reporting
  - Decision-support bridge across product, engineering, and leadership

**Experience section — other roles**
| Role (current site) | Updated to |
|---|---|
| Economic Development Intern | GIS & Economic Development Analyst |
| Institutional Research & Analytics Intern | Research Analyst — IRAR |
| Data Science Club President | President & Analytics Lead |

All bullets updated to match resume versions.

**Featured project block**
Swap Austin Investment Map → Ix CI work. New block links to `intelligence.html`. Austin remains in the projects grid.

**What I do / Expertise cards**
Update card 01 from "Supply Chain & Logistics" to "Market Intelligence & Competitive Analysis" with updated description focused on CI systems, signal monitoring, and decision support.

---

### 4. `projects.html` — Updates

**New filter button:** `market-intelligence`

**New project cards (4, from resume):**

| Project | Tags | Link |
|---|---|---|
| Competitive Labor Market Intelligence — Gig Economy Spatial Analysis | market-intelligence, gis, analysis | GitHub if available |
| Workforce & Equity Intelligence Dashboard | analysis, visualization | GitHub if available |
| Hydrogen Transit Infrastructure — Operations & Deployment Analysis | analysis, supply-chain | GitHub if available |
| Transportation Network Optimization Pipeline | supply-chain, logistics | GitHub if available |

---

### 5. `about.html` — Updates

- Page subtitle: updated to match new positioning
- "Who I am" paragraph: rewritten — Economics + data science background, now focused on commercial intelligence and decision support at the intersection of market research, behavioral analysis, and AI infrastructure
- Ix description: filled in from resume (currently has a `<!-- FILL IN -->` placeholder)
- Technical skills block additions: Competitive Intelligence, Market Research, Cohort Analysis

---

## Technical Notes

- Site is static HTML/CSS on GitHub Pages — no build step
- All changes fit the existing design system (`style.css` unchanged)
- Local working copy: `/Users/benjaminlab/Personal Website/mossfunki.github.io/` (docs only — not a git repo locally)
- Live repo: `https://github.com/mossfunki/mossfunki.github.io.git`
- Implementation should clone the live repo, make changes, and push

## Out of Scope

- Health/biotech CI analysis pieces (to be added when domain work develops)
- CSS/design system changes
- New GitHub projects or READMEs
- Resume file update (separate artifact)
