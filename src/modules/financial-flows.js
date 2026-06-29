import { ArcLayer } from '@deck.gl/layers';

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

  getLayers() {
    if (!this._arcs) return [];
    return [
      new ArcLayer({
        id: 'financial-flows-arc',
        data: this._arcs,
        getSourcePosition: d => d.from.coordinates,
        getTargetPosition: d => d.to.coordinates,
        getSourceColor:    d => d.direction === 'in' ? [0, 212, 255, 200] : [245, 158, 11, 200],
        getTargetColor:    d => d.direction === 'in' ? [0, 212, 255,  60] : [245, 158, 11,  60],
        getWidth:          d => Math.max(1, Math.sqrt(d.volume / 4e9)),
        greatCircle: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 80],
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
