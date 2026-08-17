# BE asks — Keystone Mobile Landlord Command Center

This document lists every endpoint the mobile landlord app calls
that BE has not yet shipped. Each section gives the route, the
request/response shape FE consumes, and the source spec ($ section
of the user's command-center brief).

FE behavior when an endpoint is missing: catch it → serve a mock
fixture from `src/services/mocks/index.js` and log a `[live] <route>
→ <status>` line followed by `[mock] "<key>"`. This keeps the UI
renderable during the BE buildout. When BE ships an endpoint, FE
will pick it up with no FE code change.

---

## ⚠️ FE re-measurement — 2026-07-29, after the BE response

**The "Shipped in this pass" work is not deployed to `api-dev`.** FE
re-probed every route with a fresh landlord token immediately after
receiving the note below. The split is exact and leaves no doubt:

- Everything BE lists as **"already existed"** answers with a *domain*
  error, i.e. the route is registered:
  `/tenants/credit`, `/tenants/autopay`, `/tenants/payment-methods` →
  *"No tenant profile for the current user"*; `/tenants/claim` →
  *"Invite code is required"*; `/notifications/unread-count` → `200
  {"unread":0}`.
- Everything BE lists as **"shipped in this pass"** is still
  unregistered: `/tenants/rent-summary`, `/statement`, `/payments`,
  `/repairs`, `/checklist`, `/deposit`,
  `/notification-preferences` and `/agreements/expiring` all still fall
  through to `/{id}` with *"Parameter 'id' must be a valid UUID"*;
  `/portfolio/performance` and `/maintenance/summary` still 404;
  `/transactional-reports` still 500s.

Consistent with the note being written against branch
`claude/adverse-action-dispatch-239mbi` — please merge + deploy to dev.
FE needs no code change for those routes once deployed; we will re-run
this probe to confirm.

**What FE wired off the back of this response** (the live routes):
`PATCH /notifications/{id}/read` + `GET /notifications/unread-count`,
and `GET /tenants/claim?token=` — the claim screen previously accepted
*any* code and rendered a fixture invite. Both verified against
`api-dev`. Note `?token=` and `?code=` both work but `?inviteCode=`
does not; FE sends `token`.

---

## BE response — 2026-07-29

> Written by BE against commit `3606a592` on branch
> `claude/adverse-action-dispatch-239mbi`. **Read this before the
> `api-dev` table below it, which is now partly stale.**

**The 400s were not a route collision.** There is no ordering bug in
Spring — a literal path segment always outranks a `{template}` one. The
endpoints simply did not exist at the paths the app calls, so the
requests fell through to `GET /tenants/{id}` and failed UUID coercion.
Several of them *did* exist, under different paths, and the app was
never told:

| App calls | Was already live at | Now also live at the app's path |
|---|---|---|
| `GET /portfolio/performance` | `GET /dashboard/portfolio-performance` | ✅ shipped |
| `GET /agreements/expiring` | `GET /dashboard/lease-expiry-timeline` | ✅ shipped |
| `GET /tenants/rent-summary` | `GET /tenant/me/rent-summary` | ✅ shipped |
| `GET /tenants/statement` | `GET /tenant/me/statement` | ✅ shipped |
| `GET /tenants/payments` | `GET /tenant/me/payments` | ✅ shipped |
| `GET /tenants/repairs` | `GET /tenant/me/maintenance` | ✅ shipped |
| `GET /tenants/checklist` | `GET /tenant/me/checklist` | ✅ shipped |

The `/tenant/me/**` routes stay for the SPA and keep their internal DTO
shapes. The new `/tenants/**` routes return **the shapes specified in
this document**, field-for-field, because the mobile services hand the
raw axios `data` to their screens with no normalizer. No FE change is
needed for any of the above.

Endpoints the app calls that **already existed and you have not wired**:
`GET`/`PATCH /tenants/credit` (§T9 consent state, §T14-compliant),
`GET`/`PATCH /tenants/autopay` (§T14 mandate),
`GET`/`POST /tenants/payment-methods` (§T12 + ToS/KYC),
`GET`/`POST /tenants/claim` (§T16),
`PATCH /notifications/{id}/read` and `GET /notifications/unread-count` (§T5).

### Shipped in this pass

| § | Endpoint | Note |
|---|---|---|
| §5 | `GET /portfolio/performance?period=YYYY-MM` | `averageDaysToPay` is **null** — the invoice schema has no paid-at timestamp, so it cannot be computed. `lateFees` and `insuranceClaims` are `0` (no window-level penalty rollup; no insurer). `vsLastMonth`/`vsLastYear` are real percentage changes, `null` when the prior window is zero. |
| §5 | `GET /portfolio/performance/pdf` | **501** — no server-side renderer or signed-URL pipeline for this report. Your "coming soon" toast path is correct. |
| §6 | `GET /maintenance/summary` | `awaitingParts` is always `0`: the domain has no such status and folding another status into it would misreport the queue. `assignedTo` is `null` — no vendor column. Overdue = age > 7d and not resolved. |
| §7 | `GET /agreements/expiring` | Buckets are **cumulative** windows (thisMonth ⊆ nextMonth ⊆ inSixtyDays), matching your example's increasing counts. `renewalStatus` reflects the *lease's* e-sign envelope; there is no separate renewal envelope model yet. |
| §9 | `POST /owners/{id}/reports` | Renders the P&L PDF, stores it with **no public ACL**, returns a presigned URL expiring in 15 minutes. |
| §9 | `POST /owners/{id}/reports/email` | **501** — Brevo has no attachment support, and mailing an owner's financials needs an attachment-vs-link and retention decision. Use `POST /owners/{id}/reports`. |
| §T1 | `GET /tenants/rent-summary` | Full shape. `rent.dueDate` is the agreement's `rentDueDate` day applied to the invoice period — invoices carry no due-date column. `recentPayments` is `[]` (see §T3). |
| §T3 | `GET /tenants/payments` | Bare array as specified. Empty until settlement (§T2) ships. |
| §T4 | `GET /tenants/statement` | AR sub-ledger, same projection the SPA gets. |
| §T7 | `GET /tenants/repairs` | `category` and `priority` are `null` — `repair_requests` has neither column, so **`priority` is not round-tripping from your submit**; see the tracker item. The timeline is projected from the single stored status, so "Scheduled" is never `done`. |
| §T8 | `GET`/`POST /tenants/checklist` | Read + write. **`POST` takes `itemId` + `complete` + optional `photo`** (multipart), not the `{type, rooms[]}` body in §T8 — see the gap note below. |
| §T10 | `GET /tenants/deposit` | Derived from the agreement + checklist. `condition` is `null` and `return.status` only reaches `NOTICE_GIVEN`; `REFUNDED` needs a deposit-refund ledger entry that does not exist. |
| §T15 | `GET`/`PATCH /tenants/notification-preferences` | Unset reads as **on**, so no existing tenant's delivery changed. `sms` and `creditUpdates` default **off**. Critical tenancy notices (eviction/legal/statutory/termination) ignore these toggles entirely and always send. |
| §8, §T11 | `GET /insurance/summary`, `GET /tenants/insurance`, `POST /tenants/insurance/proof` | **501** — no insurer partner, therefore no policy/premium/claims data source. Routes and gates are frozen; keep your fixtures. 501 is already in your `isEndpointUnavailable` list. |
| — | `GET /transactional-reports` | **500 fixed.** Root cause: the COUNT query was rebuilt by scraping the page SQL for `" WHERE "`, and this method's Java text block puts `WHERE` and `1=1` on separate lines. Text blocks strip trailing whitespace, so the scrape stopped matching, the COUNT lost its filter, and every named parameter was still bound to it — and `userId` is always bound from the JWT. Binding a parameter absent from the SQL throws. `/reports/summary` escaped it only because its text block writes `where 1=1` on one line. |

### Gaps you should plan around

- **§T8 is half-delivered.** The write path completes checklist *items* on
  the existing `move_in_tasks` table. The room-by-room condition log with a
  photo set per room and a **locked, diffable baseline** is a schema change
  and is not built — so nothing today actually shields a deposit dispute.
  Do not tell renters it does.
- **§T7 `priority` is dropped.** Your submit sends it; `repair_requests`
  has no column for it, so it is neither stored nor echoed, and the
  landlord's §6 queue cannot triage on urgency.
- **§4 is still on the "Quick checklist for BE PM"** below even though the
  section is marked WITHDRAWN. Please strike it — it reads as live scope.
- **`POST /profile/tenant` 422 is arguably correct now.** §T16 says open
  tenant self-signup is removed and Keystone is provisioned-only. The
  table below calls this "the whole tenant door" being blocked; those two
  statements contradict each other. If §T16 is the intent, the fix is for
  the app to stop calling `/profile/tenant` and use the claim flow, which
  is live. Confirm which you want.

### Your two contract questions

1. **`identificationType`** — your list is right; `SSN_LAST_4` does not
   exist and was never a member.
2. **Tenant role name** — the realm role is `TENANT`. The tenant surface
   is gated on `hasRole('TENANT')`, i.e. the authority `ROLE_TENANT`
   after Spring's prefix. Your substring match on `LANDLORD_OWNER` /
   `TENANT` is correct; you do not need `ROLE_` in the raw claim.

---

## Verified against `api-dev` — 2026-07-29 *(FE-measured; see BE response above)*

Measured with a real landlord token (Keycloak password grant,
`client_id=keystone-mobile`). `auth-dev`/`api-dev` are the only
environments that resolve; `api-uat`, `api`, and `auth-uat` are all
NXDOMAIN, so the app now defaults to `Environment.Dev`.

| Route | Status | Note |
|---|---|---|
| `GET /dashboard/daily-collection` | ✅ 200 | flat B79 shape; `normalizeDashboard` maps it |
| `GET /payment-zones` | ✅ 200 | zone buckets, empty for a new landlord |
| `GET /owners` | ✅ 200 | paged, empty |
| `GET /notifications` | ✅ 200 | paged, empty |
| `GET /analytics/invoice` | ✅ 200 | paged, empty |
| `POST /profile/email-verification` | ✅ 200 | OTP email delivers (Brevo) |
| `POST /profile/landlord` | ✅ 200 | returns `{landlord, session}` |
| `GET /portfolio/performance` | 404 | not shipped → fixture |
| `GET /maintenance/summary` | 404 | not shipped → fixture |
| `GET /insurance/summary` | 404 | not shipped → fixture |
| `GET /compliance/alerts` `/audit` | 404 | not shipped → fixture |
| `GET /tenants/*` (5 routes) | ⚠️ 400 | **route collision** — swallowed by `/tenants/{id}`: *"Parameter 'id' must be a valid UUID (got 'rent-summary')"*. Needs a distinct path or a `/tenants/me/...` prefix. |
| `GET /agreements/expiring` | ⚠️ 400 | same collision under `/agreements/{id}` |
| `GET /transactional-reports` | 🔴 500 | endpoint exists but throws |
| `POST /profile/tenant` | 🔴 422 | **tenant self-signup is broken** — "would violate a database constraint" with a fresh email, phone, and ID number. Blocks the whole tenant door. |

Two contract notes:
- `identificationType` accepts `[ITIN, PASSPORT, PASSPORT_ID, STATE_ID,
  EIN, DRIVERS_LICENSE, SSN, NATIONAL_ID]`. `SSN_LAST_4` (named in an
  `AuthServices` comment) does **not** exist.
- `GET /manage-profile/me` returns raw Keycloak realm roles
  (`LANDLORD_OWNER`), not the `ROLE_LANDLORD` / `ROLE_TENANT` the app
  used to test for. FE now matches on substring (`src/utils/roles.ts`).
  Please confirm the **tenant** role name — it could not be observed
  because tenant signup 422s.

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

### ⚠️ OPEN PRIVACY QUESTION — device DEREGISTRATION on sign-out

**Unverified, and it needs an explicit answer before sign-out can be
called private.** On sign-out the app clears the token locally and calls
Keycloak logout. It does **not** tell the gateway to drop the
device→user mapping, because there is no endpoint to call.

If the backend does not remove that mapping during logout, a signed-out
handset stays eligible for the previous user's notifications — rent
amounts, payment confirmations, lease events — delivered to whoever is
now holding the phone. On a shared or resold device that is a real
disclosure, and the app cannot fix it from this side.

We need ONE of:

1. A confirmed guarantee that logout (or token revocation) already
   removes the device mapping server-side, with the behaviour stated —
   including what happens to a token registered by user A and later
   re-registered by user B on the same handset; or
2. `DELETE /notifications/deviceToken?deviceToken=<token>` (or
   equivalent) that the app calls during sign-out, before the session is
   torn down.

FE will wire (2) as soon as it exists. Until one of these is answered,
treat sign-out privacy as **unverified** rather than working.

### ⚠️ AND: the push PAYLOAD must not carry account detail in its body

Independent of deregistration, and **not fixable from the app**.

The app now refuses to display an account notification when no session is
active — the inbound handler returns early unless the auth gate says
`authenticated`. That covers the case where the app is running.

It cannot cover the **terminated-app** case. When the process is not
running, iOS and Android render the notification payload themselves; no
app code executes. So a payload whose `title`/`body` reads

> `Rent Received — Unit 4B, James Otieno, $1,800.00`

is displayed on the lock screen of a signed-out (or resold, or shared)
handset, and there is nothing the client can do about it.

**Required contract:** the visible `title`/`body` must carry no account,
tenancy, amount or identity detail. Put the specifics in the `data`
payload, which only the app can read, and keep the display copy generic:

```jsonc
{
  "notification": { "title": "Keystone", "body": "You have a new update" },
  "data": { "type": "PAYMENT_RECEIVED", "amount": 1800.00, "unitName": "Unit 4B", … }
}
```

The app already re-renders a rich local notification from `data` once it
is running and authenticated, so nothing is lost in the normal case —
only in the case where showing it would be a disclosure.

### ⚠️ AND: every push needs `data.recipientUserId`

**Blocking rich rendering today.** "Someone is signed in" is not "this
notification belongs to them", and nothing in the current payload says
who it is for.

The window is concrete and does not require any exotic timing. User A
signs out and user B signs in on the same handset. Until B's device
registration lands — or if it fails, or if A's mapping was never
removed — the gateway can still deliver a push intended for A. The app's
auth gate is satisfied, because B *is* authenticated, and A's rent,
tenancy or maintenance detail renders in front of B.

**Required:** every push carries the intended recipient's stable user id
in the data payload, **plus the display copy**, since the top-level
fields must stay generic (previous section):

```jsonc
{
  "notification": { "title": "Keystone", "body": "You have a new update" },
  "data": {
    "recipientUserId": "<the user this is for>",
    "type": "GENERAL",
    "title": "Repair scheduled",                       // detail lives here
    "body": "Your kitchen tap — plumber Thursday 9am", // detail lives here
    …
  }
}
```

**`recipientUserId` namespace — exactly.** It must equal the `userId`
returned by `GET /manage-profile/me`, byte for byte. **Not** a tenant
record id, **not** a landlord id, **not** a different identity-provider
subject. That is the only id the app holds for the signed-in user, and it
is what the comparison uses. A near-miss fails in one of two ways: ids
that never match send every notification down the generic path (merely
disappointing), while ids that collide across different people are the
disclosure itself.

**Why `data.title` / `data.body` and not the top-level fields:** the
top-level pair is what the OS renders on a locked screen with no app code
running, so it has to stay generic. `data` is only ever read by the app,
after it has checked the recipient — so that is where detail belongs.
Without these two fields the app has nothing detailed it is allowed to
show, and a compliant push renders only "You have a new update".

The app's behaviour, already implemented against this contract:

| payload | app does |
|---|---|
| `recipientUserId` matches the signed-in user | renders the notification from `data` |
| `recipientUserId` is a different user | **drops it silently** |
| `recipientUserId` absent (today) | shows only a generic "You have a new update" and refetches the signed-in user's authorised data |

So until this field ships, **no push renders its own content** — the app
degrades to a content-free nudge. That is deliberate: the alternative is
showing one tenant's information to another. Adding the field restores
rich notifications with no further mobile change.

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

# PART C — Tenant command center (capture half)

> **Thesis.** The tenant app is the *data-capture half* of Keystone — every
> landlord read-model is fed by a tenant action. The four magnet features
> (credit building, maintenance, rent flexibility, renters insurance) make the
> renter *want* to engage, which is what produces the data the landlord needs.
> CEO approved building these surfaces now as **premium UI + mock + this ask**;
> credit/insurance need a partner (bureau / insurer) and flexibility needs a
> product/risk sign-off before real settlement. Each route below 404/501 falls
> back to a fixture in `src/services/mocks/index.js` and picks up live BE with
> no FE change.

### Tenant action → landlord data map

| Tenant action (this app) | Endpoint | Feeds landlord side |
|---|---|---|
| Report a repair (photo) | `POST /request-repair` *(live)* | Maintenance summary §6 (open/overdue) |
| Move-in checklist | `POST /tenants/checklist` | Deposit baseline · inspection |
| Move-out checklist + notice | `POST /vacate-notice` *(live)* | Lease Expiry §7 · deposit return |
| Renewal response | `POST /extensions` *(live)* | Lease Expiry §7 · renewals |
| On-time payment streak | derived from §T2/§T3 | Collection reliability §3 + tenant credit §T9 |

## §T7 — Repairs list + detail *(blocks My Home → Repairs)*

Submit reuses the **live** `POST /request-repair` (multipart: `message`,
`priority` (`NORMAL` | `URGENT`), `attachmentFile`). The tenant picks an
urgency; `URGENT` is prefixed in the message and sent as a `priority` field so
the landlord's maintenance read-model can triage. A life-safety / no-heat-water
/ lockout issue is routed to a **phone call** (911 or the lease `emergencyPhone`
after-hours line) from the report screen instead of a ticket that waits. We need
the read side, which should echo `priority` per request:

**`GET /tenants/repairs`** → newest first.

```jsonc
[
  {
    "id": "rp1", "category": "Plumbing", "title": "Leaking kitchen faucet",
    "status": "IN_PROGRESS",            // SUBMITTED | IN_PROGRESS | RESOLVED
    "createdAt": "2026-06-02T09:00:00Z", "photoUrl": "<signed s3>",
    "timeline": [
      {"label": "Submitted", "at": "2026-06-02T09:00:00Z", "done": true},
      {"label": "Acknowledged", "at": "2026-06-02T14:00:00Z", "done": true},
      {"label": "Scheduled", "at": "2026-06-04T08:00:00Z", "done": true},
      {"label": "Resolved", "at": null, "done": false}
    ]
  }
]
```

The same record feeds the landlord's read-only **maintenance summary (§6)** —
one tenant submit, both sides update.

## §T8 — Move-in / move-out checklist *(blocks My Home → Checklist)*

The room-by-room condition log that sets the **deposit baseline** and the
move-out comparison. This is the deposit dispute shield.

**`GET /tenants/checklist`**
```jsonc
{
  "type": "MOVE_IN",                    // MOVE_IN | MOVE_OUT
  "status": "IN_PROGRESS", "completed": 4, "total": 6,
  "rooms": [
    {"id": "rm1", "name": "Living room", "condition": "Good", "done": true, "photoCount": 3},
    {"id": "rm2", "name": "Kitchen", "condition": null, "done": false, "photoCount": 0}
  ]
}
```

**`POST /tenants/checklist`** — body `{type, rooms:[{id, condition, notes, photos:[…]}]}`
(multipart for photos). Server stamps and locks a baseline on completion; the
move-out pass diffs against it. Feeds the landlord deposit-return decision.

## §T9 — Credit building *(blocks Home + Credit; needs bureau partner)*

Reports on-time rent to the bureaus. Score + streak drive the Home snapshot
Ring and the Credit screen.

**`GET /tenants/credit`**
```jsonc
{
  "enabled": true, "score": 712, "delta": 18, "band": "Good",
  "streakMonths": 9, "reportedTo": ["TransUnion", "Equifax"],
  "history": [684, 690, 690, 695, 701, 705, 708, 712, 712]
}
```

**`PATCH /tenants/credit`** — body `{enabled}` (opt in/out of reporting).

> Needs a bureau/data-furnisher partner (e.g. via a rent-reporting aggregator).
> Shipped as UI + mock now; the `score`/`history` come from the partner.

## §T10 — Deposit *(blocks My Home → Deposit)*

**`GET /tenants/deposit`** — derived from the agreement
(`deposit`, `daysOfDepositRefundAfterTermination`) + the move-in checklist.

```jsonc
{
  "held": 1800, "refundDays": 14, "condition": "Good",
  "moveInLogged": true, "heldBy": "Keystone Property Group",
  "return": {
    "status": "HELD",          // HELD | NOTICE_GIVEN | INSPECTION | REFUNDED
    "moveOutDate": null,        // set from the §T8/vacate notice
    "expectedBy": null,         // moveOutDate + refundDays
    "amount": 1800,             // projected refund
    "deductions": 0
  }
}
```

Read-model only — no new write. `condition` mirrors the move-in checklist (§T8).
The `return` block drives the FE deposit-return tracker; `status` advances off
the vacate notice (`POST /vacate-notice`) and the move-out inspection, so the
tenant can watch their refund come back.

## §T11 — Renters insurance *(blocks More → Insurance; needs insurer partner)*

**`GET /tenants/insurance`**
```jsonc
{
  "status": "COVERED",                  // COVERED | NOT_COVERED
  "carrier": "Lemonade", "monthlyPremium": 14,
  "propertyCoverage": 30000, "liabilityCoverage": 100000,
  "policyNumber": "LM-44821", "renewsOn": "2027-01-01"
}
```

`NOT_COVERED` renders a "Get covered" CTA (deep-link/handoff to the insurer
partner). UI + mock now; policy data comes from the insurer.

**Proof of an outside policy** — most leases require proof of renters insurance,
so a tenant insured elsewhere can upload theirs; it feeds the landlord's
lease-compliance record. The `GET /tenants/insurance` response carries a
`proof` block:

```jsonc
"proof": {
  "status": "NONE",          // NONE | SUBMITTED | VERIFIED
  "carrier": null, "policyNumber": null, "liability": null,
  "expiresOn": null, "documentName": null
}
```

**`POST /tenants/insurance/proof`** — multipart `{ carrier, policyNumber,
liability?, expiresOn?, document }` (the document is a photo/scan of the
declarations page). BE stores it as `SUBMITTED`; a human/automated check moves
it to `VERIFIED`. Surfaces on the landlord side as a per-unit compliance flag.

## §T12 — Payment methods + autopay *(blocks Pay → Methods/Autopay)*

**`GET /tenants/payment-methods`**
```jsonc
[
  {"id": "pm1", "type": "bank", "name": "Chase", "last4": "8821", "default": true},
  {"id": "pm2", "type": "card", "name": "Visa",  "last4": "4417", "default": false}
]
```

**`POST /tenants/payment-methods`** — Dwolla funding-source attach (bank via
Plaid/processor token, card via tokenized PAN). **`PATCH …/{id}/default`** sets
the default. **`DELETE …/{id}`** removes.

Autopay extends §T2: **`PATCH /tenants/autopay`** `{enabled, dayOfMonth, methodId}`.

**Add-a-method flow (just-in-time KYC).** The FE now runs the add-method flow as:
Dwolla ToS gate → **KYC/CIP capture** → Plaid bank-link → funding source. KYC is
collected here (not at claim) per the CEO decision. BE needs:

- **`POST /tenants/kyc`** `{ firstName, lastName, dob, ssnLast4, address }` →
  create/verify the Dwolla customer (CIP). Return a verification status
  (`verified | document | retry`). Keystone must **not** store the full SSN — pass
  it straight to Dwolla. The FE collects exactly these fields and shows a CIP
  disclosure (centralized in `src/constants/legalCopy.js → KYC`, DRAFT pending
  counsel).
- **`POST /tenants/plaid/link-token`** → a Plaid Link token so the FE can open
  Plaid and exchange the public token for a Dwolla processor token. *(FE Plaid
  step is stubbed until the `react-native-plaid-link-sdk` dependency + this token
  are available.)*

## §T13 — Rent flexibility *(Pay → "need more time"; needs risk sign-off)*

Pay part now / split the rest — the renter-facing side of the
landlord-protection model (**landlord is still paid in full**; Keystone carries
the timing). UI + ask only until product/risk confirms terms.

**`POST /tenants/pay-rent`** already settles a partial when `amount < rentDue`.
Proposed split plan:

**`POST /tenants/flexibility/plan`**
```jsonc
// Request
{"payNow": 900, "remainder": 900, "remainderDate": "2026-06-20"}
// Response
{"planId": "fp_1", "status": "PROPOSED", "schedule": [
  {"amount": 900, "date": "2026-06-07", "status": "DUE"},
  {"amount": 900, "date": "2026-06-20", "status": "SCHEDULED"}
]}
```

## §T14 — Compliance records (FCRA + NACHA/Reg E + Dwolla) *(blocks production)*

> **Lawsuit-shield, not optional.** CEO decision (2026-06-07): credit reporting
> runs through an **aggregator partner** (the partner is the FCRA furnisher of
> record); payments are **Dwolla white-label** (Keystone hosts ToS acceptance +
> ACH authorization). The FE now captures consent on every relevant screen and
> needs the BE to **persist each consent as a timestamped, immutable record**.
> All user-facing legal copy is centralized in `src/constants/legalCopy.js` and
> is **DRAFT pending counsel sign-off** — do not treat the wording as final.

**FCRA — rent-reporting consent.** Reporting must default **OFF**; the BE
returns `credit.enabled=false` for an un-enrolled tenant. When the tenant opts
in, FE calls:

**`PATCH /tenants/credit`** `{ "enabled": true, "consentAt": "<iso>" }` — store
`consentAt` as the authorization record (who/when/which disclosure version).
Turning off sends `{ "enabled": false }`. Disputes are routed to the partner's
portal (`CREDIT_REPORTING.disputeUrl`) — BE supplies the URL; **no FCRA dispute
investigation runs on Keystone** in the aggregator model.

**NACHA — ACH authorization (Autopay + one-time).** Recurring debits require an
explicit mandate. FE captures it, BE stores it:

**`PATCH /tenants/autopay`** `{ "enabled": true, "dayOfMonth": 1, "methodId": "pm1",
"authorizationAt": "<iso>", "authorizationText": "<the mandate shown>" }` —
persist the exact mandate text + timestamp (revocable; cancel = `enabled:false`).
One-time `POST /tenants/pay-rent` should likewise log the displayed authorization
+ Reg E notice against the transfer.

**Dwolla white-label — ToS acceptance + KYC.** Before a funding source is
created, the tenant accepts Dwolla ToS + Keystone Payment Terms:

**`POST /tenants/payment-methods`** must carry
`{ "dwollaTosAcceptedAt": "<iso>", "ipAddress": "<addr>" }` and only then create
the Dwolla funding source. White-label also needs a **KYC/CIP** step
(name/DOB/SSN-last4/address → Dwolla customer verification) — surface the
verification status back so FE can show pending/verified/retry. Reg E
error-resolution contact + EFT disclosure must be reachable from the app.

Checklist for the compliance pass:
- [ ] `credit.enabled` defaults false; `PATCH /tenants/credit` stores `consentAt`
- [ ] partner dispute URL provided for `CREDIT_REPORTING.disputeUrl`
- [ ] `PATCH /tenants/autopay` stores `authorizationAt` + mandate text
- [ ] `POST /tenants/payment-methods` stores `dwollaTosAcceptedAt` + KYC status
- [ ] counsel sign-off on every string in `src/constants/legalCopy.js`

---

## §T15 — Notification preferences *(soft — FE has defaults)*

The tenant controls what they hear about and how. Part of `GET /tenants/rent-summary`
(or its own `GET /tenants/notification-preferences`):

```jsonc
"notificationPrefs": {
  "channels": {"push": true, "email": true, "sms": false},
  "topics": {
    "rentReminders": true, "paymentReceipts": true, "repairs": true,
    "leaseRenewals": true, "creditUpdates": false
  },
  "rentReminderDays": 5            // 1 | 3 | 5 — when to remind before due
}
```

**`PATCH /tenants/notification-preferences`** — partial update of any of the
above. The BE must still send **critical tenancy notices** (e.g. eviction /
legal) regardless of these toggles; topics only gate non-critical pushes. FE
falls back to all-on defaults if the block is absent.

---

## §T16 — Tenant invite & claim *(blocks onboarding — Phase 5)*

Keystone is **provisioned-only**: the landlord adds the tenant + lease (agreement
= `PENDING`), and the tenant *claims* a pre-created account. Open self-signup is
removed for tenants — no invite, no account. CEO decisions (2026-06-07): KYC is
**just-in-time** (collected at "Add bank," §T12, not at claim); the **minimum to
finish onboarding is claim + verify contact + accept lease** — payment / KYC /
autopay / credit / checklist are post-claim nudges on Home.

**Invite (BE/landlord side):** on tenant creation, send an SMS + email with a
deep link carrying a one-time **claim token** (e.g. `keystone://claim?token=…`
or a universal link). Token is scoped to the agreement + invited contact, single
use, expiring.

**`GET /tenants/claim?token=<token>`** — resolve the token so the claim landing
can show who's being invited before any auth:

```jsonc
{
  "token": "inv_…", "property": "Magnolia Court", "unit": "4B",
  "address": "128 Magnolia Ave, Austin, TX", "landlord": "Keystone Property Group",
  "tenantName": "Sarah Chen", "rent": 1800
}
```

**Claim = account activation:** the OTP-verify → set-password → confirm-profile
steps **reuse the existing registration screens**, but driven by the claim token
(prefilled email/phone, Keycloak user *activated* rather than self-registered).
BE needs: validate OTP for the invited contact, set the Keycloak credential, and
mark the invite consumed. Accepting the lease (existing
`PATCH /agreements/{id}/acceptance`) flips `PENDING → ACCEPTED`.

**Supply loop — "ask my landlord" (no BE for v1):** a renter with no invite can
share a prefilled message (OS share sheet) inviting their landlord to Keystone.
Optional future BE: capture the lead (renter contact + landlord contact) so sales
can follow up — a `POST /leads/landlord-referral` `{ renterContact, landlordContact? }`.
Not built yet; flagged as an opportunity.

---

## §T17 — Roommate agreements *(blocks My Home → Roommates; needs BE model work)*

Keystone's renter differentiator: in a shared unit, **each roommate has their own
agreement** — their own rent share, their own ledger, their own credit reporting,
and their own liability. Unlike a joint-and-several lease, one roommate's missed
payment never lands on the others, and a tenant's credit reflects only their own
payments. This is a real data-model change, not just a screen.

**BE model:** a unit can have **multiple active agreements** (one per roommate)
with a **rent split** (`share` per tenant of the unit's `totalRent`). Each
agreement has its own invoices/ledger and its own credit-reporting stream (§T9).
The landlord sets the split (even / custom) when provisioning roommates.

**`GET /tenants/household`** — the requesting tenant's view (they only ever see
their own share + a light roster):

```jsonc
{
  "isShared": true, "totalRent": 1800, "yourShare": 900, "splitLabel": "Split evenly",
  "members": [
    {"id": "m1", "name": "Sarah Chen", "share": 900, "you": true,  "status": "DUE"},
    {"id": "m2", "name": "Jordan Lee", "share": 900, "you": false, "status": "PAID"}
  ]
}
```

`isShared:false` (or a 404 → mock omits it) hides the Roommates surface for a solo
tenant. Each roommate's `GET /tenants/rent-summary` (§T1) should return **their
share** as `rent.amount`, so Pay/Home already show the right number per person.
Member `status` is each roommate's own payment state — a tenant is never billed
for, nor blocked by, another's.

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

### Tenant (Part B + C)

- [ ] §T1 rent-summary rollup · §T2 pay-rent (RTP) + autopay
- [ ] §T3 payments · §T4 statement · §T5 notifications title/read
- [ ] §T7 repairs read-side (`GET /tenants/repairs`) — submit is live
- [ ] §T8 checklist read + write (deposit baseline)
- [ ] §T9 credit (bureau partner) · §T11 insurance (insurer partner)
- [ ] §T10 deposit read-model · §T12 payment-methods + autopay
- [ ] §T13 flexibility plan (risk sign-off first)

FE will switch off mocks for each section automatically once the BE
endpoint returns 200 with the expected shape. No FE deploy required
on BE delivery.

---

## §T17 — Embedded agreement signing (BoldSign), no email round-trip

**UPDATE (2026-08-03 evening):** product says BoldSign is implemented
end-to-end on the BE and tested. The app's side is now BUILT and waiting
on the contract: `screens/onboarding/AgreementSign.jsx` renders the
embedded link in a WebView, listens for BoldSign's page events and the
redirect, and treats the WEBHOOK-updated server state as the only truth.
To wire it we need from BE: **(a)** the exact endpoint that mints an
embedded signing link for {agreement, current tenant} — the app currently
calls `POST /agreements/{id}/sign-session` expecting
`{embeddedSignLink, expiresAt}`, rename ours or yours; **(b)** the
configured BoldSign `redirectUrl` (app matches
`keystonerent.app/signed|esign-complete`); **(c)** confirmation the
existing email-based flow is disabled for mobile-initiated sessions so
tenants aren't signed twice; **(d)** whether
`PATCH /agreements/{id}/acceptance` is still meaningful post-BoldSign or
fully replaced by the webhook.

**Ask (2026-08-03):** tenant signs the lease INSIDE the app instead of
receiving an email and finishing in a browser. BoldSign supports this
directly via **embedded signing links**, and the mobile side is already
equipped (`react-native-webview` 13.12.2 is a dependency).

Contract we need from BE:

1. `POST /agreements/{id}/sign-session` → creates (or reuses) the
   BoldSign document for that agreement and returns
   `{embeddedSignLink, expiresAt}` for the CURRENT tenant as signer.
   BoldSign API key stays server-side; the app never talks to BoldSign
   with credentials.
2. App renders `embeddedSignLink` in a WebView; BoldSign's
   `redirectUrl` should be something the app can intercept (e.g.
   `https://keystonerent.app/signed?agreement={id}`) so the WebView can
   close itself on completion.
3. **The webhook is the source of truth, not the redirect.** BE consumes
   BoldSign's `Completed`/`Declined` webhooks and flips the agreement's
   e-sign envelope state (the same envelope §7's `renewalStatus` reads).
   The app refetches onboarding/agreement status after the redirect and
   renders whatever the SERVER says — a hijacked or dropped redirect must
   not be able to fake a signed lease.
4. Declined / expired sessions surface as states, not errors, so the
   FE can offer "start signing again".

FE work when this ships: swap the demo "Agree and sign" mutation for the
WebView step (screen already exists as the signature step of the
onboarding journey; `AGREEMENT_SIGNATURE_PENDING` is its waiting state).
