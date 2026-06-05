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

// Dev-only role override for the tenant experience — same idea as
// DEV_FORCE_LANDLORD, for touring the tenant rent command center on a
// debug build without a real tenant token. Gated by __DEV__ at the
// consumer. Must be false in any committed/release build.
export const DEV_FORCE_TENANT = false;

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysFromNow = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const monthYearLabel = n => {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
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
// ── Tenant home — the rent command center ──────────────────────────
// Keystone tenants are provisioned by their landlord; their #1 job is
// paying rent, which lands instantly + directly in the landlord's bank
// (no escrow, no Mpesa paybill). BE rollup not yet built:
// GET /tenants/rent-summary (see BE_ASKS_MOBILE).
export const mockTenantHome = {
  tenant: {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    phone: '+1 (512) 555-0148',
  },
  rent: {
    amount: 1800,
    periodLabel: monthYearLabel(0),
    dueDate: daysFromNow(5),
    daysUntilDue: 5,
    status: 'DUE', // 'DUE' | 'PAID' | 'OVERDUE'
    paidThisPeriod: 0,
  },
  lease: {
    unit: '4B',
    property: 'Magnolia Court',
    address: '128 Magnolia Ave, Austin, TX',
    monthlyRent: 1800,
    deposit: 1800,
    startDate: '2025-08-01',
    endDate: daysFromNow(56),
    daysToEnd: 56,
    landlord: 'Keystone Property Group',
    renewalStatus: 'NONE', // 'NONE' | 'OFFERED' | 'RENEWED'
    // 'ACCEPTED' = signed & active. 'PENDING' = tenant must review +
    // accept before the tenancy is active (drives the Home accept card).
    agreementStatus: 'ACCEPTED',
    term: '12 months',
    documents: [
      {id: 'd1', name: 'Lease agreement.pdf', kind: 'Signed', date: '2025-07-28'},
      {id: 'd2', name: 'Move-in inspection.pdf', kind: 'Report', date: '2025-08-01'},
    ],
  },
  paymentMethod: {type: 'bank', name: 'Chase', last4: '8821'},
  autopay: {enabled: false},
  recentPayments: [
    {id: 'r1', amount: 1800, date: daysFromNow(-4), method: 'Bank · Chase ••8821', code: 'KS-9F2A', status: 'PAID', period: monthYearLabel(-1)},
    {id: 'r2', amount: 1800, date: daysFromNow(-34), method: 'Bank · Chase ••8821', code: 'KS-7C1B', status: 'PAID', period: monthYearLabel(-2)},
    {id: 'r3', amount: 1800, date: daysFromNow(-64), method: 'Bank · Chase ••8821', code: 'KS-4D8E', status: 'PAID', period: monthYearLabel(-3)},
  ],
};

// Tenant payment history (receipts). Newest first. GET /tenants/payments
export const mockTenantPayments = [
  {id: 'r1', amount: 1800, date: daysFromNow(-4), method: 'Bank · Chase ••8821', code: 'KS-9F2A', status: 'PAID', period: monthYearLabel(-1)},
  {id: 'r2', amount: 1800, date: daysFromNow(-34), method: 'Bank · Chase ••8821', code: 'KS-7C1B', status: 'PAID', period: monthYearLabel(-2)},
  {id: 'r3', amount: 1800, date: daysFromNow(-64), method: 'Bank · Chase ••8821', code: 'KS-4D8E', status: 'PAID', period: monthYearLabel(-3)},
  {id: 'r4', amount: 1800, date: daysFromNow(-95), method: 'Bank · Chase ••8821', code: 'KS-2A7F', status: 'PAID', period: monthYearLabel(-4)},
  {id: 'r5', amount: 1800, date: daysFromNow(-125), method: 'Bank · Chase ••8821', code: 'KS-8B3C', status: 'PAID', period: monthYearLabel(-5)},
  {id: 'r6', amount: 1800, date: daysFromNow(-156), method: 'Bank · Chase ••8821', code: 'KS-1E9D', status: 'PAID', period: monthYearLabel(-6)},
];

// Tenant notifications — rent-centric. GET /notifications
export const mockTenantNotifications = {
  content: [
    {id: 'n1', type: 'REMINDER', title: 'Rent due in 5 days', body: `Your ${monthYearLabel(0)} rent of $1,800 is due soon. Pay anytime in two taps.`, createdAt: daysFromNow(0), read: false},
    {id: 'n2', type: 'RECEIPT', title: 'Payment confirmed', body: `We sent $1,800 to your landlord for ${monthYearLabel(-1)}. Receipt KS-9F2A.`, createdAt: daysFromNow(-4), read: false},
    {id: 'n3', type: 'LEASE', title: 'Lease renewal window opens soon', body: 'Your lease ends in under 2 months. Your landlord may offer a renewal.', createdAt: daysFromNow(-10), read: true},
    {id: 'n4', type: 'RECEIPT', title: 'Payment confirmed', body: `We sent $1,800 to your landlord for ${monthYearLabel(-2)}. Receipt KS-7C1B.`, createdAt: daysFromNow(-34), read: true},
  ],
};

// Tenant statement — a simple rent ledger (charges = rent, credits =
// payments). GET /tenants/statement
export const mockTenantStatement = {
  openingBalance: 0,
  closingBalance: 1800,
  totalCharges: 5400,
  totalCredits: 3600,
  entries: [
    {id: 'e1', entryDate: daysFromNow(0), description: `Rent · ${monthYearLabel(0)}`, charge: 1800, credit: 0, runningBalance: 1800},
    {id: 'e2', entryDate: daysFromNow(-4), description: `Payment · KS-9F2A`, charge: 0, credit: 1800, runningBalance: 0},
    {id: 'e3', entryDate: daysFromNow(-30), description: `Rent · ${monthYearLabel(-1)}`, charge: 1800, credit: 0, runningBalance: 1800},
    {id: 'e4', entryDate: daysFromNow(-34), description: `Payment · KS-7C1B`, charge: 0, credit: 1800, runningBalance: 0},
    {id: 'e5', entryDate: daysFromNow(-60), description: `Rent · ${monthYearLabel(-2)}`, charge: 1800, credit: 0, runningBalance: 1800},
    {id: 'e6', entryDate: daysFromNow(-64), description: `Payment · KS-4D8E`, charge: 0, credit: 1800, runningBalance: 0},
  ],
};

export const mockFallback = (key, value) => {
  if (!logged.has(key)) {
    // eslint-disable-next-line no-console
    console.warn(`[mock] serving fixture for "${key}" — BE endpoint not yet implemented`);
    logged.add(key);
  }
  return Promise.resolve(value);
};
