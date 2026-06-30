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
  if (yoy < -5)  return [ 56, 189, 248, 230];
  if (yoy < 0)   return [  0, 216, 200, 230];
  if (yoy < 5)   return [ 52, 211, 153, 230];
  if (yoy < 10)  return [251, 191,  36, 230];
  if (yoy < 18)  return [249, 115,  22, 230];
  return [239, 68, 68, 230];
}

function toHex([r, g, b]) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function getElevationScale(counties) {
  const max = Math.max(...counties.map(c => Math.abs(c.yoyChange || 0)), 1);
  return 160000 / max;
}

function circlePolygon([lon, lat], radiusDeg, steps = 28) {
  const latR = (lat * Math.PI) / 180;
  const lonScale = radiusDeg / Math.cos(latR);
  const ring = [];
  for (let i = 0; i <= steps; i++) {
    const θ = (i / steps) * 2 * Math.PI;
    ring.push([lon + lonScale * Math.cos(θ), lat + radiusDeg * Math.sin(θ)]);
  }
  return ring;
}

const SRC_ID   = 're-counties-src';
const LAYER_ID = 're-fill-extrusion';

export default class RealEstateModule {
  constructor() {
    this._counties = null;
    this._elevScale = 1;
    this._map = null;
    this.viewState = { pitch: 45 };
  }

  bindMap(map) { this._map = map; }

  async load() {
    if (this._counties) return;
    const r = await fetch('./data/real-estate.json');
    if (!r.ok) throw new Error(`real-estate.json fetch failed: ${r.status}`);
    const data = await r.json();
    this._counties  = normalizeCounties(data.counties);
    this._elevScale = getElevationScale(this._counties);
  }

  activate() {
    const map = this._map;
    if (!map || !this._counties) return;

    const radiusDeg = 0.9; // ~100km circle per county
    const geojson = {
      type: 'FeatureCollection',
      features: this._counties.map(c => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [circlePolygon(c.position, radiusDeg)],
        },
        properties: {
          name:      c.name,
          state:     c.state,
          yoy:       c.yoyChange,
          elevation: Math.abs(c.yoyChange) * this._elevScale,
          color:     toHex(appreciationColor(c.yoyChange)),
        },
      })),
    };

    if (!map.getSource(SRC_ID)) {
      map.addSource(SRC_ID, { type: 'geojson', data: geojson });
    }

    if (!map.getLayer(LAYER_ID)) {
      map.addLayer({
        id: LAYER_ID,
        type: 'fill-extrusion',
        source: SRC_ID,
        paint: {
          'fill-extrusion-color':   ['get', 'color'],
          'fill-extrusion-height':  ['get', 'elevation'],
          'fill-extrusion-base':    0,
          'fill-extrusion-opacity': 0.88,
        },
      });
    }
  }

  deactivate() {
    const map = this._map;
    if (!map) return;
    if (map.getLayer(LAYER_ID))  map.removeLayer(LAYER_ID);
    if (map.getSource(SRC_ID)) map.removeSource(SRC_ID);
  }

  getLayers() { return []; }

  getStats() {
    if (!this._counties) return { cards: [] };
    const sorted = [...this._counties].sort((a, b) => b.yoyChange - a.yoyChange);
    const natl   = this._counties.reduce((s, c) => s + c.yoyChange, 0) / this._counties.length;
    const sign   = natl >= 0 ? '+' : '';
    return {
      cards: [
        { label: 'Median YoY Change', value: `${sign}${natl.toFixed(1)}%`,                            accent: natl >= 0 ? 'success' : 'danger' },
        { label: 'Hottest Market',    value: `${sorted[0]?.name}, ${sorted[0]?.state}` || '-',         accent: 'danger' },
        { label: 'Most Distressed',   value: `${sorted.at(-1)?.name}, ${sorted.at(-1)?.state}` || '-', accent: 'amber'  },
      ],
    };
  }

  getChartConfig() {
    if (!this._counties) return null;
    const target = this._counties[0];
    return {
      type:  'line',
      title: target ? `${target.name}, ${target.state}` : 'Select a county',
      data:  target?.priceHistory || [],
    };
  }
}
