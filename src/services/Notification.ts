import AxiosUtility, {setAuthToken} from './AxiosServices';
import {useNotificationStore} from '../provider/store/notification.ts';
import {INotificationsResponse} from '../types/notification.ts';
import {USE_MOBILE_MOCKS, mockTenantNotifications, mockFallback} from './mocks';

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
  if (USE_MOBILE_MOCKS) {
    return mockFallback('notifications', mockTenantNotifications);
  }
  // Set the token in the AxiosUtility
  setAuthToken(AxiosUtility);

  try {
    const {data} = await AxiosUtility.get('/notifications');
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('notifications', mockTenantNotifications);
    }
    throw err;
  }
};

const NotificationService = {
  registerDeviceToken,
  getNotifications,
};

export default NotificationService;
