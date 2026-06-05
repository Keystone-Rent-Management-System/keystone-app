import {useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {useNotificationStore} from '../../provider/store/notification';
import {useQueryClient} from '@tanstack/react-query';

const checkApplicationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    } catch (error) {}
  }
};

// FCM channel constants. Distinct channels per event-type so the OS
// can show "Rent Received" with a heads-up bubble while normal
// notifications stay in the tray.
const CHANNEL = {
  PAYMENT: 'keystone-payment',
  GENERAL: 'keystone-general',
};

const ensureChannels = () => {
  PushNotification.createChannel(
    {
      channelId: CHANNEL.PAYMENT,
      channelName: 'Rent payments',
      channelDescription: 'Push when a tenant pays — the M-Pesa moment.',
      importance: 4, // heads-up
      vibrate: true,
    },
    () => {},
  );
  PushNotification.createChannel(
    {
      channelId: CHANNEL.GENERAL,
      channelName: 'General',
      channelDescription: 'Other Keystone notifications.',
      importance: 4,
      vibrate: true,
    },
    () => {},
  );
};

// Notification payload contract (BE_ASKS_MOBILE §2):
//   {
//     type: "PAYMENT_RECEIVED" | "GENERAL" | ...,
//     title: string,
//     message: string,
//     data: {
//       amount?: number,
//       unitName?: string,
//       tenantName?: string,
//       bankLast4?: string,
//       ...
//     }
//   }
const RemoteNotification = () => {
  const {deviceToken, saveDeviceToken} = useNotificationStore();
  const qc = useQueryClient();

  useEffect(() => {
    checkApplicationPermission().then();
    ensureChannels();

    PushNotification.configure({
      onRegister: token => {
        if (deviceToken !== token.token) {
          saveDeviceToken(token.token);
        }
      },

      onNotification: notification => {
        const data = notification?.data ?? {};
        const evt = data.type ?? notification?.userInfo?.type ?? 'GENERAL';

        // Payment-received gets the special rent-received card style.
        // The shape mirrors the user's spec:
        //   "🏠 Rent Received
        //    Unit 4B — James Otieno
        //    $1,800.00
        //    Now in Chase ****4821"
        if (evt === 'PAYMENT_RECEIVED') {
          const amount = data.amount ? `$${Number(data.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '';
          const unit = data.unitName ?? '';
          const tenant = data.tenantName ?? '';
          const bank = data.bankLast4 ? `Now in ${data.bankName ?? ''} ****${data.bankLast4}` : '';
          PushNotification.localNotification({
            channelId: CHANNEL.PAYMENT,
            title: '🏠  Rent Received',
            message: [unit && tenant ? `${unit} — ${tenant}` : unit || tenant, amount, bank]
              .filter(Boolean)
              .join('\n'),
            bigText: [unit && tenant ? `${unit} — ${tenant}` : unit || tenant, amount, bank]
              .filter(Boolean)
              .join('\n'),
            largeIcon: 'ic_launcher',
            smallIcon: 'ic_launcher',
            priority: 'high',
            importance: 'high',
            vibrate: true,
          });
          // Refresh dashboard so the "Collected today" tile updates
          // even before the user navigates back to it.
          qc.invalidateQueries({queryKey: ['dashboard/daily-collection']});
          qc.invalidateQueries({queryKey: ['payment-zones']});
          return;
        }

        // Default render path — preserves existing behavior for
        // legacy notifications that don't include a `type`.
        const {message, title} = notification;
        PushNotification.localNotification({
          channelId: CHANNEL.GENERAL,
          title: title ?? 'Keystone',
          message: message ?? '',
        });
      },

      senderID: '1234567890', // overridden by google-services.json at runtime
      popInitialNotification: true,
      requestPermissions: true,
    });
  }, [deviceToken, qc, saveDeviceToken]);

  return null;
};
export default RemoteNotification;
