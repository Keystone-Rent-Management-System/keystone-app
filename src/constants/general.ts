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

export const getBaseUrl = (env: Environment = Environment.Uat) => {
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

export const getKeycloakBaseUrl = (env: Environment = Environment.Uat) =>
  `${SCHEME}://${KEYCLOAK_HOSTS[env]}/realms/${KEYCLOAK_REALM}`;

export const queryRefetchIntervalOptions = {
  queryRefetchInterval: 1000 * 60 * 5,
  queryRefetchIntervalInBackground: true,
};

export const WEB_URL = 'https://keystonerent.app/';
export const SUPPORT_EMAIL = 'support@keystonerent.app';
