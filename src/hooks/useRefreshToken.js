import AxiosUtility from '../services/AxiosServices';
import useGlobals from '../provider/store/useGlobals';
import {useEffect} from 'react';

export const useRefreshToken = () => {
  const {resetState} = useGlobals(data => data);

  useEffect(() => {
    const refresh = async () => {
      AxiosUtility.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            resetState();
          }
          return Promise.reject(error);
        },
      );
    };

    refresh();
  }, [resetState]);
};
