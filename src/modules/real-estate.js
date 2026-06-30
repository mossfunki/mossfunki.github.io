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
  if (yoy < -5)  return [ 56, 189, 248, 230];  // bright sky blue — declining
  if (yoy < 0)   return [  0, 210, 200, 230];  // teal — slight decline
  if (yoy < 5)   return [ 52, 211, 153, 230];  // emerald — flat
  if (yoy < 10)  return [251, 191,  36, 230];  // amber — appreciating
  if (yoy < 18)  return [249, 115,  22, 230];  // orange — hot
  return [239,  68,  68, 230];                  // red — on fire
}

export function getElevationScale(counties) {
  const max = Math.max(...counties.map(c => Math.abs(c.yoyChange || 0)), 1);
  return 200000 / max;
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
        diskResolution: 12,
        radius: 55000,
        extruded: true,
        getPosition:   d => d.position,
        getElevation:  d => Math.abs(d.yoyChange) * this._elevScale,
        getFillColor:  d => appreciationColor(d.yoyChange),
        getLineColor:  d => appreciationColor(d.yoyChange).map((v, i) => i === 3 ? 255 : v),
        lineWidthMinPixels: 1,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 140],
        elevationScale: 1,
        material: { ambient: 0.35, diffuse: 0.8, shininess: 32, specularColor: [60, 64, 70] },
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
        { label: 'Median YoY Change',  value: `${sign}${natl.toFixed(1)}%`,                            accent: natl >= 0 ? 'success' : 'danger' },
        { label: 'Hottest Market',     value: `${sorted[0]?.name}, ${sorted[0]?.state}` || '—',         accent: 'danger' },
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
