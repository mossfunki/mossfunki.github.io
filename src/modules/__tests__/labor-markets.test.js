import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizePoints } from '../labor-markets.js';

const RAW_POINTS = [
  { lat: 30.27, lon: -97.74, employment: 500000, median_wage: 68000, gig_share: 0.18 },
  { lat: 34.05, lon: -118.24, employment: 2000000, median_wage: 72000, gig_share: 0.19 },
];

describe('normalizePoints', () => {
  it('converts lat/lon to [lon, lat] position', () => {
    const result = normalizePoints(RAW_POINTS);
    expect(result[0].position).toEqual([-97.74, 30.27]);
  });

  it('preserves employment, medianWage, gigShare', () => {
    const result = normalizePoints(RAW_POINTS);
    expect(result[0].employment).toBe(500000);
    expect(result[0].medianWage).toBe(68000);
    expect(result[0].gigShare).toBe(0.18);
  });

  it('filters out points without lat/lon', () => {
    const withNull = [...RAW_POINTS, { lat: null, lon: null, employment: 0, median_wage: 0, gig_share: 0 }];
    expect(normalizePoints(withNull)).toHaveLength(2);
  });
});

describe('LaborMarketsModule', () => {
  const MOCK_DATA = {
    points: RAW_POINTS,
    metros: [{ name: 'Austin', lat: 30.27, lon: -97.74, median_wage: 68000, cost_of_living: 118, gig_share: 0.22 }]
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_DATA
    });
  });

  it('getLayers returns empty before load', async () => {
    const { default: LaborMarketsModule } = await import('../labor-markets.js');
    expect(new LaborMarketsModule().getLayers()).toEqual([]);
  });

  it('getStats returns 3 cards after load', async () => {
    const { default: LaborMarketsModule } = await import('../labor-markets.js');
    const mod = new LaborMarketsModule();
    await mod.load();
    expect(mod.getStats().cards).toHaveLength(3);
  });

  it('getChartConfig returns scatter type after load', async () => {
    const { default: LaborMarketsModule } = await import('../labor-markets.js');
    const mod = new LaborMarketsModule();
    await mod.load();
    expect(mod.getChartConfig().type).toBe('scatter');
  });
});
