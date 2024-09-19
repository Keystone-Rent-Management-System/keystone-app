import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Registers device token for push notifications
 */
export const registerDeviceToken = async (token: string) => {
  // Set the token in the AxiosUtility
  setAuthToken(AxiosUtility);

  // check if token exists
  if (!token) {
    throw new Error('Notification token required.');
  }

  const {data} = await AxiosUtility.post('/notifications/deviceToken', {
    deviceToken: token,
  });

  return data;
};

/**
 * Gets all user notifications
 */
