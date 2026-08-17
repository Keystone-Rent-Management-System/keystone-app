export enum Environment {
  Dev = 'dev',
  Uat = 'uat',
  Production = 'production',
}

type Domain = {
  [key in Environment]: string;
};

// Keystone Rent Management API gateways. Replaces the pallax-ke.com
// Kenyan infrastructure the app was originally built for.
//
// Local-development override: set DEV_API_HOST to the IP of your dev
// machine (e.g. 192.168.x.y:8085) before launching Metro to talk to a
// BE running on your laptop. Leave unset to hit the dev gateway.
export const DOMAINS: Domain = {
  [Environment.Dev]: 'api-dev.keystonerent.app',
  [Environment.Uat]: 'api-uat.keystonerent.app',
  [Environment.Production]: 'api.keystonerent.app',
};

const SCHEME = 'https';

// The environment every module resolves against. Change this in ONE
// place — AxiosServices pins the gateway base URL from it at boot and
// AuthServices derives the matching Keycloak realm host, so a split
// brain (API on one env, auth on another) is not representable.
//
// Currently Dev, because it is the only environment that exists:
//   api-dev.keystonerent.app   → resolves, gateway answers 401 (live)
//   auth-dev.keystonerent.app  → resolves, `keystone` realm is up
//   api-uat / api / auth-uat   → NXDOMAIN as of 2026-07-29
// Move this to Uat/Production once ops has stood those hosts up; the
// DOMAINS/KEYCLOAK_HOSTS entries below are already correct for them.
export const ACTIVE_ENVIRONMENT: Environment = Environment.Dev;

export const getBaseUrl = (env: Environment = ACTIVE_ENVIRONMENT) => {
  return `${SCHEME}://${DOMAINS[env]}/api/v1/rms`;
};

// Keystone uses Keycloak for OAuth. The realm and client id mirror
// the web SPA's VITE_KEYCLOAK_* env vars. Per-env realms here so the
// app can land an auth payload against the right tenant.
export const KEYCLOAK_HOSTS: Domain = {
  [Environment.Dev]: 'auth-dev.keystonerent.app',
  [Environment.Uat]: 'auth-uat.keystonerent.app',
  [Environment.Production]: 'auth.keystonerent.app',
};

export const KEYCLOAK_REALM = 'keystone';
export const KEYCLOAK_CLIENT_ID = 'keystone-mobile';

export const getKeycloakBaseUrl = (env: Environment = ACTIVE_ENVIRONMENT) =>
  `${SCHEME}://${KEYCLOAK_HOSTS[env]}/realms/${KEYCLOAK_REALM}`;

export const queryRefetchIntervalOptions = {
  queryRefetchInterval: 1000 * 60 * 5,
  queryRefetchIntervalInBackground: true,
};

export const WEB_URL = 'https://keystonerent.app/';
export const SUPPORT_EMAIL = 'support@keystonerent.app';
