const CLUSTER_COLORS = {
  0: [ 52, 211, 153, 255],
  1: [  0, 212, 255, 255],
  2: [251, 191,  36, 255],
  3: [249, 115,  22, 255],
  4: [239,  68,  68, 255],
};

const CLUSTER_LABELS = {
  0: 'Low Risk',
  1: 'Low-Mod',
  2: 'Moderate',
  3: 'Elevated',
  4: 'High Risk',
};

export function toRgb(clusterId) {
  return CLUSTER_COLORS[clusterId] ?? [128, 128, 128, 255];
}

const SOURCE_ID = 'risk-counties';
const LAYER_ID  = 'risk-fill-extrusion';

export default class RiskIndexModule {
  constructor() {
    this._geojson  = null;
    this._map      = null;
    this.viewState = { pitch: 55, bearing: -10 };
  }

  bindMap(map) {
    this._map = map;
  }

  async load() {
    if (this._geojson) return;
    const r = await fetch('./data/counties.geojson');
    if (!r.ok) throw new Error(`counties.geojson fetch failed: ${r.status}`);
    this._geojson = await r.json();
  }

  getLayers() {
    return [];
  }

  activate() {
    const map = this._map;
    if (!map || !this._geojson) return;

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, { type: 'geojson', data: this._geojson });
    }

    if (!map.getLayer(LAYER_ID)) {
      map.addLayer({
        id: LAYER_ID,
        type: 'fill-extrusion',
        source: SOURCE_ID,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['get', 'risk_score'],
            0,   '#440154',
            25,  '#31688e',
            50,  '#35b779',
            75,  '#90d743',
            100, '#fde725',
          ],
          'fill-extrusion-height': ['*', ['get', 'risk_score'], 2500],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.92,
        },
      });
    }
  }

  deactivate() {
    const map = this._map;
    if (!map) return;
    if (map.getLayer(LAYER_ID))  map.removeLayer(LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  }

  getStats() {
    if (!this._geojson) return { cards: [] };
    const features = this._geojson.features;
    const highRisk = features.filter(f => (f.properties.risk_score || 0) > 50).length;
    const avgResilience = features.reduce((s, f) => s + (f.properties.resl_score || 0), 0) / features.length;
    const byState = {};
    features.forEach(f => {
      const st = f.properties.state || 'XX';
      byState[st] = (byState[st] || 0) + (f.properties.risk_score || 0);
    });
    const mostVulnerable = Object.entries(byState).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    return {
      cards: [
        { label: 'High-Risk Counties',    value: String(highRisk),         accent: 'danger' },
        { label: 'Avg Resilience Score',  value: avgResilience.toFixed(1), accent: 'cyan'   },
        { label: 'Most Vulnerable State', value: mostVulnerable,           accent: 'amber'  },
      ],
    };
  }

  getChartConfig() {
    if (!this._geojson) return null;
    const data = [0, 1, 2, 3, 4].map(id => ({
      name:  CLUSTER_LABELS[id],
      value: this._geojson.features.filter(f => f.properties.cluster_id === id).length,
      color: toRgb(id),
    }));
    return { type: 'donut', title: 'Cluster Distribution', data };
  }
}
