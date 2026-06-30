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

const SRC_ID   = 'ff-nodes-src';
const HALO_ID  = 'ff-halo';
const RING_ID  = 'ff-ring';
const CORE_ID  = 'ff-core';

export default class FinancialFlowsModule {
  constructor() {
    this._arcs = null;
    this._map  = null;
    this.viewState = null;
  }

  bindMap(map) { this._map = map; }

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

  activate() {
    const map = this._map;
    if (!map || !this._arcs) return;

    const nodes = this._metroNodes();
    const maxFlow = Math.max(...nodes.map(n => n.flow), 1);

    const geojson = {
      type: 'FeatureCollection',
      features: nodes.map(n => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: n.coordinates },
        properties: {
          name:        n.name,
          flowNorm:    n.flow / maxFlow,
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
          'circle-radius':       ['interpolate', ['linear'], ['get', 'flowNorm'], 0, 18, 1, 52],
          'circle-color':        'rgba(0,0,0,0)',
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(212,98,42,0.35)',
          'circle-blur':         0.5,
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
          'circle-radius':       ['interpolate', ['linear'], ['get', 'flowNorm'], 0, 10, 1, 28],
          'circle-color':        'rgba(0,0,0,0)',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(212,98,42,0.7)',
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
          'circle-radius':       ['interpolate', ['linear'], ['get', 'flowNorm'], 0, 4, 1, 11],
          'circle-color':        'rgba(212,98,42,0.95)',
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.6)',
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

  getLayers() {
    if (!this._arcs) return [];
    return [
      new ArcLayer({
        id: 'ff-arcs',
        data: this._arcs,
        getSourcePosition: d => d.from.coordinates,
        getTargetPosition: d => d.to.coordinates,
        getSourceColor: d => d.direction === 'in' ? [212, 98, 42, 255] : [245, 158, 11, 255],
        getTargetColor: d => d.direction === 'in' ? [212, 98, 42,  50] : [245, 158, 11,  50],
        getWidth:       d => Math.max(4, Math.sqrt(d.volume / 3e8)),
        widthMinPixels: 4,
        greatCircle: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 120],
      }),
    ];
  }

  getStats() {
    if (!this._arcs) return { cards: [] };
    const total    = this._arcs.reduce((s, a) => s + a.volume, 0);
    const inflows  = [...this._arcs].filter(a => a.direction === 'in').sort((a, b) => b.volume - a.volume);
    const outflows = [...this._arcs].filter(a => a.direction === 'out').sort((a, b) => b.volume - a.volume);
    return {
      cards: [
        { label: 'Total Flow Volume', value: `$${(total / 1e12).toFixed(2)}T`, accent: 'cyan'  },
        { label: 'Top Inflow Metro',  value: inflows[0]?.to.name   || '-',     accent: 'cyan'  },
        { label: 'Top Outflow Metro', value: outflows[0]?.from.name || '-',     accent: 'amber' },
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
