import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeCounties, appreciationColor, getElevationScale } from '../real-estate.js';

const RAW = [
  { fips: '48453', name: 'Travis County', state: 'TX', lat: 30.27, lon: -97.74,
    yoy_change: 8.5, price_history: [{ date: '2023-01-31', value: 400000 }, { date: '2024-01-31', value: 434000 }] },
  { fips: '06037', name: 'Los Angeles County', state: 'CA', lat: 34.05, lon: -118.24,
    yoy_change: -2.1, price_history: [{ date: '2023-01-31', value: 800000 }, { date: '2024-01-31', value: 783000 }] },
];

describe('normalizeCounties', () => {
  it('converts position to [lon, lat]', () => {
    const result = normalizeCounties(RAW);
    expect(result[0].position).toEqual([-97.74, 30.27]);
  });

  it('converts date strings to Date objects in priceHistory', () => {
    const result = normalizeCounties(RAW);
    expect(result[0].priceHistory[0].date).toBeInstanceOf(Date);
  });

  it('preserves yoyChange', () => {
    const result = normalizeCounties(RAW);
    expect(result[0].yoyChange).toBe(8.5);
    expect(result[1].yoyChange).toBe(-2.1);
  });
});

describe('appreciationColor', () => {
  it('returns blue-ish for steep decline', () => {
    const [r, g, b] = appreciationColor(-10);
    expect(b).toBeGreaterThan(r);
  });

  it('returns red-ish for strong appreciation', () => {
    const [r, , b] = appreciationColor(25);
    expect(r).toBeGreaterThan(b);
  });

  it('returns 4-element array (RGBA)', () => {
    expect(appreciationColor(5)).toHaveLength(4);
  });
});

describe('getElevationScale', () => {
  it('returns a positive number', () => {
    const counties = normalizeCounties(RAW);
    expect(getElevationScale(counties)).toBeGreaterThan(0);
  });
});

describe('RealEstateModule', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ counties: RAW })
    });
  });

  it('getLayers empty before load', async () => {
    const { default: RealEstateModule } = await import('../real-estate.js');
    expect(new RealEstateModule().getLayers()).toEqual([]);
  });

  it('getChartConfig type is line after load', async () => {
    const { default: RealEstateModule } = await import('../real-estate.js');
    const mod = new RealEstateModule();
    await mod.load();
    expect(mod.getChartConfig().type).toBe('line');
  });

  it('getStats has 3 cards after load', async () => {
    const { default: RealEstateModule } = await import('../real-estate.js');
    const mod = new RealEstateModule();
    await mod.load();
    expect(mod.getStats().cards).toHaveLength(3);
  });
});
