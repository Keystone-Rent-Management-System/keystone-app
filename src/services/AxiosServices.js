import axios from 'axios';
import {mmkvStorage} from '../provider/store/MMKV';

export const ENDPOINT = 'http://94.156.189.106:8085/api/v1/rms';
// https://uat.pallaxlisting.com

export const AxiosUtility = axios.create({
  baseURL: `${ENDPOINT}`,
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

export default AxiosUtility;
