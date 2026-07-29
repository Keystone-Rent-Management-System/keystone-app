import axios from 'axios';
import AxiosUtility, {setAuthToken, BASE_URL} from './AxiosServices';
import {
  Environment,
  KEYCLOAK_CLIENT_ID,
  getKeycloakBaseUrl,
} from '../constants/general';
import {USE_MOBILE_MOCKS, mockFallback, mockProfile} from './mocks';

// Keystone uses Keycloak for OAuth. Mobile previously POSTed to
// /profile/login which returned a Pallax-issued JWT; the Keystone BE
// doesn't expose that endpoint. We now talk to Keycloak's token
// endpoint directly using the Resource Owner Password Credentials
// grant ("password grant") — same flow the web SPA uses.
//
// The Keycloak `keystone-mobile` client must be configured with
// "Direct Access Grants Enabled" = ON. Confirm with BE before
// shipping to prod.

const tokenEndpoint = (env = Environment.Uat) =>
  `${getKeycloakBaseUrl(env)}/protocol/openid-connect/token`;

const logoutEndpoint = (env = Environment.Uat) =>
  `${getKeycloakBaseUrl(env)}/protocol/openid-connect/logout`;

// The env the mobile app talks to is tied to the BASE_URL the
// AxiosServices module pins at boot. Derive Keycloak's env from
// whatever BASE_URL contains so we never split-brain.
const inferEnv = () => {
  if (BASE_URL.includes('api-dev.')) return Environment.Dev;
  if (BASE_URL.includes('api-uat.')) return Environment.Uat;
  return Environment.Production;
};

const formEncode = body =>
  Object.entries(body)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

/**
 * Sign in via Keycloak — Resource Owner Password Credentials grant.
 * Returns the Keycloak token payload; same `access_token` /
 * `refresh_token` keys the legacy /profile/login returned, so
 * useLogin and friends don't need to change.
 * @param {{email: string, password: string}} data
 */
const login = async data => {
  const body = formEncode({
    grant_type: 'password',
    client_id: KEYCLOAK_CLIENT_ID,
    username: data?.email ?? data?.username,
    password: data?.password,
  });
  const {data: res} = await axios.post(tokenEndpoint(inferEnv()), body, {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  });
  return res;
};

/**
 * Refresh the access token. Keycloak rotates refresh tokens by
 * default — the response carries a new refresh_token; callers must
 * persist it (the existing useGlobals.updateAuth shape already does).
 */
const refreshToken = async refreshTkn => {
  const body = formEncode({
    grant_type: 'refresh_token',
    client_id: KEYCLOAK_CLIENT_ID,
    refresh_token: refreshTkn,
  });
  const {data: res} = await axios.post(tokenEndpoint(inferEnv()), body, {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  });
  return res;
};

/**
 * End the Keycloak session. The refresh token has to be sent so
 * Keycloak invalidates it server-side; otherwise it stays valid
 * until natural expiry. Mirrors the web SPA's logout path.
 */
const logout = async refreshTkn => {
  if (!refreshTkn) return;
  const body = formEncode({
    client_id: KEYCLOAK_CLIENT_ID,
    refresh_token: refreshTkn,
  });
  await axios
    .post(logoutEndpoint(inferEnv()), body, {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    })
    .catch(err => {
      // Don't block the local logout on a Keycloak hiccup — the
      // mobile state reset is what users actually feel.
      console.warn(
        '[auth] keycloak logout failed (non-blocking):',
        err?.response?.status,
      );
    });
};

// --- Signup + password-recovery -----------------------------------
//
// These still talk to the Keystone BE, NOT to Keycloak directly.
// The BE owns the JIT provisioning path (Keycloak user + Users-table
// row) — same pattern as PR #80 §1.6 on the web side. Endpoint
// shapes match the web `/profile/landlord` and `/profile/email-
// verification` contracts; for tenants we expect a parallel
// `/profile/tenant` once BE publishes it. Until then, signup will
// 404 cleanly and the UI surfaces a friendly error.

/** Verifies registering tenant's email — sends an OTP. */
const verifyRegisteringEmail = async data => {
  const {data: res} = await AxiosUtility.post(
    '/profile/email-verification',
    data,
  );
  return res;
};

/**
 * Register a tenant. US identification types:
 *   DRIVERS_LICENSE | STATE_ID | PASSPORT | SSN_LAST_4
 * (replaces the Pallax NATIONAL_ID; mobile signup screen needs to
 * render the new dropdown — tracked in MIGRATION.md).
 */
const registerTenant = async data => {
  const {data: res} = await AxiosUtility.post('/profile/tenant', data);
  return res;
};

/** Request password-reset OTP. */
const getResetPasswordToken = async data => {
  const {data: res} = await AxiosUtility.post(
    '/profile/reset-password-token',
    data,
  );
  return res;
};

/** Finalize password reset with the OTP + new password. */
const resetPassword = async data => {
  const {data: res} = await AxiosUtility.put('/profile/reset-password', data);
  return res;
};

/** Read the authenticated user's profile from the BE. */
const getProfile = async token => {
  if (USE_MOBILE_MOCKS) return mockFallback('auth.profile', mockProfile);
  setAuthToken(AxiosUtility);
  const headers = token ? {Authorization: `Bearer ${token}`} : {};
  const {data: res} = await AxiosUtility.get('/manage-profile/me', {headers});
  return res;
};

/** Change the currently-signed-in user's password. */
const updateUserPassword = async data => {
  const {data: res} = await AxiosUtility.put(
    '/manage-profile/change-password',
    data,
  );
  return res;
};

const AuthServices = {
  verifyRegisteringEmail,
  registerTenant,
  login,
  logout,
  getResetPasswordToken,
  resetPassword,
  getProfile,
  updateUserPassword,
  refreshToken,
};

export default AuthServices;
