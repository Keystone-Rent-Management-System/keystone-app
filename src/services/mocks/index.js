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

// Global mock override. Flip to true to force every wired service
// onto mock data regardless of BE health — useful for an offline
// demo or rapid screen iteration. Default false so production users
// always hit the real BE; per-service fallbacks still kick in when
// individual endpoints 404/501.
export const USE_MOBILE_MOCKS = false;

// Dev-only role override so the landlord command center is reachable
// before BE auth is wired against a real landlord test account.
// Gated by __DEV__ at the consumer (BottomNav.jsx) so release builds
// are unaffected. Flip to true alongside USE_MOBILE_MOCKS=true for
// an offline tour of every new screen on a debug build.
export const DEV_FORCE_LANDLORD = false;

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
  // No cashAccount/held balance: Keystone pays rent instantly +
  // directly into the landlord's own bank, so there is no platform-held
  // balance to display or pay out. The dashboard shows rent *received*
  // (month + today), not a balance to move.
  // Trailing 6-month collected totals (oldest → newest) for the
  // dashboard trend sparkline. Newest = this month's running total.
  trend: [
    {label: 'Jan', collected: 171200},
    {label: 'Feb', collected: 176900},
    {label: 'Mar', collected: 169800},
    {label: 'Apr', collected: 182400},
    {label: 'May', collected: 190100},
    {label: 'Jun', collected: 187400},
  ],
  // Latest money movements for the dashboard activity feed.
  recentActivity: [
    {id: 'a1', type: 'PAYMENT', tenant: 'James Otieno', unit: 'Riverside E', amount: 2400, minutesAgo: 12},
    {id: 'a2', type: 'PAYMENT', tenant: 'Sarah Chen', unit: 'Magnolia A', amount: 1800, minutesAgo: 95},
    {id: 'a3', type: 'LATE_FEE', tenant: 'Carlos Rivera', unit: 'Oak H', amount: 75, minutesAgo: 184},
    {id: 'a4', type: 'PAYMENT', tenant: 'Aisha Bello', unit: 'Oak C', amount: 2100, minutesAgo: 1490},
  ],
  // Portfolio snapshot for the dashboard occupancy ring.
  portfolio: {
    properties: 4,
    units: 200,
    occupied: 186,
    vacant: 14,
    occupancyRate: 93,
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

// #4 Instant Payout removed — Keystone pays rent instantly + directly
// into the landlord's own bank. There is no platform-held balance to
// sweep, so there is no payout balance fixture.

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
  // Supervision stats — how the system is performing, so the landlord
  // can trust it's working without doing the work.
  resolvedThisMonth: 18,
  avgResolutionDays: 2.4,
  slaComplianceRate: 94,
  // Active request board. status: OPEN | IN_PROGRESS | AWAITING_PARTS.
  // slaDays = the resolution target; ageDays past it = overdue.
  requests: [
    {
      id: 'mr-001',
      unitName: 'Magnolia C',
      issue: 'Leaking kitchen faucet',
      category: 'Plumbing',
      status: 'AWAITING_PARTS',
      ageDays: 9,
      slaDays: 7,
      assignedTo: 'Acme Plumbing',
      priority: 'HIGH',
    },
    {
      id: 'mr-002',
      unitName: 'Riverside E',
      issue: 'HVAC not cooling',
      category: 'HVAC',
      status: 'IN_PROGRESS',
      ageDays: 2,
      slaDays: 5,
      assignedTo: 'CoolAir Co.',
      priority: 'MEDIUM',
    },
    {
      id: 'mr-003',
      unitName: 'Oak G',
      issue: 'Garbage disposal jammed',
      category: 'Appliance',
      status: 'OPEN',
      ageDays: 1,
      slaDays: 4,
      assignedTo: null,
      priority: 'LOW',
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

// Compliance audit trail — every dispatched notice, timestamped and
// logged. This is the "proof it happened" record the landlord can
// stand behind. Newest first.
export const mockComplianceAudit = [
  {id: 'au1', action: 'Security deposit return statement', unitName: 'Magnolia A', regulation: 'RCW 59.18.280', jurisdiction: 'WA', daysAgo: 6},
  {id: 'au2', action: '90-day rent increase notice', unitName: 'Riverside E', regulation: 'HB 1217', jurisdiction: 'WA', daysAgo: 21},
  {id: 'au3', action: 'Notice to enter (repairs)', unitName: 'Oak G', regulation: 'RCW 59.18.150', jurisdiction: 'WA', daysAgo: 33},
  {id: 'au4', action: '14-day pay-or-vacate notice', unitName: 'Magnolia D', regulation: 'RCW 59.12.030', jurisdiction: 'WA', daysAgo: 47},
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
