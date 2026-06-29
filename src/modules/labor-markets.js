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
        getPosition:        d => d.position,
        getElevationWeight: d => d.employment,
        getColorWeight:     d => d.medianWage,
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
