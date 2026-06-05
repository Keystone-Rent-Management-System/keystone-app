import {normalizeDashboard} from '../src/utils/dashboardShape';

// The dashboard must render the same against two upstream shapes:
//  - the live B79 GET /dashboard/daily-collection (flat fields)
//  - the mock fixture (nested {today, month})
// This is the exact contract that was silently breaking against the
// real endpoint, so it's the highest-value thing to lock down.

describe('normalizeDashboard', () => {
  it('maps the flat live B79 shape', () => {
    const flat = {
      collectedThisMonth: 187400,
      expectedRent: 200000,
      collectionRatePct: 94,
      collectedToday: 4200,
      outstanding: 12600,
      invoicesOutstanding: 6,
    };
    const n = normalizeDashboard(flat);
    expect(n.monthReceived).toBe(187400);
    expect(n.monthExpected).toBe(200000);
    expect(n.monthPercent).toBe(94);
    expect(n.collectedToday).toBe(4200);
    expect(n.outstandingAmt).toBe(12600);
    expect(n.outstandingUnits).toBe(6);
  });

  it('maps the nested mock fixture shape', () => {
    const nested = {
      today: {collected: 4200, expected: 16800, outstandingUnits: 6},
      month: {collected: 187400, expected: 200000, percentCollected: 94, pending: 8000},
    };
    const n = normalizeDashboard(nested);
    expect(n.monthReceived).toBe(187400);
    expect(n.monthExpected).toBe(200000);
    expect(n.monthPercent).toBe(94);
    expect(n.monthPending).toBe(8000);
    expect(n.collectedToday).toBe(4200);
    expect(n.outstandingAmt).toBe(16800 - 4200);
    expect(n.outstandingUnits).toBe(6);
  });

  it('derives percent from amounts when neither shape provides it', () => {
    const n = normalizeDashboard({collectedThisMonth: 90, expectedRent: 100});
    expect(n.monthPercent).toBe(90);
  });

  it('is safe against null / empty input', () => {
    for (const input of [null, undefined, {}]) {
      const n = normalizeDashboard(input);
      expect(n.monthReceived).toBe(0);
      expect(n.monthExpected).toBe(0);
      expect(n.monthPercent).toBe(0);
      expect(n.collectedToday).toBe(0);
      expect(n.outstandingUnits).toBeNull();
    }
  });
});
