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

const SRC_ID  = 'lm-points-src';
const HALO_ID = 'lm-halo';
const RING_ID = 'lm-ring';
const CORE_ID = 'lm-core';

export default class LaborMarketsModule {
  constructor() {
    this._points = null;
    this._metros = [];
    this._map    = null;
    this.viewState = { pitch: 28 };
  }

  bindMap(map) { this._map = map; }

  async load() {
    if (this._points) return;
    const r = await fetch('./data/labor-markets.json');
    if (!r.ok) throw new Error(`labor-markets.json fetch failed: ${r.status}`);
    const data = await r.json();
    this._points = normalizePoints(data.points);
    this._metros = data.metros || [];
  }

  activate() {
    const map = this._map;
    if (!map || !this._points) return;

    const maxEmp  = Math.max(...this._points.map(p => p.employment), 1);
    const maxWage = Math.max(...this._points.map(p => p.medianWage), 1);

    const geojson = {
      type: 'FeatureCollection',
      features: this._points.map(p => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p.position },
        properties: {
          empNorm:  p.employment / maxEmp,
          wageNorm: p.medianWage / maxWage,
        },
      })),
    };

    if (!map.getSource(SRC_ID)) {
      map.addSource(SRC_ID, { type: 'geojson', data: geojson });
    }

    if (!map.getLayer(HALO_ID)) {
      map.addLayer({
        id: HALO_ID,
        type: 'circle',
        source: SRC_ID,
        paint: {
          'circle-radius':       ['interpolate', ['linear'], ['get', 'empNorm'], 0, 20, 1, 70],
          'circle-color':        ['interpolate', ['linear'], ['get', 'wageNorm'],
            0, 'rgba(212,98,42,0.03)', 1, 'rgba(212,98,42,0.07)'],
          'circle-stroke-width': 0,
          'circle-pitch-alignment': 'map',
        },
      });
    }

    if (!map.getLayer(RING_ID)) {
      map.addLayer({
        id: RING_ID,
        type: 'circle',
        source: SRC_ID,
        paint: {
          'circle-radius':       ['interpolate', ['linear'], ['get', 'empNorm'], 0, 12, 1, 42],
          'circle-color':        'rgba(0,0,0,0)',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': ['interpolate', ['linear'], ['get', 'wageNorm'],
            0, 'rgba(140,60,15,0.5)', 1, 'rgba(212,98,42,0.75)'],
          'circle-pitch-alignment': 'map',
        },
      });
    }

    if (!map.getLayer(CORE_ID)) {
      map.addLayer({
        id: CORE_ID,
        type: 'circle',
        source: SRC_ID,
        paint: {
          'circle-radius':       ['interpolate', ['linear'], ['get', 'empNorm'], 0, 5, 1, 14],
          'circle-color':        ['interpolate', ['linear'], ['get', 'wageNorm'],
            0, 'rgba(140,60,15,0.9)', 1, 'rgba(212,98,42,0.95)'],
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
          'circle-pitch-alignment': 'map',
        },
      });
    }
  }

  deactivate() {
    const map = this._map;
    if (!map) return;
    [HALO_ID, RING_ID, CORE_ID].forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
    if (map.getSource(SRC_ID)) map.removeSource(SRC_ID);
  }

  getLayers() { return []; }

  getStats() {
    if (!this._points) return { cards: [] };
    const avgWage = this._points.reduce((s, p) => s + p.medianWage, 0) / this._points.length;
    const avgGig  = this._points.reduce((s, p) => s + p.gigShare,   0) / this._points.length;
    return {
      cards: [
        { label: 'Avg Median Wage',   value: `$${(avgWage / 1000).toFixed(0)}k`, accent: 'cyan'  },
        { label: 'Gig Economy Share', value: `${(avgGig * 100).toFixed(1)}%`,     accent: 'amber' },
        { label: 'Metro Data Points', value: String(this._points.length),         accent: 'cyan'  },
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
