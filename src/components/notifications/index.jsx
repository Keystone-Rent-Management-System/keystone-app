import {useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {useNotificationStore} from '../../provider/store/notification';
import {useProfileStore} from '../../provider/store/profile';
import {useQueryClient} from '@tanstack/react-query';
import {can} from '../../constants/capabilities';
import useAuthSession, {
  AUTHENTICATED,
} from '../../provider/store/authSession';
import {USE_MOBILE_MOCKS} from '../../services/mocks';

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

// ORIGIN MARKER — the thing that stops this handler feeding itself.
//
// `react-native-push-notification` routes LOCAL notifications back
// through the same `onNotification` callback as remote ones (its README
// warns about exactly this). Every display path here calls
// `localNotification`, and none of them said where the notification came
// from, so:
//
//   remote arrives → we display a local one → that re-enters the handler
//   → it carries no `recipientUserId`, so it is "unattributable" → we
//   display the generic one → which re-enters → … without end.
//
// An unattributed remote push starts the loop on its first hop. Each pass
// also called `invalidateQueries()`, so it is a refetch storm as well as
// a notification storm.
//
// Stamped into BOTH `data` (Android) and `userInfo` (iOS) because the
// library surfaces custom fields differently per platform, and a marker
// that is only readable on one of them is not a guard.
const LOCAL_ORIGIN = '__keystoneLocal';

const localOrigin = () => ({
  data: {[LOCAL_ORIGIN]: true},
  userInfo: {[LOCAL_ORIGIN]: true},
});

/**
 * Tell iOS we are done with this notification.
 *
 * The library's README marks `notification.finish(...)` as REQUIRED. It
 * was never called on any path here, and the early returns added for the
 * auth, attribution and loop guards made that worse — iOS throttles
 * background delivery for an app that stops acknowledging pushes. Guarded
 * with `?.` because it is absent on Android and in tests.
 */
const settle = notification => {
  try {
    notification?.finish?.('UIBackgroundFetchResultNoData');
  } catch (e) {
    /* nothing we can do, and it must not break delivery */
  }
};

const isLocallyGenerated = notification =>
  notification?.data?.[LOCAL_ORIGIN] === true ||
  notification?.userInfo?.[LOCAL_ORIGIN] === true ||
  // Android delivers custom data as strings.
  notification?.data?.[LOCAL_ORIGIN] === 'true' ||
  notification?.userInfo?.[LOCAL_ORIGIN] === 'true';

// Claims the app cannot stand behind, in copy we did not write.
const UNSUPPORTED_CLAIMS = [
  {when: 'rentPayments', pattern: /rent received|now in |payment received|paid to your bank|instantly/i},
  {when: 'creditReporting', pattern: /credit (score|report|bureau)|reported to/i},
  {when: 'rentInsurance', pattern: /covered|coverage|claim (approved|paid)/i},
];

/**
 * Replace push copy that asserts a capability Keystone does not have.
 * Returns neutral, truthful text rather than dropping the notification —
 * the user still learns something happened, without being told money
 * moved.
 */
export const sanitiseUnsupportedCopy = ({title, message}) => {
  const blob = `${title ?? ''} ${message ?? ''}`;
  const violated = UNSUPPORTED_CLAIMS.find(
    c => !can(c.when) && c.pattern.test(blob),
  );
  if (!violated) {
    return {title: title ?? 'Keystone', message: message ?? ''};
  }
  return {
    title: 'Keystone',
    message: 'Open Keystone to see the latest on your account.',
  };
};

const ensureChannels = () => {
  // The payments channel is registered with the OS and shows in Android
  // notification settings, so creating it while payments do not exist
  // advertises a capability in a surface the app does not control.
  if (can('rentPayments')) {
    // Was "Push when a tenant pays — the M-Pesa moment." That string is
    // registered with the OS at launch and visible in Android's
    // notification settings, so deleting the React Native M-Pesa modals
    // never touched it.
    PushNotification.createChannel(
      {
        channelId: CHANNEL.PAYMENT,
        channelName: 'Rent payments',
        channelDescription: 'Push when a tenant pays.',
        importance: 4, // heads-up
        vibrate: true,
      },
      () => {},
    );
  }
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

// Notification payload contract (BE_ASKS_MOBILE §2).
//
// TOP-LEVEL title/body are what the OS renders on a locked screen with no
// app code running, so they must stay GENERIC. Everything identifying or
// account-bearing lives in `data`, which only the app reads — and only
// after it has confirmed the recipient matches the signed-in user.
//
//   {
//     notification: { title: "Keystone", body: "You have a new update" },
//     data: {
//       recipientUserId: string,  // === GET /manage-profile/me .userId
//       type: "PAYMENT_RECEIVED" | "GENERAL" | ...,
//       title?: string,           // detailed display copy (app-only)
//       body?: string,            // detailed display copy (app-only)
//       amount?: number,
//       unitName?: string,
//       tenantName?: string,
//       bankLast4?: string,
//       ...
//     }
//   }
//
// None of `recipientUserId`, `data.title` or `data.body` is shipping yet;
// until they are, every push degrades to the generic nudge.
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
        // FIRST, BEFORE ANYTHING ELSE. Our own local notifications come
        // back through this callback; re-processing one means displaying
        // another, which comes back again. This must precede the auth
        // check, the attribution check, every display path and the cache
        // invalidation — a loop that merely "fails the auth check on the
        // way round" is still a loop.
        if (isLocallyGenerated(notification)) {
          settle(notification);
          return;
        }

        // NOTHING ACCOUNT-BEARING IS DISPLAYED WITHOUT A SESSION.
        //
        // This handler is mounted for the whole life of the app once
        // bootstrapping ends — including while signed out — and it used
        // to republish the backend's title/message through
        // `localNotification` regardless of who, if anyone, was signed
        // in. Sign-out clears the local token and stops OUTBOUND
        // registration, but neither of those disables this INBOUND path.
        //
        // So if the gateway still maps the handset to user A after logout
        // (unresolved — BE_ASKS_MOBILE §2), a later push for A reaches a
        // signed-out phone and the app itself re-displays A's rent,
        // tenancy or maintenance details — possibly in front of user B.
        // That part is ours to refuse, and it does not depend on the
        // backend answer.
        //
        // NOTE this cannot cover the terminated-app case: when the
        // process is not running, iOS/Android render the payload
        // themselves. That needs a payload contract where the body
        // carries no account detail (BE_ASKS_MOBILE §2), plus real
        // server-side deregistration.
        if (useAuthSession.getState().status !== AUTHENTICATED) {
          settle(notification);
          return;
        }

        // Fixtures mode must not be contaminated by real traffic either.
        // A handset registered while Live keeps receiving real pushes, so
        // someone demonstrating synthetic data could have an actual
        // tenant's payment or repair land on screen mid-demo.
        if (USE_MOBILE_MOCKS) {
          settle(notification);
          return;
        }

        const data = notification?.data ?? {};
        const evt = data.type ?? notification?.userInfo?.type ?? 'GENERAL';

        // WHOSE NOTIFICATION IS THIS?
        //
        // "Someone is signed in" is not "this belongs to them". A signed
        // out → signed in handover on one handset leaves a real window:
        // user A signs out, B signs in, and until B's registration lands
        // (or if it fails) the gateway may still deliver a push addressed
        // to A. The auth gate above is satisfied — B IS authenticated —
        // and A's rent or repair detail renders in front of B.
        //
        // IDENTIFIER NAMESPACE, exactly:
        // `data.recipientUserId` must equal `/manage-profile/me`'s
        // `userId` byte for byte. NOT a tenant record id, NOT a landlord
        // id, NOT a different identity-provider subject. A near-miss here
        // fails open in the worst direction — two ids that never match
        // would send every notification down the generic path and look
        // merely disappointing, while two that match across different
        // people would be the disclosure itself.
        const recipient = data.recipientUserId ?? null;
        const currentUser = useProfileStore.getState().profile?.userId ?? null;

        if (recipient && currentUser && recipient !== currentUser) {
          // Addressed to someone else. Drop it outright.
          settle(notification);
          return;
        }

        if (!recipient || !currentUser) {
          // UNATTRIBUTABLE. The backend does not yet stamp a recipient
          // (BE_ASKS_MOBILE §2), so we cannot prove this belongs to the
          // person holding the phone — and rich rendering would be
          // exactly the disclosure we are trying to prevent.
          //
          // Degrade instead of guessing: show nothing account-bearing,
          // and refresh the caches so the app fetches THIS user's
          // authorised data when they open it. The server decides what
          // they may see; the payload does not.
          PushNotification.localNotification({
            ...localOrigin(),
            channelId: CHANNEL.GENERAL,
            title: 'Keystone',
            message: 'You have a new update',
            largeIcon: 'ic_launcher',
            smallIcon: 'ic_launcher',
          });
          qc.invalidateQueries();
          settle(notification);
          return;
        }

        // Payment-received gets the special rent-received card style.
        // The shape mirrors the user's spec:
        //   "🏠 Rent Received
        //    Unit 4B — James Otieno
        //    $1,800.00
        //    Now in Chase ****4821"
        // A settlement notification is a claim that money moved. Keystone
        // cannot settle (constants/capabilities), so one must not be
        // rendered at all.
        //
        // Gating this branch alone was not enough: it fell through to the
        // general handler below, which republishes the backend's own
        // `title`/`message` verbatim — so a push carrying "Rent Received"
        // and "Now in Chase ****4821" still reached the notification
        // shade, just via the other code path. While payments are
        // unavailable the event is dropped outright.
        if (evt === 'PAYMENT_RECEIVED' && !can('rentPayments')) {
          settle(notification);
          return;
        }

        if (evt === 'PAYMENT_RECEIVED') {
          const amount = data.amount ? `$${Number(data.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '';
          const unit = data.unitName ?? '';
          const tenant = data.tenantName ?? '';
          const bank = data.bankLast4 ? `Now in ${data.bankName ?? ''} ****${data.bankLast4}` : '';
          PushNotification.localNotification({
            ...localOrigin(),
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
          settle(notification);
          return;
        }

        // Default render path, for GENERAL and untyped notifications.
        //
        // DETAIL COMES FROM `data`, NOT FROM THE TOP-LEVEL FIELDS.
        //
        // This used to render `notification.title` / `notification.message`
        // directly, which quietly contradicted the privacy contract being
        // asked of the backend: those are exactly the fields the OS shows
        // on a locked screen with no app code running, so they must stay
        // generic. Reading detail from them meant "recipient matches →
        // renders richly" was only true for payloads that violated the
        // contract — and a payload built the RIGHT way would have shown
        // nothing but "You have a new update", with the rich path looking
        // complete because a non-compliant test payload exercised it.
        //
        // `data.title` / `data.body` are app-only: they never reach the
        // OS renderer, so they may carry detail. We are here only if the
        // recipient matched, so this user is entitled to see it.
        const detailed = data.title || data.body;
        const {message, title} = notification;
        // Backend-authored copy is republished here either way, so this
        // is the last place an unsupported claim can reach the user: a
        // push whose title reads "Rent Received" or "Now in Chase
        // ****4821" would render exactly as sent. Sanitise rather than
        // trust the payload.
        const safe = sanitiseUnsupportedCopy(
          detailed
            ? {title: data.title ?? 'Keystone', message: data.body ?? ''}
            : {title, message},
        );
        PushNotification.localNotification({
          ...localOrigin(),
          channelId: CHANNEL.GENERAL,
          title: safe.title,
          message: safe.message,
        });
        // Whatever we displayed, refresh from the server so the screen
        // the user lands on reflects THEIR authorised data rather than
        // the payload's version of events.
        qc.invalidateQueries();
        settle(notification);
      },

      senderID: '1234567890', // overridden by google-services.json at runtime
      popInitialNotification: true,
      requestPermissions: true,
    });
  }, [deviceToken, qc, saveDeviceToken]);

  return null;
};
export default RemoteNotification;
