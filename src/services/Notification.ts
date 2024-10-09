import AxiosUtility, {setAuthToken} from './AxiosServices';
import {useNotificationStore} from '../provider/store/notification.ts';
import {INotificationsResponse} from '../types/notification.ts';

const notificationStore = useNotificationStore.getState();
/**
 * Registers device token for push notifications
 */
export const registerDeviceToken = async () => {
  // Set the token in the AxiosUtility
  setAuthToken(AxiosUtility);

  // check if token exists
  if (!notificationStore.deviceToken) {
    throw new Error('Notification token required.');
  }

  const {data} = await AxiosUtility.post(
    `/notifications/deviceToken?deviceToken=${notificationStore.deviceToken}`,
  );

  return data;
};

/**
 * Gets all user notifications
 */
export const getNotifications = async (): Promise<INotificationsResponse> => {
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
