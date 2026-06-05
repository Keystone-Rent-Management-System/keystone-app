// The mobile dashboard was built against the mock fixture's nested
// shape ({today, month, portfolio, ...}), but the live B79 endpoint
// GET /dashboard/daily-collection returns a flat shape
// ({collectedThisMonth, expectedRent, collectionRatePct, collectedToday,
// outstanding, invoicesOutstanding}). This normalizer maps both into a
// single set of fields the cards read, so the dashboard renders against
// the real endpoint, not only the mock.
//
// Aggregates the flat endpoint does NOT provide (portfolio rollup,
// 6-month trend, recentActivity feed) are intentionally left to the
// component's optional-render guards; those still require BE to add
// them (tracked in BE_ASKS_MOBILE).
export const normalizeDashboard = d => {
  const monthReceived = d?.month?.collected ?? d?.collectedThisMonth ?? 0;
  const monthExpected = d?.month?.expected ?? d?.expectedRent ?? 0;
  const monthPercent =
    d?.month?.percentCollected ??
    d?.collectionRatePct ??
    (monthExpected > 0 ? Math.round((monthReceived / monthExpected) * 100) : 0);
  const monthPending = d?.month?.pending ?? 0;
  const collectedToday = d?.today?.collected ?? d?.collectedToday ?? 0;
  const expectedToday = d?.today?.expected ?? 0;
  const outstandingAmt =
    d?.outstanding ??
    (expectedToday > 0
      ? expectedToday - collectedToday
      : monthExpected - monthReceived);
  const outstandingUnits =
    d?.today?.outstandingUnits ?? d?.invoicesOutstanding ?? null;

  return {
    monthReceived,
    monthExpected,
    monthPercent,
    monthPending,
    collectedToday,
    expectedToday,
    outstandingAmt,
    outstandingUnits,
  };
};
