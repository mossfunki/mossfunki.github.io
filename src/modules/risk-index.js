import { GeoJsonLayer } from '@deck.gl/layers';

const CLUSTER_COLORS = {
  0: [34,  197,  94],   // green  — low risk / high resilience
  1: [134, 239, 172],   // mint   — low-moderate
  2: [245, 158,  11],   // amber  — moderate / mixed
  3: [239,  68,  68],   // red    — high risk / low resilience
  4: [ 59, 130, 246],   // blue   — coastal / weather-exposed
};

const CLUSTER_LABELS = {
  0: 'Low Risk',
  1: 'Low-Mod',
  2: 'Moderate',
  3: 'High Risk',
  4: 'Coastal',
};

export function toRgb(clusterId) {
  return CLUSTER_COLORS[clusterId] || [100, 100, 100];
}

export default class RiskIndexModule {
  constructor() {
    this._geojson = null;
    this.viewState = null;
  }

  async load() {
    if (this._geojson) return;
    const r = await fetch('./data/counties.geojson');
    if (!r.ok) throw new Error(`counties.geojson fetch failed: ${r.status}`);
    this._geojson = await r.json();
  }

  getLayers() {
    if (!this._geojson) return [];
    return [
      new GeoJsonLayer({
        id: 'risk-index-geojson',
        data: this._geojson,
        filled: true,
        stroked: true,
        getFillColor: f => [...toRgb(f.properties.cluster_id), 180],
        getLineColor: [255, 255, 255, 20],
        getLineWidth: 500,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 50],
      }),
    ];
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
    const mostVulnerable = Object.entries(byState).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return {
      cards: [
        { label: 'High-Risk Counties',    value: String(highRisk),        accent: 'danger' },
        { label: 'Avg Resilience Score',  value: avgResilience.toFixed(1), accent: 'cyan'   },
        { label: 'Most Vulnerable State', value: mostVulnerable,           accent: 'amber'  },
      ],
    };
  }

  getChartConfig() {
    if (!this._geojson) return null;
    const data = [0, 1, 2, 3, 4].map(id => ({
      label: CLUSTER_LABELS[id],
      count: this._geojson.features.filter(f => f.properties.cluster_id === id).length,
      color: `rgb(${CLUSTER_COLORS[id].join(',')})`,
    }));
    return { type: 'donut', title: 'Cluster Distribution', data };
  }
}
