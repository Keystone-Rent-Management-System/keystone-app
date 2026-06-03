# Keystone (formerly Pallax) — mobile migration log

This file tracks the Pallax-era → Keystone US-market rebrand of the
mobile app. The web counterpart is in the `keystone-front` repo; this
doc only covers the mobile side.

> ⚠️ **NOT READY FOR TENANT USE YET.**
> The app builds and the JS layer talks to Keystone DNS, but the auth
> flow needs to be migrated from Pallax `/profile/login` to Keystone's
> Keycloak OAuth before any real tenant can sign in. See the
> **Authentication migration** section below for the plan.

## Status board

| Surface | State |
|---|---|
| **API base URLs** | ✅ Pointed at `api{-dev,-uat,-}.keystonerent.app` |
| **Keycloak host config** | ✅ Constants added (`KEYCLOAK_HOSTS`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`) |
| **Auth flow wired to Keycloak** | 🔴 **Not yet** — still using `POST /profile/login` |
| **Tenant signup endpoint** | 🔴 **Not yet** — still using `POST /profile/tenant` with `NATIONAL_ID` |
| **Theme palette (Keystone navy / gold / cream)** | ✅ |
| **Tailwind tokens (`keystone_navy` etc.)** | ✅ |
| **Pallax string sweep across `src/`** | ✅ |
| **`formatToKES` → `formatToUSD`** | ✅ (alias preserved) |
| **WEB_URL + privacy / about URLs** | ✅ `keystonerent.app` |
| **B70 statement endpoint** | ✅ `/agreements/{id}/statement` |
| **App display name (phone home screen)** | ✅ "Keystone" |
| **Android Gradle namespace / package** | ✅ `com.keystone.app` |
| **Android `MainActivity.kt` / `MainApplication.kt`** | ✅ Moved to `java/com/keystone/app/` |
| **Android splash drawable rename** | ✅ `white_pallax.png` → `white_keystone.png` (binary asset unchanged) |
| **Android deep-link host** | ✅ `keystonerent.app` (Pallax host kept as fallback) |
| **Android app name string** | ✅ "Keystone" |
| **iOS bundle directory** | ✅ `ios/keystone_app/` |
| **iOS Xcode project + workspace + scheme** | ✅ Renamed `keystone_app.*` |
| **iOS `CFBundleDisplayName`** | ✅ "Keystone" |
| **package.json `name` + version bump** | ✅ `keystone_app` @ 1.4.0 |

## What's still blocked (in priority order)

### 🔴 1. Authentication migration to Keycloak — **deploy blocker**

The Pallax app uses `POST /profile/login` with email+password,
returns its own JWT. The Keystone backend uses **Keycloak OAuth** at
`${KEYCLOAK_URL}/realms/keystone/protocol/openid-connect/token`. The
two are completely different auth systems.

Until this is migrated, the app cannot log a real tenant in.

**Plan:**

1. Replace `AuthServices.login()` body with a Keycloak token POST:
   ```
   POST https://auth-{env}.keystonerent.app/realms/keystone/protocol/openid-connect/token
   Content-Type: application/x-www-form-urlencoded
   grant_type=password&username={email}&password={password}&client_id=keystone-mobile
   ```
2. Response shape: `{access_token, refresh_token, expires_in, ...}` — already what the existing zustand `state.auth` slot expects, so downstream consumers compile unchanged.
3. Replace `AuthServices.refreshToken()` body with a Keycloak refresh POST (`grant_type=refresh_token`).
4. Logout: hit Keycloak's `end_session_endpoint` to invalidate the refresh token server-side, mirror the web SPA's `/auth/logout` fallback path.
5. `getProfile()` keeps hitting the BE `/manage-profile/me` once the JWT carries Keycloak claims.

**Outstanding question for BE:** confirm the `keystone-mobile`
Keycloak client exists with the `password` grant enabled, or tell us
the correct client id to use.

### 🔴 2. Tenant signup endpoint — **deploy blocker for new users**

The Pallax flow:
- `POST /profile/email-verification` → OTP to email
- `POST /profile/tenant` → register with `identificationType: 'NATIONAL_ID'`

Neither endpoint exists on the Keystone BE. Also, US identification
types are `DRIVERS_LICENSE | STATE_ID | PASSPORT | SSN_LAST_4`, not
`NATIONAL_ID`.

**Plan:**

1. Wait for BE to publish a tenant-signup contract (the SPA's `/signup` already drives a Keystone-shape signup; the matching endpoint exists for the web flow).
2. Replace `AuthServices.registerTenant()` to hit that endpoint with the US ID types.
3. Update `screens/authentication/SignUp.jsx` form to render the four US ID types in the dropdown.

### 🔴 3. Service files calling dead Pallax endpoints

The audit hasn't traced every call site yet. Known migrations from
the web side (already shipped) that mobile still owes:

- `PlannedActivities` → `PlannedExpense` (web commit `c6ec181`)
- Float / Requisitions / Disbursement workspace → Bills & Payments (web design at `docs/design/expense-cycle-us-redesign.md`)
- The `/utilities` flat-table → Smart Building (web design at `docs/design/smart-building-redesign.md`)

These don't block tenant use (tenants don't see them), but they block
landlord use of the mobile app for anything operator-side.

### 🟡 4. Asset replacements (visual only)

- `android/app/src/main/res/drawable/white_keystone.png` — file is renamed but the **bitmap is still the old Pallax logo**. Designer needs to replace with Keystone wordmark.
- `android/app/src/main/res/mipmap-*/ic_launcher*.png` — app icons. Same.
- `ios/keystone_app/Images.xcassets/AppIcon.appiconset/*.png` — app icons.
- `src/assets/icons/**` — many SVG icons may carry Pallax glyphs.
- `google-services.json` is a Firebase-generated file. The user needs to **create a Keystone Firebase project**, download a fresh `google-services.json`, and replace the current one. Renaming `project_id` inside the JSON does not work — it has to be a real Firebase project that matches the package `com.keystone.app`.
- The Maps API key in `AndroidManifest.xml` (`AIzaSyD1pW9ERP2yCkaLh10oasIp7YmWCBk2sDg`) is the Pallax-era Google Maps key. Generate a new key under the Keystone Google Cloud project before release.

## What's done

### 2026-06-02

- **API DOMAINS** rewired from `gateway-{env}.pallax-ke.com` to `api{-env-}.keystonerent.app`. Added Keycloak host constants (`KEYCLOAK_HOSTS`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `getKeycloakBaseUrl`).
- **Theme** replaced — `keystone_navy` (#152535), `keystone_gold` (#A89977), `keystone_cream` (#E7E5DA), `keystone_stone` (#F4F2EC). Legacy `primary` etc. aliased so existing screens compile without churn.
- **Tailwind** `tailwind.config.js` exposes the Keystone tokens to nativewind so new code can use `bg-keystone_navy` etc.
- **Pallax string sweep**: `Main.jsx` deep-link prefix, `FloatingActionBar.tsx` "Contact Pallax" → "Contact Keystone", `ApartmentView.jsx` share copy + author name, `provider/invoice.js` sample property titles, `constants/index.js` privacy/about URLs + support number, `installing.md` / `changelog.md` / `README.md`.
- **`formatToKES`** retired (alias preserved); new code should import `formatToUSD`.
- **App display name** `Keystone` on phone home screens (both Android string + iOS CFBundleDisplayName).
- **Android package** `com.pallax_app` → `com.keystone.app`. `MainActivity.kt` + `MainApplication.kt` moved + repackaged. Gradle namespace + applicationId updated. `settings.gradle` rootProject. Splash drawable renamed.
- **iOS bundle** `pallax_app` → `keystone_app` across the Xcode project, workspace, scheme, tests, and source files.
- **package.json** `name` → `keystone_app`, version bumped to `1.4.0`.
- **B70 statement migration** (previous session) — switched to `GET /agreements/{id}/statement`. AR sub-ledger projection with running balance.

## Branches

The repo uses the standard Keystone branch layout:

- `dev` — active development. Default target for PRs.
- `uat` — user-acceptance testing. Merged from `dev` weekly or per release.
- `prod` — production tag stream. Merged from `uat` after sign-off.
- `master` — preserved historical Pallax mainline. Frozen.

## Native rebuild reminder

After the package rename you need to:

```sh
cd android && ./gradlew clean
cd ../ios && rm -rf Pods Podfile.lock && pod install
```

before the next dev build, otherwise stale Gradle caches will still
reference `com.pallax_app`.
