import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toRgb } from '../risk-index.js';

describe('toRgb', () => {
  it('returns a 3-element array for valid cluster ids', () => {
    for (let i = 0; i <= 4; i++) {
      const rgb = toRgb(i);
      expect(rgb).toHaveLength(3);
      rgb.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
    }
  });

  it('returns a fallback for unknown cluster id', () => {
    const rgb = toRgb(99);
    expect(rgb).toHaveLength(3);
  });
});

describe('RiskIndexModule', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: { name: 'Travis', state: 'TX', risk_score: 45, resl_score: 60, cluster_id: 2 } },
          { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: { name: 'King', state: 'WA', risk_score: 20, resl_score: 80, cluster_id: 0 } },
        ]
      })
    });
  });

  it('getLayers returns an empty array before load()', async () => {
    const { default: RiskIndexModule } = await import('../risk-index.js');
    const mod = new RiskIndexModule();
    expect(mod.getLayers()).toEqual([]);
  });

  it('getStats returns correct card count after load()', async () => {
    const { default: RiskIndexModule } = await import('../risk-index.js');
    const mod = new RiskIndexModule();
    await mod.load();
    const stats = mod.getStats();
    expect(stats.cards).toHaveLength(3);
    expect(stats.cards[0].label).toBe('High-Risk Counties');
  });

  it('getChartConfig returns donut type after load()', async () => {
    const { default: RiskIndexModule } = await import('../risk-index.js');
    const mod = new RiskIndexModule();
    await mod.load();
    const config = mod.getChartConfig();
    expect(config.type).toBe('donut');
    expect(config.data).toHaveLength(5);
  });
});
