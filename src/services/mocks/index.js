// Mobile-side mock adapter. Mirrors the landlord SPA's mock pattern:
// when BE has not shipped a particular endpoint yet, FE serves a
// realistic fixture so the UI can render and be visually validated.
//
// Toggling:
//   - Per-call: a service catches a 404/501 from the gateway and falls
//     back to the fixture in this file.
//   - Global: set USE_MOBILE_MOCKS = true below to force every wired
//     service onto mock data, regardless of BE health. Useful for
//     demoing on a flight / off-network.
//
// All fixture amounts are USD. Dates relative to "today" so a stale
// fixture never shows a date in the past.

export const USE_MOBILE_MOCKS = false;

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysFromNow = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// ── #1 Dashboard morning number ────────────────────────────────────
// Shape mirrors the BE contract requested in BE_ASKS_MOBILE.md.
// GET /dashboard/daily-collection
export const mockDailyCollection = {
  date: todayISO(),
  today: {
    collected: 48200,
    expected: 52000,
    outstandingUnits: 3,
  },
  month: {
    collected: 187400,
    expected: 198600,
    pending: 11200,
    percentCollected: 94,
    percentPending: 6,
  },
  cashAccount: {
    bankName: 'Chase Business',
    accountLast4: '4821',
    balance: 234600.0,
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
};

// ── #3 PaymentZone ─────────────────────────────────────────────────
// Already wired BE-side (/payment-zones). Mock kept for offline demo
// and to anchor the bucket shape the mobile UI consumes.
const fixtureTenant = (id, name, unit, days, action) => ({
  id,
  name,
  unitName: unit,
  daysOverdue: days,
  lastAction: action,
});
export const mockPaymentZones = {
  early: {
    count: 142,
    tenants: [
      fixtureTenant('e1', 'Sarah Chen', 'Magnolia A', -8, 'Paid 8 days early'),
      fixtureTenant('e2', 'David Kim', 'Magnolia B', -5, 'Paid 5 days early'),
    ],
  },
  onTime: {
    count: 38,
    tenants: [
      fixtureTenant('o1', 'James Otieno', 'Riverside E', 0, 'Paid on due date'),
      fixtureTenant('o2', 'Marcus Webb', 'Oak G', 0, 'Paid on due date'),
    ],
  },
  late: {
    count: 14,
    tenants: [
      fixtureTenant('l1', 'Priya Patel', 'Magnolia C', 4, 'Reminder sent'),
      fixtureTenant('l2', 'Carlos Rivera', 'Oak H', 6, 'Late fee applied'),
    ],
  },
  notPaid: {
    count: 6,
    tenants: [
      fixtureTenant('n1', 'Liam Brown', 'Riverside F', 12, 'Insurance claim initiated'),
      fixtureTenant('n2', 'Aisha Khan', 'Magnolia D', 14, 'Eviction notice draft prepared'),
    ],
  },
};

// ── #7 Lease Expiry Timeline ───────────────────────────────────────
// Will eventually be a BE rollup endpoint; for now derive client-side
// from agreements, but expose a mock for offline demo too.
export const mockLeaseExpiries = {
  buckets: {
    thisMonth: 2,
    nextMonth: 7,
    inSixtyDays: 11,
  },
  expiring: [
    {
      unitId: 'u-12a',
      unitName: 'Unit 12A',
      tenantName: 'Sarah Chen',
      expiresOn: daysFromNow(22),
      daysToExpiry: 22,
      renewalStatus: 'SENT_NOT_SIGNED',
    },
    {
      unitId: 'u-7c',
      unitName: 'Unit 7C',
      tenantName: 'Marcus Webb',
      expiresOn: daysFromNow(22),
      daysToExpiry: 22,
      renewalStatus: 'NOT_SENT',
    },
    {
      unitId: 'u-3b',
      unitName: 'Unit 3B',
      tenantName: 'Priya Patel',
      expiresOn: daysFromNow(45),
      daysToExpiry: 45,
      renewalStatus: 'SENT_NOT_SIGNED',
    },
  ],
};

// ── #4 Instant Payout (Phase 2) ────────────────────────────────────
export const mockPayoutBalance = {
  available: 23400.0,
  currency: 'USD',
  bank: {
    name: 'Chase Business',
    accountLast4: '4821',
  },
  autoPayout: {
    enabled: false,
    cadence: null,
  },
};

// ── #5 Portfolio Performance (Phase 3) ─────────────────────────────
export const mockPortfolioPerformance = {
  period: 'October 2025',
  grossRentIncome: 198600,
  vacancyLoss: 4200,
  lateFees: 840,
  insuranceClaims: 0,
  netCollected: 195240,
  occupancyRate: 97.8,
  averageDaysToPay: 2.3,
  onTimeRate: 91.4,
  vsLastMonth: 2.1,
  vsLastYear: 8.4,
};

// ── #6 Maintenance visibility (Phase 3) ────────────────────────────
export const mockMaintenanceSummary = {
  openRequests: 7,
  inProgress: 3,
  awaitingParts: 2,
  overdue: 1,
  overdueDetails: [
    {
      id: 'mr-001',
      unitName: 'Magnolia C',
      issue: 'Leaking kitchen faucet',
      ageDays: 9,
      assignedTo: 'Acme Plumbing',
    },
  ],
};

// ── #8 Rent Insurance (Phase 4) ────────────────────────────────────
export const mockRentInsurance = {
  insuredUnits: 186,
  totalUnits: 200,
  coveragePercent: 93,
  monthlyPremium: 2790,
  activeClaims: 0,
  claimsYTD: 2,
  paidOutYTD: 3600,
  recoveredYTD: 2400,
  netCoveredRent: 196000,
  outOfPocket: 0,
};

// ── #9 Owner Reports (Phase 4) ─────────────────────────────────────
export const mockOwners = [
  {id: 'o1', name: 'Margaret Chen', propertyCount: 3},
  {id: 'o2', name: 'The Kowalski Trust', propertyCount: 8},
  {id: 'o3', name: 'Pacific NW Holdings', propertyCount: 5},
];

// ── #10 Compliance Alerts (Phase 4) ────────────────────────────────
export const mockComplianceAlerts = [
  {
    id: 'wa-hb1217-1',
    jurisdiction: 'WA',
    regulation: 'HB 1217',
    title: 'Rent increase requires 90-day notice',
    unitName: 'Unit 3B',
    deadline: daysFromNow(12),
    actionLabel: 'Send 90-day notice',
    status: 'NOT_SENT',
  },
  {
    id: 'wa-hb1217-2',
    jurisdiction: 'WA',
    regulation: 'HB 1217',
    title: 'Rent increase requires 90-day notice',
    unitName: 'Unit 11A',
    deadline: daysFromNow(12),
    actionLabel: 'Send 90-day notice',
    status: 'NOT_SENT',
  },
];

// Helper a service can call after catching a 404/501 from the BE.
// Returns the fixture and logs once so we know what's mocked at
// runtime.
const logged = new Set();
export const mockFallback = (key, value) => {
  if (!logged.has(key)) {
    // eslint-disable-next-line no-console
    console.warn(`[mock] serving fixture for "${key}" — BE endpoint not yet implemented`);
    logged.add(key);
  }
  return Promise.resolve(value);
};
