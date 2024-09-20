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
  console.log('TOKEN ISS REGISTERED', notificationStore.deviceToken);
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
// return new Promise<INotificationsResponse>(resolve => {
//     setTimeout(() => {
//       resolve({
//         data: [
//           {
//             id: 'f157c0d9-ff1a-47c6-ae0f-5337cca04fd6',
//             createdAt: '2024-09-19 20:19:40',
//             updatedAt: '2024-09-19 20:19:40',
//             userId: 'ad186f1d-0f03-4776-a42f-9a2dbca6ed27',
//             notificationType: 'Test',
//             read: false,
//             message: 'Test',
//           },
//           {
//             id: '6e23aaba-7bf1-40a4-9c4a-7d0db4485a52',
//             createdAt: '2024-09-19 20:21:52',
//             updatedAt: '2024-09-19 20:21:52',
//             userId: 'ad186f1d-0f03-4776-a42f-9a2dbca6ed27',
//             notificationType: 'Test',
//             read: false,
//             message: 'Test',
//           },
//           {
//             id: '9f335e3c-e74b-4a47-b627-f83952fc6892',
//             createdAt: '2024-09-19 20:22:00',
//             updatedAt: '2024-09-19 20:22:00',
//             userId: 'ad186f1d-0f03-4776-a42f-9a2dbca6ed27',
//             notificationType: 'Test',
//             read: true,
//             message: 'Test',
//           },
//         ],
//         page: 0,
//         totalPages: 1,
//         size: 20,
//       });
//     }, 2000);
//   });
