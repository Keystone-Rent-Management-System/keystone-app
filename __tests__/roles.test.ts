import {isLandlordProfile, isTenantProfile} from '../src/utils/roles';

// This replaces the stock React Native `renders correctly` test, which
// mounted the entire app (navigation + react-query + native modules),
// asserted nothing, and crashed the Jest worker.
//
// Role resolution is worth real coverage: it decides which of the two
// product surfaces a signed-in user sees, and it has already broken once
// in production-shaped conditions. The app used to test for
// `ROLE_LANDLORD`/`ROLE_TENANT`, but `GET /manage-profile/me` returns raw
// Keycloak realm roles — a landlord comes back as `LANDLORD_OWNER` — so
// every real login resolved to NEITHER surface: no tabs, no home.

const profile = (roles: string[]) => ({access_types: {roles}} as any);

// Exactly what api-dev returned for a freshly registered landlord.
const LIVE_LANDLORD = [
  'offline_access',
  'LANDLORD_OWNER',
  'uma_authorization',
  'default-roles-keystone',
];

describe('role resolution', () => {
  it('resolves the live Keycloak landlord payload', () => {
    expect(isLandlordProfile(profile(LIVE_LANDLORD))).toBe(true);
    expect(isTenantProfile(profile(LIVE_LANDLORD))).toBe(false);
  });

  it('resolves TENANT, the realm role BE confirmed', () => {
    const p = profile(['offline_access', 'TENANT', 'default-roles-keystone']);
    expect(isTenantProfile(p)).toBe(true);
    expect(isLandlordProfile(p)).toBe(false);
  });

  it('still accepts the legacy ROLE_-prefixed spellings', () => {
    expect(isLandlordProfile(profile(['ROLE_LANDLORD']))).toBe(true);
    expect(isTenantProfile(profile(['ROLE_TENANT']))).toBe(true);
  });

  it('accepts other landlord role variants', () => {
    expect(isLandlordProfile(profile(['LANDLORD_MANAGER']))).toBe(true);
  });

  it('ignores Keycloak housekeeping roles', () => {
    const p = profile([
      'offline_access',
      'uma_authorization',
      'default-roles-keystone',
    ]);
    expect(isLandlordProfile(p)).toBe(false);
    expect(isTenantProfile(p)).toBe(false);
  });

  it('does not crash on a missing or empty profile', () => {
    expect(isLandlordProfile(undefined)).toBe(false);
    expect(isTenantProfile(null)).toBe(false);
    expect(isLandlordProfile({} as any)).toBe(false);
    expect(isTenantProfile(profile([]))).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isLandlordProfile(profile(['landlord_owner']))).toBe(true);
    expect(isTenantProfile(profile(['tenant']))).toBe(true);
  });
});
