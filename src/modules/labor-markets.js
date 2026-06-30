import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

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
    const maxWage = Math.max(...this._points.map(p => p.medianWage), 1);
    return [
      new HeatmapLayer({
        id: 'lm-heat',
        data: this._points,
        getPosition: d => d.position,
        getWeight:   d => d.medianWage / maxWage,
        radiusPixels: 120,
        intensity: 3,
        threshold: 0.03,
        colorRange: [
          [8,   13,  26 ],
          [0,   40,  100],
          [0,   90,  180],
          [0,  160,  240],
          [0,  212,  255],
          [180, 240, 255],
        ],
        pickable: false,
      }),
      new ScatterplotLayer({
        id: 'lm-dots',
        data: this._points,
        getPosition: d => d.position,
        getRadius:   d => Math.max(30000, Math.sqrt(d.employment / 800) * 8000),
        getFillColor: d => {
          const t = Math.min(1, d.medianWage / maxWage);
          return [Math.round(t * 0), Math.round(100 + t * 112), 255, 200];
        },
        getLineColor: [0, 212, 255, 160],
        lineWidthMinPixels: 1,
        stroked: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 100],
      }),
    ];
  }

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
