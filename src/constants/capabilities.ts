// What Keystone can actually do today.
//
// One declared list, replacing a scatter of local `const xAvailable =
// false` flags and, worse, copy that simply asserted a capability with
// nothing behind it. Each round of review kept finding the same class of
// defect in a new screen because there was no single place that said
// which capabilities exist — so every screen decided for itself, and the
// ones nobody had reviewed yet decided wrongly.
//
// A phrase test cannot fix that. It only catches wordings someone has
// already thought of ("instant", "two taps") and misses the next variant
// ("the moment a tenant pays", "Reporting on", "Protected"). These flags
// are the semantic guard: a screen asks whether a capability exists
// rather than being trusted to have honest copy.
//
// RULES
//  · Flip a flag to true only when the whole path works end to end —
//    a real request, a server-confirmed response, and its failure states.
//  · A screen for a false capability must not collect data for it, must
//    not offer an action that implies it, and must not describe it in the
//    present tense.
//  · These are BUILD-TIME facts about the product, not runtime state.
//    Whether a given landlord has insurance is data; whether Keystone
//    offers insurance at all is this.

export type Capability =
  | 'rentPayments'
  | 'autopay'
  | 'paymentMethods'
  | 'identityVerification'
  | 'creditReporting'
  | 'rentInsurance'
  | 'tenantScreening'
  | 'conditionRecords'
  | 'complianceNotices'
  | 'notificationPreferences'
  | 'tenantSelfRegistration';

export const CAPABILITIES: Record<Capability, boolean> = {
  // Settlement (BE §T2) has not shipped. Nothing can move money.
  rentPayments: false,

  // Needs rentPayments plus a stored NACHA mandate (§T12).
  autopay: false,

  // Adding a funding source needs Dwolla ToS + KYC + Plaid (§T12).
  paymentMethods: false,

  // Dwolla customer verification (§T12).
  identityVerification: false,

  // No furnisher, no bureau relationship (§T9).
  creditReporting: false,

  // BE answers 501; no insurer partner (§8 / §T11).
  rentInsurance: false,

  // No screening provider, and the FCRA authorization and
  // adverse-action sequence need counsel before anything is built.
  tenantScreening: false,

  // §T8 ships item completion only — no stored photos, no locked
  // diffable baseline, so a condition record cannot be kept.
  conditionRecords: false,

  // No drafting or dispatch endpoint; deadlines are tracked only.
  complianceNotices: false,

  // Wired: PATCH /tenants/notification-preferences (§T15), optimistic
  // with revert on failure.
  notificationPreferences: true,

  // §T16 makes Keystone provisioned-only. `POST /profile/tenant`
  // returns 422 for every input; tenants claim an invite instead.
  tenantSelfRegistration: false,
};

// ─────────────────────────────────────────────────────────────────────
// DEMO CAPABILITIES — simulation only, and quarantined twice over.
//
// These exist so the product can be WALKED end to end before the
// backends exist: an invite accepted, an identity check, rent paid, a
// receipt, a repair. Judging how something feels requires experiencing
// it, and no amount of empty states substitutes for that.
//
// They are the exact opposite of what the list above is for, so the
// containment matters more than the feature:
//
//   1. `__DEV__` — stripped from any release build.
//   2. Fixtures mode — the data source must be set to Fixtures, so even
//      a debug build pointed at the real backend behaves honestly.
//
// BOTH must hold. `USE_MOBILE_MOCKS` is a LIVE binding (see
// services/mocks), so this is re-read on every call rather than captured
// once — flipping the source control turns the simulation off mid-session
// with no relaunch.
//
// Nothing here is a claim about the product. A demo build must never be
// put in front of someone who could mistake it for the real thing.
const DEMO_CAPABILITIES: Partial<Record<Capability, boolean>> = {
  rentPayments: true,
  paymentMethods: true,
  identityVerification: true,
  tenantScreening: true,
  conditionRecords: true,
};

export const isDemoMode = (): boolean => {
  if (!__DEV__) return false;
  // Required lazily: services/mocks pulls in the store layer, and a
  // top-level import here would make this module part of that cycle.
  // eslint-disable-next-line global-require
  const {USE_MOBILE_MOCKS} = require('../services/mocks');
  return USE_MOBILE_MOCKS === true;
};

export const can = (capability: Capability): boolean => {
  if (CAPABILITIES[capability] === true) return true;
  if (isDemoMode() && DEMO_CAPABILITIES[capability] === true) return true;
  return false;
};

export default CAPABILITIES;
