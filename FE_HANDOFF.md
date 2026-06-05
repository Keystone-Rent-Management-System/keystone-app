# FE Handoff — front door + instant/direct money model

**Date:** 2026-06-05
**Branch / PR:** `feat/fe-front-door-instant-direct` → PR #1 (review, not merged)
**For:** mobile FE team

This is where to pick up. It covers what changed, the strategy behind
it, the open threads, and the gotchas that will bite you if you don't
know them.

---

## 1. What shipped (PR #1)

Three connected changes — all verified on the Android emulator.

### a. Dashboard → instant/direct "rent received"
`src/screens/landlord_home/Dashboard.jsx`

Replaced **"Cash available now / Move money"** (a held-balance + payout
model) with **"Rent received this month · Instant · Direct"**, a live
**"+$X today"** chip, and the line *"paid straight to your bank … nothing
to move."*

Direct-pay has **no platform-held balance**, so the payout flow was
removed:
- PaymentZone "Available to payout / Send to bank" strip
  (`src/screens/landlord_home/PaymentZone.jsx`)
- the `payout` route (`src/navigation/landlord/PaymentsStack.jsx`)
- the `Payout` screen export (`src/screens/landlord_home/index.js`)

### b. Front door (Option A) → Welcome replaces the marketplace
`src/screens/authentication/Welcome.jsx` (new) + `src/navigation/Main.jsx`

Unauthenticated cold-open now lands on a branded **Welcome** screen
(value prop + two doors: landlord→signup, tenant→sign in) instead of the
Pallax-era **Explore listings marketplace**. The Explore code is
**parked, not deleted** (reversible).

### c. Login brand polish
`src/screens/authentication/Login.jsx`

Keystone mark + **"Welcome back"** header + "get paid instantly"
subcopy; dropped the bare nav-bar title.

---

## 2. Why (strategy — so you don't undo it by accident)

Keystone is **landlord-first rent protection + instant, direct-to-bank
payments**. Two moats: **instant payments** (the wedge) and **rent
insurance** (market entry). Full critical-path is in the BE repo:
`keystone-rms/docs/decisions/2026-06-05-instant-payments-and-rent-insurance-critical-path.md`.

Consequences for the app:
- **No escrow / held balance** → no "available balance", no "move money",
  no payout screen. Money is already in the landlord's bank.
- **Not a marketplace** → a listings page serves apartment-hunters;
  Keystone's users are landlords (the customer) and their already-leased
  tenants. So the front door sells the wedge and routes those two.

---

## 3. Where to pick up (open FE threads)

### ⚠️ P1 — Dashboard data contract gap (FE ↔ BE)
The mobile dashboard reads a **nested** shape:
`dashboard.today.collected`, `dashboard.month.collected /
.expected / .percentCollected`, `dashboard.today.outstandingUnits`,
`dashboard.portfolio.*`, `dashboard.trend`, `dashboard.recentActivity`.

But the **real BE endpoint** `GET /dashboard/daily-collection` (shipped
as B79) returns a **flat** shape:
`{ expectedRent, billedThisMonth, collectedThisMonth, collectedToday,
outstanding, invoicesPaid, invoicesPartial, invoicesOutstanding,
collectionRatePct }` — **no** `today`/`month`/`portfolio`/`trend`/
`recentActivity` objects.

So today the dashboard only renders fully against the **mock fallback**;
against the live endpoint, most cards are empty/zero. The reshaped
"rent received" card already tolerates both (`?? dashboard?.collectedThisMonth`),
the rest of the dashboard does not.

**Action:** reconcile the contract. Either (a) BE adds the nested rollup
the mobile `BE_ASKS_MOBILE.md §1` originally specified (portfolio,
trend, recentActivity, today/month split), or (b) FE adapts the
dashboard to B79's flat fields. Pick one and align `BE_ASKS_MOBILE.md`.

### P2 — Tenant entry / invite-code flow
The MVP tenant door is **"Sign in"** (works — tenants get an account
when a landlord provisions them). A true **invite-code** flow
(landlord generates code → tenant redeems → tenancy auto-links) is a
**BE + FE** feature, not built yet. When the BE ships invite
generate/redeem endpoints, the tenant door becomes "Enter your invite
code" → onboarding. Until then, "Sign in" is correct.

### P3 — Delete orphaned payout code
Now unused (no longer imported anywhere):
`src/screens/landlord_home/Payout.jsx`, `src/hooks/usePayout.js`,
`src/services/PayoutServices.js`, and the `mockPayoutBalance` fixture in
`src/services/mocks/index.js`. Safe to delete in a sweep.

### P4 — Marketplace decision
The Explore/listings code is parked, not removed. Decision pending
(CEO): fully delete, or keep behind a flag for a future supply-first
marketplace (once landlords' vacant units can auto-list). Don't re-wire
it as the front door.

---

## 4. Gotchas (will bite you)

- **Debug builds embed a committed JS bundle.** The debug variant does
  NOT auto-bundle (`debuggableVariants` default); the APK packages
  `android/app/src/main/assets/index.android.bundle`, which is a
  committed file. **Your JS changes won't appear in a build until you
  regenerate it:**
  ```
  node node_modules/react-native/cli.js bundle --platform android \
    --dev false --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res
  ```
  Worth revisiting this committed-bundle setup — it's surprising.
- **Env:** `src/services/AxiosServices.js` was switched to `Environment.Dev`
  locally for testing — **not** included in PR #1. Decide whether the
  shared branch should default to dev.
- **Dev login:** the seed dev users use a 3-char password (`dev`) which
  the login form rejects (min 6). Real logged-in dev testing needs a
  dev-realm account with a ≥6-char password (BE/dev-ops to seed/reset).
- **Dev-only flags** `USE_MOBILE_MOCKS` / `DEV_FORCE_LANDLORD`
  (`src/services/mocks/index.js`) bypass auth + serve mock data, gated by
  `__DEV__`. They're committed `false`. `DEV_FORCE_LANDLORD=true` + a
  `--dev true` bundle boots straight into the landlord dashboard with
  mock data (how the dashboard was demoed) — handy, never ship `true`.

---

## 5. Run it

Emulator/device must be on the same Wi-Fi as the dev machine if you want
the live dev backend; otherwise the app talks to whatever `BASE_URL`
points at. Standard:
```
npx react-native run-android          # debug + Metro (needs port 8081 free)
```
Note: Docker Adminer also uses 8081 — free it or run Metro on another
port + `adb reverse`.
