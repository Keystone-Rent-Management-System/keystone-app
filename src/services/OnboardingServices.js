import AxiosUtility from './AxiosServices';
import {blockedInFixtureMode} from './fixtureGuard';
import {isEndpointUnavailable} from './unavailable';
import {USE_MOBILE_MOCKS} from './mocks';
import {villaOnboarding} from './mocks/villa';
import {useDemoOnboardingStore} from '../provider/store/demoOnboarding';

// Tenant onboarding — invitation → about you → screening → landlord
// decision → agreement → onboarded.
//
// NO BACKEND EXISTS FOR ANY OF THIS. There is no onboarding rollup, no
// screening request, no landlord-decision endpoint and no signature
// capture. The whole journey is therefore a DEMO: it renders from the
// VILLA_5_TENANTS fixture family and only in Fixtures mode.
//
// In a live build `getStatus` deliberately fails rather than inventing a
// state. That matters more here than anywhere else in the app — a
// fabricated "approved" or "signed" would tell someone they had a home.

const getStatus = async () => {
  if (USE_MOBILE_MOCKS) {
    const demoState = useDemoOnboardingStore.getState().state;
    return villaOnboarding(demoState);
  }
  // Live: ask, and let the failure surface. No fixture fallback.
  const {data} = await AxiosUtility.get('/tenants/onboarding');
  return data;
};

/**
 * Record the applicant's screening authorization.
 *
 * Demo only, and it stays that way until counsel signs off. Written
 * authorization and permissible purpose under the FCRA, plus the
 * adverse-action sequence, are legal design work — not something to
 * approximate in a fixture. In Fixtures mode this advances the demo
 * state and stores nothing; in a live build it fails loudly.
 */
const giveScreeningConsent = async () => {
  const blocked = blockedInFixtureMode('POST /tenants/screening/consent');
  if (blocked) {
    useDemoOnboardingStore.getState().setState('SCREENING_IN_PROGRESS');
    return blocked;
  }
  const {data} = await AxiosUtility.post('/tenants/screening/consent');
  return data;
};

/** Submit the applicant's own details. Demo only — see above. */
const submitAboutYou = async payload => {
  const blocked = blockedInFixtureMode('POST /tenants/onboarding/about-you');
  if (blocked) {
    // Identity (ID photo + SSN) comes BEFORE consent: the check cannot
    // run without documents, so asking permission first would be asking
    // the applicant to authorize a check we cannot start.
    useDemoOnboardingStore.getState().setState('IDENTITY_REQUIRED');
    return blocked;
  }
  const {data} = await AxiosUtility.post(
    '/tenants/onboarding/about-you',
    payload,
  );
  return data;
};

/**
 * Mint an embedded BoldSign signing session for this agreement + the
 * current tenant. Live only — in Fixtures mode there is no BoldSign
 * document, so this returns null and the signing screen renders its
 * labelled demo ceremony instead. Expected live shape (§T17, pending
 * BE confirmation of the exact path/field names):
 *   POST /agreements/{id}/sign-session → {embeddedSignLink, expiresAt}
 */
const createSignSession = async agreementId => {
  if (USE_MOBILE_MOCKS) return null;
  const {data} = await AxiosUtility.post(
    `/agreements/${agreementId}/sign-session`,
  );
  return data;
};

/**
 * Sign the agreement. Only reachable once the landlord has approved —
 * the agreement object is absent from every earlier state, so there is
 * nothing to sign until then.
 */
const signAgreement = async agreementId => {
  const blocked = blockedInFixtureMode(
    `PATCH /agreements/${agreementId}/acceptance`,
  );
  if (blocked) {
    useDemoOnboardingStore.getState().setState('ONBOARDED');
    return blocked;
  }
  const {data} = await AxiosUtility.patch(`/agreements/${agreementId}/acceptance`);
  return data;
};

/**
 * Whether the tenant tabs may be shown yet.
 * Anything other than a confirmed ONBOARDED keeps them hidden — an
 * unknown state is not an onboarded one.
 */
const isOnboarded = status => status?.state === 'ONBOARDED';

const OnboardingServices = {
  getStatus,
  giveScreeningConsent,
  submitAboutYou,
  createSignSession,
  signAgreement,
  isOnboarded,
  isEndpointUnavailable,
};

export default OnboardingServices;
