import axios from 'axios';
import {mmkvStorage} from '../provider/store/MMKV';
import useGlobals from '../provider/store/useGlobals';
import AuthServices from './AuthServices';
import {Environment, getBaseUrl} from '../constants/general';

export const BASE_URL = getBaseUrl(Environment.Dev);

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

/**
 * Axios interceptor for refreshing token
 */
AxiosUtility.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Check if the URL includes '/login'
    if (originalRequest.url.includes('login')) {
      console.log(originalRequest.url);
      return Promise.reject(error);
    }

    // check if error is 401 and request has not been retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Get refresh token from zustand global state
      const refreshToken = globalState.state.auth.refresh_token;

      try {
        // request for new access token using refresh token
        const response = await AuthServices.refreshToken(refreshToken); //access_token:"",refresh_token:""

        if (!response.access_token) {
          return Promise.reject(error);
        }

        // update global state with new auth data(access_token, refresh_token)
        globalState.updateAuth(response);

        // set new access token to axios instance
        AxiosUtility.defaults.headers.common.Authorization = `Bearer ${response.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;

        return AxiosUtility(originalRequest);
      } catch (refreshError) {
        globalState.resetState();
        return Promise.reject(refreshError);
      }
    } else if (error.response.status === 401 && originalRequest._retry) {
      //   destroy session
      globalState.resetState();
    }
    return Promise.reject(error);
  },
);

export default AxiosUtility;
