import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeArcs, computeNetFlows } from '../financial-flows.js';

const RAW_ARCS = [
  { from: { name: 'NYC', lat: 40.71, lon: -74.01 }, to: { name: 'LA', lat: 34.05, lon: -118.24 }, volume: 95e9, direction: 'in' },
  { from: { name: 'Boston', lat: 42.36, lon: -71.06 }, to: { name: 'NYC', lat: 40.71, lon: -74.01 }, volume: 62e9, direction: 'out' },
];

describe('normalizeArcs', () => {
  it('converts lat/lon to [lon, lat] coordinates', () => {
    const result = normalizeArcs(RAW_ARCS);
    expect(result[0].from.coordinates).toEqual([-74.01, 40.71]);
    expect(result[0].to.coordinates).toEqual([-118.24, 34.05]);
  });

  it('preserves volume and direction', () => {
    const result = normalizeArcs(RAW_ARCS);
    expect(result[0].volume).toBe(95e9);
    expect(result[0].direction).toBe('in');
  });

  it('preserves metro names', () => {
    const result = normalizeArcs(RAW_ARCS);
    expect(result[0].from.name).toBe('NYC');
    expect(result[0].to.name).toBe('LA');
  });
});

describe('computeNetFlows', () => {
  it('produces net flow per metro sorted descending', () => {
    const arcs = normalizeArcs(RAW_ARCS);
    const result = computeNetFlows(arcs);
    expect(result.length).toBeGreaterThan(0);
    if (result.length > 1) {
      expect(result[0].value).toBeGreaterThanOrEqual(result[1].value);
    }
  });

  it('sums inflows as positive, outflows as negative', () => {
    const arcs = normalizeArcs([
      { from: { name: 'A', lat: 0, lon: 0 }, to: { name: 'B', lat: 1, lon: 1 }, volume: 10e9, direction: 'in' },
      { from: { name: 'B', lat: 1, lon: 1 }, to: { name: 'C', lat: 2, lon: 2 }, volume: 5e9,  direction: 'out' },
    ]);
    const net = computeNetFlows(arcs);
    const b = net.find(d => d.name === 'B');
    expect(b?.value).toBe(-5e9);
  });
});

describe('FinancialFlowsModule', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ arcs: RAW_ARCS })
    });
  });

  it('getLayers returns empty before load()', async () => {
    const { default: FinancialFlowsModule } = await import('../financial-flows.js');
    const mod = new FinancialFlowsModule();
    expect(mod.getLayers()).toEqual([]);
  });

  it('getStats returns 3 cards after load()', async () => {
    const { default: FinancialFlowsModule } = await import('../financial-flows.js');
    const mod = new FinancialFlowsModule();
    await mod.load();
    expect(mod.getStats().cards).toHaveLength(3);
  });

  it('getChartConfig returns bar type after load()', async () => {
    const { default: FinancialFlowsModule } = await import('../financial-flows.js');
    const mod = new FinancialFlowsModule();
    await mod.load();
    expect(mod.getChartConfig().type).toBe('bar');
  });
});
