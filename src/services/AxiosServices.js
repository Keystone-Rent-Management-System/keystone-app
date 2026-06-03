import axios from 'axios';
import {mmkvStorage} from '../provider/store/MMKV';
import useGlobals from '../provider/store/useGlobals';
import AuthServices from './AuthServices';
import {Environment, getBaseUrl} from '../constants/general';

export const BASE_URL = getBaseUrl(Environment.Uat);

export const AxiosUtility = axios.create({
  baseURL: `${BASE_URL}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = instance => {
  const storeData = mmkvStorage.getString('_state_auth');
  const stateData = storeData ? JSON.parse(storeData) : null;

  if (stateData?.state?.state?.auth?.access_token) {
    instance.defaults.headers.common.Authorization = `Bearer ${stateData?.state?.state?.auth?.access_token}`;
  } else {
    delete instance.defaults.headers.common.Authorization;
  }
};

const globalState = useGlobals.getState();

// Token-refresh interceptor. Keycloak access tokens are short-lived
// (5 min by default); the refresh token is what we exchange for a
// new pair when a request 401s. Single-flight protects against a
// thundering herd if N requests 401 in the same tick — we kick off
// one refresh, queue the rest, and replay every queued request with
// the new bearer when the refresh resolves.
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({resolve, reject}) =>
    error ? reject(error) : resolve(token),
  );
  pendingQueue = [];
};

AxiosUtility.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Keycloak's token endpoint itself can 401 (wrong password,
    // disabled user). Don't try to refresh through it.
    const url = originalRequest.url || '';
    if (
      url.includes('/openid-connect/token') ||
      url.includes('/openid-connect/logout') ||
      url.includes('/profile/login')
    ) {
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Another request is already refreshing — wait for it.
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(AxiosUtility(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshTkn = useGlobals.getState().state.auth.refresh_token;
        if (!refreshTkn) {
          throw new Error('No refresh token in store');
        }
        const response = await AuthServices.refreshToken(refreshTkn);
        if (!response?.access_token) {
          throw new Error('Keycloak refresh did not return access_token');
        }
        // Persist the new (rotated) tokens to the global store.
        globalState.updateAuth(response);

        // Replay the original request + any pending ones.
        AxiosUtility.defaults.headers.common.Authorization = `Bearer ${response.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
        flushQueue(null, response.access_token);
        return AxiosUtility(originalRequest);
      } catch (refreshError) {
        // Refresh failed — wipe the auth state. The screen-level
        // navigation guard sends the user back to /login.
        flushQueue(refreshError, null);
        globalState.resetState();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default AxiosUtility;
