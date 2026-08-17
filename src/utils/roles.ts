import type {Profile} from '../types/auth';

// Role resolution for the signed-in profile.
//
// The app used to test `roles.includes('ROLE_LANDLORD')` — a Pallax-era
// Spring convention. The Keystone BE surfaces Keycloak REALM roles
// verbatim through `GET /manage-profile/me`, and those are not prefixed.
// A freshly-registered landlord comes back as:
//
//   ["offline_access", "LANDLORD_OWNER", "uma_authorization",
//    "default-roles-keystone"]
//
// so the old exact-match test failed for BOTH roles and the app resolved
// to neither product surface — no tabs, no home. (Verified against
// api-dev on 2026-07-29.)
//
// We match on the meaningful substring instead of an exact string, which
// tolerates the whole family — ROLE_LANDLORD, LANDLORD_OWNER,
// LANDLORD_MANAGER, ROLE_TENANT, TENANT — and naturally ignores the
// Keycloak housekeeping roles (offline_access, uma_authorization,
// default-roles-*). Substring matching is safe here because no
// housekeeping role contains "landlord" or "tenant".

const has = (roles: string[] | undefined, needle: string) =>
  !!roles?.some(role => String(role).toUpperCase().includes(needle));

export const rolesOf = (profile?: Profile | null): string[] =>
  profile?.access_types?.roles ?? [];

export const isLandlordProfile = (profile?: Profile | null) =>
  has(rolesOf(profile), 'LANDLORD');

export const isTenantProfile = (profile?: Profile | null) =>
  has(rolesOf(profile), 'TENANT');
