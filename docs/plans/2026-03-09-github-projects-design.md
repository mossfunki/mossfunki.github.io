# GitHub Projects Integration — Design Document
_2026-03-09_

## Goal
Fix up existing GitHub repos and push new ones, then surface all projects on the personal portfolio site at mossfunki.github.io.

## Scope

### Repos to clean up (existing on GitHub)
| Repo | Action |
|---|---|
| `Dashboards-Streamlit` | Write README |
| `DLogis` | README exists — update description/topics only |
| `webscraper` | Write README |
| `Interactive-Map` | Write README |

### New repos to create (local → GitHub)
| Local folder | New repo name |
|---|---|
| `Projects/seattle-transit-equity` | `seattle-transit-equity` |
| `Projects/seattle-last-mile-logistics` | `seattle-last-mile-logistics` |
| `Projects/pnw-supply-chain-dashboard` | `pnw-supply-chain-dashboard` |

### Excluded from website (kept on GitHub, not showcased)
- `Eureka-CPI-2025` — Excel file only, not presentable
- `Data271_Final_Project` — school assignment, not portfolio-ready

## Design

### Phase 1 — Write READMEs (parallel agents)
Three agents run simultaneously:
- **Agent A**: `Dashboards-Streamlit`, `webscraper` — fetch source files via GitHub API, write draft READMEs
- **Agent B**: `Interactive-Map` — fetch HTML file, write draft README
- **Agent C**: Read notebooks in the 3 local projects, write a README for each

Each README covers: project purpose, tech stack, how to run it, short WIP disclaimer.

### Phase 2 — Push to GitHub (sequential)
- Clone each existing repo, commit README, push back
- Create 3 new GitHub repos for local projects, push code + README
- Update GitHub repo descriptions and topics for all 7 repos

### Phase 3 — Website integration
- Add 7 new project cards to `projects.html` (the 4 existing GitHub repos + 3 new ones)
- Existing 3 Austin cards remain
- Add new filter tags: `supply-chain`, `ml`, `logistics`, `scraping`
- Cards link to GitHub repo (and live demo where available)

## Tech notes
- Site is static HTML/CSS on GitHub Pages — no build step
- GitHub pushes require SSH or HTTPS git credentials
- Local projects are in `/Users/benjaminlab/Personal Website/Projects/`
- Portfolio repo is at `/Users/benjaminlab/Personal Website/mossfunki.github.io/`
