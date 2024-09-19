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
export const getNotifications = async () => {
  // Set the token in the AxiosUtility
  setAuthToken(AxiosUtility);

  const {data} = await AxiosUtility.get('/notifications');

  return data;
};

const NotificationService = {
  registerDeviceToken,
  getNotifications,
};

export default NotificationService;
