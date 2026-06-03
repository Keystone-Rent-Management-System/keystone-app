# Keystone (formerly Pallax) — mobile migration log

This file tracks the Pallax-era → Keystone US-market rebrand of the
mobile app. The web counterpart is in the `keystone-front` repo; this
doc only covers the mobile side.

## What landed in 2026-06-02

### Rebrand surface

| Was | Is | Notes |
|---|---|---|
| `displayName: "pallax_app"` | `displayName: "Keystone"` | Phone home-screen label updated. Native module `name` stays `pallax_app` until we do a proper RN rename pass (AndroidManifest + iOS bundle ID + Gradle namespace), tracked below. |
| `formatToKES` (KES, `en-KE` locale) | `formatToUSD` (USD, `en-US`) under both names | All ~50 callsites of `formatToKES` now produce US dollar formatting. New screens should import `formatToUSD` directly. |
| `"BLESKET KE LIMITED"` (statement PDF header) | `"Keystone Rent Management"` | Tenant statement PDF + landlord statement PDF. |

### B70 — tenant statement now reads the AR sub-ledger

`src/services/StatementServices.ts` was hitting the legacy
`/statements/tenantStatements`, `/statements/currentStatement`, and
`/statements/tenant/filter` endpoints. Those front the Pallax-era
`Statement` POJO with no schema backing — empty in practice.

Switched to the GAAP-correct AR projection at
`GET /agreements/{id}/statement?from=&to=`. Returns one payload with
opening / closing balance, totals, and one row per AR-hitting
journal-entry leg with a running balance — same shape Yardi /
AppFolio / Buildium render. Mirrors web commit `a69248b`.

Existing screens keep working through a back-compat adapter that maps
the new `entries[]` into the legacy `IFlattendenedStatement[]` shape.
New screens should read the AR fields directly (`openingBalance`,
`closingBalance`, `totalCharges`, `totalCredits`).

## What's still pending (next sessions)

These are the gaps between mobile and the web product the user wants
brought to parity. Sequenced by ROI:

### Tenant-side (highest priority — mobile is tenant-first)

- [ ] `home.jsx` hero card — pull `closingBalance` directly and show
      "Tenant credit: $X" when negative, mirroring the web
      `AgreementStatistics` polish.
- [ ] `Statements.jsx` — replace the legacy transaction list with the
      AR-projection columns (Date / Description / Source / Charges /
      Credits / Running Balance) once the basic migration ships
      cleanly through QA.
- [ ] Recent activity feed (per agreement) — mirrors the web
      `TenantOverview` synthesized feed (inspections + move-in tasks
      + lease start), then swaps to BE's real `/activity` endpoint
      once it lands.

### Landlord-side (mobile-light)

- [ ] **Bills & Payments**: new tab in landlord nav that mirrors the
      web Bills + Pay Bills surfaces. BE ask drafted in
      `docs/design/expense-cycle-us-redesign.md` (web repo); when BE
      ships `/bills` + `/payments`, mobile lights up too.
- [ ] **Smart Building**: integrations + devices. Lower priority for
      mobile since operators usually configure on the web. v2.
- [ ] **Planned Expense** lifecycle (DRAFT → APPROVED → FUNDED →
      COMPLETED) — mirror the web migration from `/planned-activities`
      to `/planned-expenses`.

### Native rebrand follow-ups

- [ ] Rename Android Gradle namespace `com.pallax_app` →
      `com.keystone.app` (touches `android/app/build.gradle` +
      package directories).
- [ ] Rename iOS bundle ID `com.pallax_app` → `com.keystone.app`
      (Xcode project + Info.plist).
- [ ] App icon assets in `android/app/src/main/res/mipmap-*` and
      `ios/.../Images.xcassets/AppIcon.appiconset/`.

### Branches

The repo now uses the standard Keystone branch layout:

- `dev` — active development. Default target for PRs.
- `uat` — user-acceptance testing. Merged from `dev` weekly or
  per release.
- `prod` — production tag stream. Merged from `uat` after sign-off.

`master` is preserved temporarily for migration safety but should be
considered frozen; cut from `dev` going forward.
