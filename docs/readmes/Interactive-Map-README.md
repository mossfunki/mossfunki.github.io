# Interactive Map — Humboldt County Parcel Viewer

An interactive browser-based map for exploring land parcel data across Humboldt County, California. Built with Folium and Leaflet.js, the map renders GeoJSON parcel polygons with attribute data drawn from county assessor records.

## Features

- Interactive pan and zoom across Humboldt County, CA (approx. -124.23° to -123.63°W, 40.01° to 41.29°N)
- GeoJSON polygon layer displaying county land parcels
- Parcel attributes including land use description, acreage, and Assessor Parcel Number (APN)
- OpenStreetMap basemap for geographic context
- Tooltips on parcel hover (Folium `foliumtooltip` styling)
- Standalone single-file HTML — no server or dependencies required

## Data

Parcel records sourced from Humboldt County assessor data. Key attributes per parcel:

| Field | Description |
|---|---|
| `APN` / `APN_12` | Assessor Parcel Number |
| `DESCRIPTIO` | Land use type (e.g., "Commercial, Miscellaneous", "Heavy Industrial, Wood Product") |
| `ACRES` | Parcel area in acres |
| `AREA` / `PERIMETER` | Geometric measurements |
| `BKPG` | Book/page reference |
| `LASTUPDATE` | Date of last record update |
| `SOURCE` | Data source |

## Tech Stack

- **Python** — data processing and map generation
- **[Folium](https://python-visualization.github.io/folium/)** — Python wrapper for Leaflet.js
- **[Leaflet.js 1.9.3](https://leafletjs.com/)** — JavaScript mapping library
- **OpenStreetMap** — tile basemap
- **GeoJSON** — parcel geometry and attribute format

## Usage

The map is distributed as a self-contained HTML file. No installation or server is needed.

1. Download `filtered_parcels_map.html`
2. Open it in any modern web browser:

```bash
open filtered_parcels_map.html        # macOS
start filtered_parcels_map.html       # Windows
xdg-open filtered_parcels_map.html   # Linux
```

3. Pan and zoom to explore parcels. Hover over a polygon to view parcel attributes.

## Status

> **Work in progress.** Parcel filtering logic, tooltip configuration, and visual styling are under active development. Data coverage and attribute display may be incomplete.
