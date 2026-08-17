import axios from 'axios';
import {
  getAccessToken,
  loadRefreshToken,
  persistSession,
} from '../provider/store/secureAuth';
import useAuthSession, {
  endSession,
  SIGNED_OUT,
} from '../provider/store/authSession';
import useGlobals from '../provider/store/useGlobals';
import {ACTIVE_ENVIRONMENT, getBaseUrl} from '../constants/general';

export const BASE_URL = getBaseUrl(ACTIVE_ENVIRONMENT);

export const AxiosUtility = axios.create({
  baseURL: `${BASE_URL}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ONE OWNER FOR THE SESSION.
//
// Attachment, refresh, replay and failure handling all live in this file
// and nowhere else. There were previously three participants: this
// interceptor, a `setAuthToken(instance)` helper called by hand at ~42
// service call sites, and a second response interceptor installed by a
// `useRefreshToken` hook that re-registered on every render of the tab
// navigator. They disagreed. `setAuthToken` read the access token out of
// the plaintext MMKV blob, which stopped holding one when sessions moved
// to the secure store — so it was quietly clearing the header it was
// supposed to be setting. The hook's interceptor tore the session down on
// any 401 while this one was still trying to refresh through it. With
// concurrent 401s the two produced competing auth transitions, and which
// one won depended on interceptor registration order.

const AUTH_ENDPOINTS = [
  // Keycloak's own token endpoint — used for BOTH the password grant
  // (sign-in) and the refresh grant. A 401 from here is an answer, not a
  // reason to refresh: refreshing through the refresh call is the loop
  // this list exists to prevent.
  '/protocol/openid-connect/token',
  '/protocol/openid-connect/logout',
  // Legacy Pallax sign-in, still reachable on the gateway.
  '/profile/login',
];

const isAuthEndpoint = url => AUTH_ENDPOINTS.some(path => url.includes(path));

// REQUEST: attach the bearer.
//
// Read from the secure store's in-memory access token, which is the only
// live copy — not from `defaults.headers.common`, which persisted across
// sign-out, and not from MMKV, which no longer holds tokens at all.
AxiosUtility.interceptors.request.use(config => {
  const url = config.url || '';
  config.headers = config.headers || {};

  if (isAuthEndpoint(url)) {
    // A sign-in or refresh must never carry the session it is trying to
    // replace. Sending an expired bearer to Keycloak's token endpoint is
    // how a bad access token turns a valid refresh into a 401.
    delete config.headers.Authorization;
    return config;
  }

  // An explicitly-supplied header wins: the post-sign-in profile fetch
  // passes the token it just received, before the store has it.
  if (config.headers.Authorization) return config;

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh, expressed as a SHARED PROMISE rather than a
// queue flushed by side effect.
//
// The queue version had a race that hung requests forever: a request that
// 401'd and saw `isRefreshing === true` pushed itself onto `pendingQueue`
// and returned a promise that only ever settled from `flushQueue`. But
// `flushQueue` ran inside the refresh's catch/then, and `isRefreshing`
// was not cleared until the `finally` immediately after — so anything
// enqueued in that window was never flushed and its promise never
// settled. React Query sat on `fetchStatus: 'fetching'` indefinitely and
// the screen showed a loading spinner with no timeout and no error.
//
// Awaiting one shared promise removes the window entirely: late arrivals
// await a promise that is either still pending or already settled, and
// `.finally` clears it only after every awaiter has been resolved.
let refreshPromise = null;

const runRefresh = async () => {
  // The refresh token comes from the secure store (memory, then
  // Keychain), not from the zustand mirror — on a cold start the mirror
  // is empty by design and only the secure store knows anything.
  const refreshTkn = await loadRefreshToken();
  if (!refreshTkn) {
    throw new Error('No refresh token available');
  }

  // Lazily required: AuthServices imports this module, and resolving that
  // cycle at module-evaluation time leaves one side undefined.
  const AuthServices = require('./AuthServices').default;

  const response = await AuthServices.refreshToken(refreshTkn);
  if (!response?.access_token) {
    throw new Error('Keycloak refresh did not return access_token');
  }

  // Write the new pair through the secure store FIRST, and await it.
  // Keycloak rotates refresh tokens: if we replay the queued requests
  // before the rotated token is durable and the process dies in between,
  // the stored token is one that has already been spent and the next
  // launch cannot recover the session.
  //
  // The result is CARRIED, not discarded. A false here means the rotated
  // token is memory-only: requests will keep working for this process,
  // but the claim "durable before replay" is false for this session and
  // the app must not go on implying otherwise.
  const persisted = await persistSession(response);
  useGlobals.getState().updateAuth(response);
  // THE WRITE RESULT, AND NOTHING ELSE.
  //
  // This briefly read `persisted || !hasSecureStore()` — "memory-only is
  // fine when there is no secure store" — and I nearly made it worse by
  // substituting an operational probe, which would have suppressed the
  // warning in precisely the case that exposed the missing keychain
  // entitlement: the probe fails for the same reason the write does, so
  // "the store is broken" would have been reclassified as "there is no
  // store, so this is expected".
  //
  // The user-facing fact does not depend on the cause. If the refresh
  // token is not durably stored, the session will not survive a relaunch,
  // and they should be told — whether the module is missing, unentitled,
  // or simply refusing writes.
  useAuthSession.getState().markAuthenticated({persisted});

  return response.access_token;
};

/**
 * Bring the session up on launch, or confirm there isn't one.
 *
 * Shares the single-flight promise with the 401 path, so a request that
 * races the bootstrap does not start a second refresh.
 */
export const ensureFreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// RESPONSE: refresh once, replay once, otherwise sign out.
AxiosUtility.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Keycloak's token endpoint itself can 401 (wrong password, disabled
    // user, spent refresh token). Don't try to refresh through it.
    if (isAuthEndpoint(originalRequest.url || '')) {
      return Promise.reject(error);
    }

    if (error?.response?.status !== 401) {
      return Promise.reject(error);
    }

    // AT MOST ONE RETRY PER REQUEST. If a request has already been
    // replayed with a fresh token and 401s again, the token is not the
    // problem — this is an authorisation failure, and retrying it a
    // second time only produces a request storm against an endpoint that
    // has already refused us twice.
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      const token = await ensureFreshSession();
      // Attach the NEW token before replaying. The config object carries
      // the stale header from the original attempt; replaying it
      // unmodified re-sends the token that just 401'd.
      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${token}`,
      };
      return await AxiosUtility(originalRequest);
    } catch (refreshError) {
      // Tagged: a failed refresh rejects with a BARE Error (no
      // `.response`), so the services' "endpoint unavailable" test would
      // otherwise read it as an offline blip and quietly serve fixture
      // data — an expired session would look like a working screen full
      // of someone else's numbers.
      refreshError.isAuthFailure = true;

      // Clear memory AND secure storage, then move the gate to
      // `signedOut`. Guarded on the current state because this path is
      // reached by every in-flight request when a session dies: without
      // it, N concurrent 401s each fire a native Keychain delete and N
      // store writes, which re-render the navigator, remount the screen,
      // start a fresh query, fail again — a loop that keeps the screen on
      // its loading state indefinitely.
      if (useAuthSession.getState().status !== SIGNED_OUT) {
        await endSession().catch(() => {
          // The gate is already `signedOut` with `secureWipeFailed` set;
          // surfacing the original request failure matters more here.
        });
      }
      return Promise.reject(refreshError);
    }
  },
);

export default AxiosUtility;
