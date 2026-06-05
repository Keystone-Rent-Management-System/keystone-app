# BE asks — Keystone Mobile Landlord Command Center

This document lists every endpoint the mobile landlord app calls
that BE has not yet shipped. Each section gives the route, the
request/response shape FE consumes, and the source spec ($ section
of the user's command-center brief).

FE behavior when an endpoint is missing: catch 404/501 → serve a
mock fixture from `src/services/mocks/index.js` and log
`[mock] serving fixture for "<key>"`. This keeps the UI renderable
during the BE buildout. When BE ships an endpoint, FE will pick it
up with no FE code change.

CEO override recorded for WA HB 1217 (§10) — outside the TX/FL/GA
Year-1 footprint in the Strategic Playbook. CEO acknowledged.

> **Model update (2026-06-05): instant + direct payments.** Keystone now
> moves rent *instantly and directly* into the landlord's own bank — there
> is no platform-held/escrow balance. Consequences for this doc:
> §4 (Instant Payout / FedNow sweep) is **WITHDRAWN** (nothing to sweep),
> and §1's `cashAccount` held-balance block is dropped. See the new
> **Part B — Tenant app** section for the payment endpoints this introduces.

---

## §1 — Dashboard daily-collection rollup *(blocks Phase 1)*

**`GET /dashboard/daily-collection`**

Single aggregate so the dashboard opens in one round-trip. Cached
60s server-side is fine.

```json
{
  "date": "2026-06-03",
  "today": {
    "collected": 48200,
    "expected": 52000,
    "outstandingUnits": 3
  },
  "month": {
    "collected": 187400,
    "expected": 198600,
    "pending": 11200,
    "percentCollected": 94,
    "percentPending": 6
  },
  "cashAccount": {
    "bankName": "Chase Business",
    "accountLast4": "4821",
    "balance": 234600.00,
    "updatedAt": "2026-06-03T07:12:00Z"
  }
}
```

> **Status (2026-06-05):** BE shipped a **flat** `GET /dashboard/daily-collection`
> (B79): `{ expectedRent, billedThisMonth, collectedThisMonth, collectedToday,
> outstanding, invoicesPaid, invoicesPartial, invoicesOutstanding,
> collectionRatePct }`. The mobile FE now maps those flat fields
> (`src/utils/dashboardShape.js`) so the collection card renders against the
> live endpoint. **Still needed** from BE (today these stay on mock): the
> `portfolio` rollup (occupancy/units), a 6-month `trend` array, and a
> `recentActivity` feed. Drop the `cashAccount` block (no held balance).

---

## §2 — Push on payment_received *(blocks Phase 2)*

The mobile app already registers an FCM device token via
`POST /notifications/deviceToken?deviceToken=<token>`. BE needs to
push to that token on Dwolla `transfer_completed` webhook.

**Payload contract:**

```json
{
  "to": "<fcm device token>",
  "data": {
    "type": "PAYMENT_RECEIVED",
    "amount": 1800.00,
    "unitName": "Unit 4B",
    "tenantName": "James Otieno",
    "bankName": "Chase Business",
    "bankLast4": "4821"
  },
  "notification": {
    "title": "🏠 Rent Received",
    "body": "Unit 4B — James Otieno\n$1,800.00\nNow in Chase ****4821"
  }
}
```

FE recognizes `data.type === "PAYMENT_RECEIVED"`, renders on the
dedicated `keystone-payment` channel (heads-up bubble), and
invalidates dashboard / payment-zone / payout-balance queries so
they refetch immediately.

---

## §3 — `/payment-zones` *(SHIPPED — confirm wired)*

BE doc §5.12 already documents this. Mobile uses the same response
shape as the SPA: `{early, onTime, late, notPaid}` each with
`{count, tenants: [...]}`. No new work — just confirm the gateway
exposes it under `/api/v1/rms/payment-zones`.

---

## §4 — Instant Payout (FedNow) *(WITHDRAWN — no held balance)*

> **Withdrawn 2026-06-05.** The instant/direct model pays rent straight to
> the landlord's bank, so there is no platform-held balance to sweep. The
> payout screen, hooks, and these endpoints were removed from the app. Kept
> below for history only — **do not build.**

**`GET /payouts/balance`**
```json
{
  "available": 23400.00,
  "currency": "USD",
  "bank": {"name": "Chase Business", "accountLast4": "4821"},
  "autoPayout": {"enabled": false, "cadence": null}
}
```

**`POST /payouts/send`** — trigger FedNow transfer of the full
available balance (or a specified amount).
```jsonc
// Request
{"amount": 23400.00}  // null/omitted = send full available

// Response
{"transferId": "txr_abc123", "status": "PROCESSING", "etaSeconds": 60}
```

**`PATCH /payouts/auto`** — set auto-payout cadence.
```json
{"enabled": true, "cadence": "DAILY_6AM" | "WEEKLY_MON" | "MONTHLY_1ST"}
```

BE-side: this is a Dwolla customer-to-bank transfer with the
`processingType: "rtp"` flag for FedNow rails. Cron job for
auto-payout cadences.

---

## §5 — Portfolio Performance *(blocks Phase 3)*

**`GET /portfolio/performance?period=YYYY-MM`** — defaults to current month.

```json
{
  "period": "October 2025",
  "grossRentIncome": 198600,
  "vacancyLoss": 4200,
  "lateFees": 840,
  "insuranceClaims": 0,
  "netCollected": 195240,
  "occupancyRate": 97.8,
  "averageDaysToPay": 2.3,
  "onTimeRate": 91.4,
  "vsLastMonth": 2.1,
  "vsLastYear": 8.4
}
```

**`GET /portfolio/performance/pdf?period=YYYY-MM`** — returns
signed S3 URL the FE can hand to the OS share sheet.

---

## §6 — Maintenance read-model *(blocks Phase 3)*

The landlord does NOT manage maintenance from mobile — that is
deliberately PM's job. We need a read-only summary.

**`GET /maintenance/summary`**

```json
{
  "openRequests": 7,
  "inProgress": 3,
  "awaitingParts": 2,
  "overdue": 1,
  "overdueDetails": [
    {
      "id": "mr-001",
      "unitName": "Magnolia C",
      "issue": "Leaking kitchen faucet",
      "ageDays": 9,
      "assignedTo": "Acme Plumbing"
    }
  ]
}
```

A request is "overdue" when `ageDays > 7` AND status is not
"COMPLETED". BE owns the threshold; we just consume the flag.

---

## §7 — Lease Expiry rollup *(soft — has FE fallback)*

**`GET /agreements/expiring`** — preferred. Returns bucketed +
flat list.

```json
{
  "buckets": {"thisMonth": 2, "nextMonth": 7, "inSixtyDays": 11},
  "expiring": [
    {
      "unitId": "u-12a",
      "unitName": "Unit 12A",
      "tenantName": "Sarah Chen",
      "expiresOn": "2026-12-01",
      "daysToExpiry": 22,
      "renewalStatus": "SENT_NOT_SIGNED"
    }
  ]
}
```

`renewalStatus`: `SIGNED | SENT_NOT_SIGNED | NOT_SENT`.

If BE doesn't ship this, FE falls back to
`/search/agreements?size=200` and rolls up client-side. Works at
MVP scale (≤200 leases per landlord).

---

## §8 — Rent Insurance *(blocks Phase 4)*

**`GET /insurance/summary`**

```json
{
  "insuredUnits": 186,
  "totalUnits": 200,
  "coveragePercent": 93,
  "monthlyPremium": 2790,
  "activeClaims": 0,
  "claimsYTD": 2,
  "paidOutYTD": 3600,
  "recoveredYTD": 2400,
  "netCoveredRent": 196000,
  "outOfPocket": 0
}
```

Underwriter / claims processor choice (white-label vs in-house) is
a deferred business decision; this is a read-model. Premium billing
flows through the existing invoice path.

---

## §9 — Multi-owner reporting *(blocks Phase 4)*

Today BE models one landlord = one entity. We need a separate
`Owner` entity and `Property.ownerId` relation, plus rollup
endpoints.

**`GET /owners`**
```json
[
  {"id": "o1", "name": "Margaret Chen", "propertyCount": 3},
  {"id": "o2", "name": "The Kowalski Trust", "propertyCount": 8}
]
```

**`POST /owners/{ownerId}/reports`** — body `{period: "YYYY-MM"}` →
`{url: "<signed s3 url>", expiresAt: "<iso>"}`.

**`POST /owners/{ownerId}/reports/email`** — body `{period}` →
`{status: "queued"}`. BE sends a templated email to the owner's
on-file address with the PDF attached.

Report contents (server-side template): rent collected vs expected
per property, maintenance costs, vacancy summary, YTD comparison.

---

## §10 — Compliance Alerts (WA HB 1217 first) *(blocks Phase 4)*

CEO override on Strategic Playbook §"Not Building Year 1 —
National compliance beyond TX/FL/GA." This adds WA HB 1217 (rent
increase 90-day notice) specifically. Other jurisdictions not
enabled until the playbook expands.

**`GET /compliance/alerts`**

```json
[
  {
    "id": "wa-hb1217-1",
    "jurisdiction": "WA",
    "regulation": "HB 1217",
    "title": "Rent increase requires 90-day notice",
    "unitName": "Unit 3B",
    "deadline": "2026-06-15",
    "actionLabel": "Send 90-day notice",
    "status": "NOT_SENT"
  }
]
```

**`POST /compliance/alerts/{alertId}/send`** — generates notice
from a server-side template sourced from RCW 59.18, dispatches via
the certified-mail-digital provider, and writes an audit-trail
entry. Idempotent on retry.

Templates live in the BE and are versioned; FE never interprets the
statute. The landlord signs (signature already on file via
Keystone onboarding) and the action is logged.

---

# PART B — Tenant app

The tenant experience is rebuilt around the wedge: a renter (provisioned
by their landlord) sees their rent, pays it instantly + directly to the
landlord's bank, and keeps receipts/lease in one place. Same FE pattern —
each endpoint 404/501 falls back to a fixture in `src/services/mocks/index.js`
(keys `tenant.*` / `notifications`) and picks up the live BE automatically.

## §T1 — Tenant rent summary rollup *(blocks tenant home)*

**`GET /tenants/rent-summary`** — one round-trip for the home screen.

```jsonc
{
  "tenant": {"firstName": "Sarah", "lastName": "Chen", "email": "…", "phone": "…"},
  "rent": {
    "amount": 1800,
    "periodLabel": "June 2026",
    "dueDate": "2026-06-10",
    "daysUntilDue": 5,
    "status": "DUE",          // DUE | PAID | OVERDUE
    "paidThisPeriod": 0
  },
  "lease": {
    "unit": "4B", "property": "Magnolia Court",
    "address": "128 Magnolia Ave, Austin, TX",
    "monthlyRent": 1800, "deposit": 1800,
    "startDate": "2025-08-01", "endDate": "2026-07-31",
    "daysToEnd": 56, "term": "12 months",
    "landlord": "Keystone Property Group",
    "agreementStatus": "ACCEPTED",   // ACCEPTED | PENDING (drives accept card)
    "documents": [{"id": "d1", "name": "Lease agreement.pdf", "kind": "Signed", "date": "2025-07-28"}]
  },
  "paymentMethod": {"type": "bank", "name": "Chase", "last4": "8821"},
  "autopay": {"enabled": false},
  "recentPayments": [
    {"id": "r1", "amount": 1800, "date": "2026-06-01", "method": "Bank · Chase ••8821", "code": "KS-9F2A", "status": "PAID", "period": "May 2026"}
  ]
}
```

## §T2 — Pay rent (instant, direct) *(blocks tenant home)*

**`POST /tenants/pay-rent`** — settles the rent straight to the landlord's
bank (Dwolla customer→landlord, RTP/FedNow rail). Idempotent on a
client-supplied key.

```jsonc
// Request
{"amount": 1800, "idempotencyKey": "<uuid>"}

// Response (FE renders this as the receipt)
{
  "code": "KS-RTQV", "amount": 1800, "date": "2026-06-05T12:36:00Z",
  "method": "Bank · Chase ••8821", "status": "SETTLED",
  "paidTo": "Keystone Property Group", "property": "Magnolia Court", "unit": "4B",
  "period": "June 2026"
}
```

Also need **autopay**: `PATCH /tenants/autopay` `{enabled, dayOfMonth}` — pay
on the due date automatically.

## §T3 — Payment history *(soft — FE falls back)*

**`GET /tenants/payments`** → array of the `recentPayments` shape above
(full history, newest first). Each item is a downloadable receipt.

## §T4 — Rent ledger *(soft)*

**`GET /tenants/statement`** — charges (rent) and credits (payments).

```json
{
  "openingBalance": 0, "closingBalance": 1800,
  "totalCharges": 5400, "totalCredits": 3600,
  "entries": [
    {"id": "e1", "entryDate": "2026-06-01", "description": "Rent · June 2026", "charge": 1800, "credit": 0, "runningBalance": 1800}
  ]
}
```

## §T5 — Notifications *(soft — shared endpoint)*

**`GET /notifications`** already exists. The tenant app reads
`content[].{type,title,body,createdAt,read}` with
`type ∈ {REMINDER, RECEIPT, PAYMENT, LEASE}`. Please include `title`
(short) alongside `body`, and a real `read` flag. Mark-read
(`PATCH /notifications/{id}`) is still on the landlord-side ask.

## §T6 — Lease acceptance *(exists — confirm)*

`PATCH /agreements/{id}/acceptance` already exists. The new home shows a
"Review & accept your lease" card when `rent-summary.lease.agreementStatus
== "PENDING"`; accepting calls this endpoint. Just confirm the
`agreementStatus` is reflected in the §T1 rollup.

---

## Quick checklist for BE PM

- [ ] §1 dashboard rollup
- [ ] §2 FCM push on Dwolla webhook
- [ ] §4 FedNow trigger + auto-payout cron
- [ ] §5 portfolio rollup + PDF export
- [ ] §6 maintenance summary
- [ ] §7 expiring-leases rollup (FE has fallback; lowest priority)
- [ ] §8 insurance summary
- [ ] §9 Owner entity + multi-owner reports
- [ ] §10 compliance template + dispatch

FE will switch off mocks for each section automatically once the BE
endpoint returns 200 with the expected shape. No FE deploy required
on BE delivery.
