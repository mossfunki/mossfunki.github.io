# Portfolio Reformat, Resume Alignment & Vercel Migration

Date: 2026-07-10
Status: Approved for planning

## Context

The site (`mossfunki.github.io`, currently hosted on GitHub Pages) has drifted out of
sync with itself. Four different sources of "the same" content disagree:

- `Benjamin Lab - Resume.docx` (local, confirmed as the fact source of truth for
  employers, dates, and the 4 core Selected Projects)
- `resume.html` (the site's own print-style resume page) — lists a different project
  set (a bundled "Trilogy" entry + a "Last-Mile Delivery Gap Analysis" project that
  appears nowhere else) and is missing Hydrogen entirely
- `about.html` — experience section matches the docx; skills list is longer and
  includes tools not on the resume
- `index.html` homepage — Featured Work section bundles 3 projects into one card, has
  an unrelated "User Retention Analysis" project card, and shows conflicting location
  text ("San Diego, CA · Seattle, WA" in the hero vs. "San Diego, CA" only in the
  footer, vs. "Seattle, WA" on the resume)

Separately, the user wants the site to read as a portfolio (work-forward, recruiter
facing) rather than a personal site, wants a professional custom domain instead of
`mossfunki.github.io`, and wants to move hosting to Vercel.

## Goals

1. Restructure the homepage Featured Work section into a tabbed, categorized project
   grid covering all 6 current projects.
2. Make the resume the fact source of truth across the site; fix drift in
   `resume.html` and location text.
3. Shift the site's tone from personal to portfolio: add a Resume nav link,
   de-emphasize hobby content.
4. Migrate hosting from GitHub Pages to Vercel, replacing the `gh-pages` deploy flow,
   and attach the newly-purchased domain `benjaminmonroelab.com`.

## 1. Featured Work: tabbed, categorized grid

**Tabs:** `All` · `Logistics & Supply Chain` · `GIS & Spatial Analysis` ·
`Economics & Analytics`. Implemented as a small tab bar above the existing
`.work-grid`; clicking a tab filters cards client-side by a `data-categories`
attribute (comma-separated, cards may belong to more than one category and appear
under each). No page reload, no new dependency — vanilla JS in `src/main.js` or a new
small module.

**Cards** (replaces the current 3-card bundle; drops "User Retention Analysis" from
this section entirely — see §2):

| Card | Categories | Metric chip(s) | Links to |
|---|---|---|---|
| Transit-Oriented Development & Affordability Model | gis, economics | 531k parcels · OLS R²=0.50 | `github.com/mossfunki/seattle-gis-portfolio` |
| Automated Collision Risk Pipeline | gis | 303 clusters · DBSCAN | same repo |
| Urban Heat Island Prediction | gis | Random Forest + SHAP | same repo |
| Hydrogen Corridor Routing & Infrastructure Gap Analysis | logistics, gis | 18.8% fuel savings | `github.com/mossfunki/hydrogen-route-elevation-analysis` |
| Demand Forecasting & Safety Stock Optimization | logistics, economics | 8.4% MAPE · 31% fewer stockouts | `github.com/mossfunki/demand-inventory-forecast` |
| Energy-Adjusted Logistics Forecasting | logistics, economics | *(none — no repo exists yet)* | No CTA button |

Visual treatment: drop the old "primary/large" card variant; uniform grid across all
6 cards using the existing `.work-card` component styling (label, title, desc, chips,
tags, optional CTA). Only the tab bar and its filter JS are new.

Heat Island and Energy-Adjusted Logistics are explicitly **site-only** additions —
real work, not currently listed on the resume. No attempt is made to retrofit them
into `resume.html`.

## 2. Resume alignment

The docx is the fact source of truth for employers, dates, and the 4 core Selected
Projects (TOD, Hydrogen, Collision Risk, Demand Forecasting).

- **`resume.html` Projects section**: replace the current 3-entry list (bundled
  Trilogy + Last-Mile Delivery Gap Analysis + Demand Forecasting) with 4 entries
  matching the docx's project set, written in `resume.html`'s existing prose style
  (richer than the docx's one-liners is fine — factual content must match, wording
  doesn't need to be verbatim). This adds a Hydrogen entry and removes the
  "Last-Mile Delivery Gap Analysis" project, which isn't on the docx or anywhere else
  in this design.
- **Location**: fixed to "Seattle, WA" only, everywhere Benjamin's personal location
  appears — homepage hero eyebrow, homepage footer. `resume.html` already correctly
  says "Seattle, WA, Relocating" — no change needed there. Ix's own office location
  ("San Diego, CA") stays in the experience entry on `about.html` and `resume.html`
  since that's the employer's city, not Benjamin's — not a conflict.
- **"User Retention Analysis: 60% Lift" card**: removed from the homepage Featured
  Work grid (it's Ix employment history per the docx, not a portfolio project). Not
  re-added elsewhere — `about.html`'s existing Experience section already covers this
  work under the Ix entry.
- Skills lists on `about.html` are left as-is (superset of the resume's skills is
  fine for a portfolio site; not a correctness issue).

## 3. Portfolio-not-personal reformat

- Add a "Resume" link to the nav bar on both `index.html` and `about.html`, next to
  "About," pointing to `/resume.html`.
- De-emphasize the "Outside the work" section on `about.html`: smaller section
  heading, single compact photo strip instead of the current 3-column grid, reduced
  visual weight. Section stays in its current position (last on the page) and is not
  deleted.
- No other nav/structure changes — Featured Work already leads the homepage, which is
  the primary portfolio-vs-personal signal.

## 4. Hosting migration: GitHub Pages → Vercel

- Connect the `mossfunki/mossfunki.github.io` GitHub repo to a new Vercel project.
  Vite auto-detected build; no custom `vercel.json` expected to be necessary for a
  static build, confirm during implementation.
- Vercel auto-deploys on push to `main`, replacing the current `npm run deploy`
  (`gh-pages -d dist`) flow. The `gh-pages` deploy script and `gh-pages` branch are
  retired once Vercel is confirmed live — GitHub Pages is not kept as a fallback per
  user decision.
- Attach the custom domain `benjaminmonroelab.com` (already purchased by user) to the
  Vercel project; configure DNS per Vercel's instructions at the domain's registrar.
- Update all internal absolute links/canonical URLs/meta tags that currently assume
  `mossfunki.github.io` to the new domain.

## Out of scope (explicitly deferred)

- Building out the "Energy-Adjusted Logistics Forecasting" project itself (no repo,
  no data, no analysis exists yet) — card shows description only, no link.
- Creating/reorganizing dedicated GitHub repos + READMEs for every project, and
  embedding live visualizations for each project in the site — flagged earlier in
  this conversation as a much larger, separate initiative; not part of this spec.
- Any repo/README cleanup beyond what's needed for the 3 existing repo links used in
  the Featured Work cards.
