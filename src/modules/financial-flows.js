import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';

export function normalizeArcs(rawArcs) {
  return rawArcs.map(a => ({
    from:      { name: a.from.name, coordinates: [a.from.lon, a.from.lat] },
    to:        { name: a.to.name,   coordinates: [a.to.lon,   a.to.lat]   },
    volume:    a.volume,
    direction: a.direction,
  }));
}

export function computeNetFlows(arcs) {
  const net = {};
  arcs.forEach(a => {
    const key = a.from.name;
    net[key] = (net[key] || 0) + (a.direction === 'in' ? a.volume : -a.volume);
  });
  return Object.entries(net)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export default class FinancialFlowsModule {
  constructor() {
    this._arcs = null;
    this.viewState = null;
  }

  async load() {
    if (this._arcs) return;
    const r = await fetch('./data/financial-flows.json');
    if (!r.ok) throw new Error(`financial-flows.json fetch failed: ${r.status}`);
    const data = await r.json();
    this._arcs = normalizeArcs(data.arcs);
  }

  _metroNodes() {
    const map = {};
    this._arcs.forEach(a => {
      ['from', 'to'].forEach(end => {
        const m = a[end];
        if (!map[m.name]) map[m.name] = { name: m.name, coordinates: m.coordinates, flow: 0 };
        map[m.name].flow += a.volume;
      });
    });
    return Object.values(map);
  }

  getLayers() {
    if (!this._arcs) return [];
    const nodes = this._metroNodes();
    return [
      new ScatterplotLayer({
        id: 'ff-nodes-outer',
        data: nodes,
        getPosition: d => d.coordinates,
        getRadius: d => Math.max(60000, Math.sqrt(d.flow / 5e7) * 12000),
        getFillColor: [0, 212, 255, 18],
        getLineColor: [0, 212, 255, 120],
        lineWidthMinPixels: 1,
        stroked: true,
        pickable: false,
      }),
      new ScatterplotLayer({
        id: 'ff-nodes-inner',
        data: nodes,
        getPosition: d => d.coordinates,
        getRadius: d => Math.max(20000, Math.sqrt(d.flow / 5e7) * 4000),
        getFillColor: [0, 212, 255, 200],
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 80],
      }),
      new ArcLayer({
        id: 'ff-arcs',
        data: this._arcs,
        getSourcePosition: d => d.from.coordinates,
        getTargetPosition: d => d.to.coordinates,
        getSourceColor: d => d.direction === 'in' ? [0, 212, 255, 230] : [245, 158, 11, 230],
        getTargetColor: d => d.direction === 'in' ? [0, 212, 255,  40] : [245, 158, 11,  40],
        getWidth:       d => Math.max(2, Math.sqrt(d.volume / 8e8)),
        widthMinPixels: 2,
        greatCircle: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 100],
      }),
    ];
  }

  getStats() {
    if (!this._arcs) return { cards: [] };
    const total   = this._arcs.reduce((s, a) => s + a.volume, 0);
    const inflows = [...this._arcs].filter(a => a.direction === 'in').sort((a, b) => b.volume - a.volume);
    const outflows= [...this._arcs].filter(a => a.direction === 'out').sort((a, b) => b.volume - a.volume);
    return {
      cards: [
        { label: 'Total Flow Volume', value: `$${(total / 1e12).toFixed(2)}T`, accent: 'cyan'  },
        { label: 'Top Inflow Metro',  value: inflows[0]?.to.name   || '—',     accent: 'cyan'  },
        { label: 'Top Outflow Metro', value: outflows[0]?.from.name || '—',     accent: 'amber' },
      ],
    };
  }

  getChartConfig() {
    if (!this._arcs) return null;
    const net = computeNetFlows(this._arcs).slice(0, 10);
    return {
      type:  'bar',
      title: 'Net Flow by Metro ($B)',
      data:  net.map(d => ({ name: d.name, value: +(d.value / 1e9).toFixed(1) })),
    };
  }
}
