import AxiosUtility from './AxiosServices';
import {isEndpointUnavailable} from './unavailable';
import {blockedInFixtureMode} from './fixtureGuard';
import {useNotificationStore} from '../provider/store/notification.ts';
import {INotificationsResponse} from '../types/notification.ts';
import {USE_MOBILE_MOCKS, mockTenantNotifications, mockFallback} from './mocks';

/**
 * Registers device token for push notifications.
 *
 * TWO DEFECTS FIXED HERE.
 *
 * 1. The store snapshot was taken ONCE at module load
 *    (`const notificationStore = useNotificationStore.getState()`), so it
 *    froze `deviceToken: null` for the life of the process. When
 *    `onRegister` later saved the real token, this function could not see
 *    it — the token was in the store and the sender was reading a copy
 *    taken before it existed. Read the state at CALL time.
 *
 * 2. It threw when no token was present, and the only caller invoked it
 *    with a bare `.then()`. On a fresh install, registration runs before
 *    APNs has issued anything, so sign-in reliably produced
 *    "Possible Unhandled Promise Rejection: Notification token required."
 *    Not having a token yet is an ordinary, expected state, not an error:
 *    it now returns a result instead of throwing, and `registerWhenReady`
 *    below closes the loop when the token does arrive.
 */
export const registerDeviceToken = async () => {
  // ALWAYS returns a discriminated result: `registered` is true only when
  // the GATEWAY accepted the write.
  //
  // It used to return whatever it had — the fixture guard's local
  // resolution, or the axios body — and `attempt()` read "did not throw"
  // as "registered". In Fixtures mode that meant a blocked write marked
  // the token as registered, so switching the source back to Live never
  // sent the real one: the token had not changed and the session had not
  // changed, so nothing was eligible to run again. The handset stayed
  // unregistered with the backend for the rest of the session.
  const blocked = blockedInFixtureMode('POST /notifications/deviceToken');
  if (blocked) {
    await blocked;
    return {registered: false, reason: 'fixtures'};
  }

  // Read at call time — see (1) above.
  const deviceToken = useNotificationStore.getState().deviceToken;
  if (!deviceToken) {
    // Expected on a fresh install: APNs has not issued a token yet.
    // `registerWhenReady` will pick it up.
    return {registered: false, reason: 'no-device-token'};
  }

  const {data} = await AxiosUtility.post(
    `/notifications/deviceToken?deviceToken=${deviceToken}`,
  );

  return {registered: true, data};
};

// Registration lifecycle state, module-level and single-flight.
//
// `epoch` is a generation counter. Cancelling bumps it, which INVALIDATES
// the completion of any request already in flight — a promise cannot be
// recalled, so the only way to cancel one is to decide, when it settles,
// that nobody is listening any more. Clearing a boolean was not enough:
// a POST issued before sign-out would still record its token, or still
// schedule a retry from its catch, after the session had ended.
let epoch = 0;
let inFlight = false;
let restartRequested = false;
let registeredToken: string | null = null;
let unsubscribeStore: (() => void) | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

const RETRY_DELAYS_MS = [2000, 8000, 30000];

/**
 * Collapse a repeat `registerWhenReady()` WITHIN the same session.
 *
 * Deliberately does NOT bump the epoch. The epoch exists to invalidate
 * the result of an in-flight request when the SESSION ends — when nobody
 * is entitled to that result any more. A second call for the same user
 * and the same token is not that: the request already in flight is still
 * exactly the request we want, and discarding its outcome only causes it
 * to be sent a second time.
 *
 * That was a real duplicate path: call 1 starts POST 1; call 2 bumps the
 * epoch and marks a restart; POST 1 succeeds server-side but its result
 * is thrown away, `registeredToken` is never set, and the restart fires
 * POST 2 for the same user and token.
 *
 * Dropping the subscription and the retry timer is enough here — the new
 * generation installs its own.
 */
const collapseRepeat = () => {
  if (unsubscribeStore) {
    unsubscribeStore();
    unsubscribeStore = null;
  }
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  restartRequested = false;
};

/**
 * End the session's registration work: the store subscription, a
 * scheduled retry, the RESULT of anything already in flight, and the
 * record of which token is registered. Idempotent.
 *
 * `inFlight` is deliberately NOT cleared. The request is still out there;
 * pretending otherwise let a second POST start while the first was
 * pending. It clears itself when it settles, at which point the epoch
 * check discards its outcome.
 */
export const cancelPendingRegistration = () => {
  // SESSION END. Bumping the epoch here — and only here — is what makes
  // an in-flight request's result unusable: by the time it settles, the
  // user it was for is gone.
  epoch += 1;
  collapseRepeat();
  // `registeredToken` IS SESSION-SCOPED, and forgetting that was a real
  // defect: it means "this handset is registered for the user who is
  // signed in right now", not "this handset has been seen before".
  //
  // Leaving it set across a session change broke user A → user B on one
  // running app. B signs in on the same handset, the APNs token is
  // unchanged, `attempt()` sees `token === registeredToken` and sends
  // nothing. Either the backend still maps the device to A — so A's rent
  // and payment notifications reach B — or it dropped the mapping at
  // logout and B gets no notifications at all. Both are wrong, and the
  // unanswered backend question does not make this the backend's bug.
  //
  // This is the SESSION-END entry point, so clearing here is correct.
  // `registerWhenReady` deliberately does not come through here.
  registeredToken = null;
};

/** Test seam. */
export const __resetRegistrationState = () => {
  cancelPendingRegistration();
  registeredToken = null;
  inFlight = false;
};

const maybeRestart = () => {
  if (!restartRequested) return;
  restartRequested = false;
  attempt();
};

const attempt = async (attemptIndex = 0): Promise<void> => {
  const myEpoch = epoch;
  const token = useNotificationStore.getState().deviceToken;
  if (!token || token === registeredToken) return;
  if (inFlight) {
    // Do not start a second POST alongside the first. Remember that the
    // current generation still wants one, and run it when the in-flight
    // request settles.
    restartRequested = true;
    return;
  }
  inFlight = true;
  try {
    const result = await registerDeviceToken();
    inFlight = false;
    if (myEpoch !== epoch) return maybeRestart();
    if (!result?.registered) {
      // Blocked by Fixtures mode, or there was nothing to send. Neither
      // is a success — the gateway has not seen this handset — and
      // neither is a failure worth retrying against. Leave
      // `registeredToken` unset so the token stays ELIGIBLE: switching
      // the source to Live re-runs registration and it goes out then.
      return maybeRestart();
    }
    // Only NOW is this token done. Recording success at POST-start is
    // what let a failed request be logged once and never retried.
    registeredToken = token;
    maybeRestart();
  } catch (err: any) {
    inFlight = false;
    if (myEpoch !== epoch) return maybeRestart();
    const delay = RETRY_DELAYS_MS[attemptIndex];
    if (delay === undefined) {
      // eslint-disable-next-line no-console
      console.warn(
        '[push] device-token registration gave up after retries:',
        err?.message,
      );
      // …but a token that ROTATED while the final attempt was in flight
      // is a different token, and giving up on the old one must not
      // strand it. This branch used to `return` without restarting, so a
      // rotation landing during the last retry was never sent even though
      // the store subscription was still live.
      return maybeRestart();
    }
    // eslint-disable-next-line no-console
    console.warn(
      `[push] device-token registration failed (${err?.message}); retrying in ${delay}ms`,
    );
    retryTimer = setTimeout(() => {
      retryTimer = null;
      attempt(attemptIndex + 1);
    }, delay);
  }
};

/**
 * Keep this handset registered for as long as the session lasts.
 *
 * Driven by AUTHENTICATED status (see hooks/useSessionPushRegistration),
 * NOT by the login screen. Registration used to be kicked off from
 * `useLogin.onSuccess`, which a returning user restored from the Keychain
 * never runs — so exactly the users whose sessions persist were the ones
 * who never registered.
 *
 * The store subscription stays alive for the whole generation rather than
 * removing itself after the first token. APNs can rotate a token mid-
 * session, and a one-shot subscriber would miss the new one for as long
 * as the user stayed signed in.
 */
export const registerWhenReady = () => {
  // New generation; also collapses repeat calls rather than stacking
  // subscribers. Deliberately `collapseRepeat`, NOT
  // `cancelPendingRegistration`: calling this twice within one session
  // must neither forget a token this session already registered nor
  // invalidate a request already in flight for the same user and token —
  // each of those produced its own duplicate POST.
  collapseRepeat();

  unsubscribeStore = useNotificationStore.subscribe((state, prev) => {
    if (state.deviceToken && state.deviceToken !== prev?.deviceToken) {
      attempt();
    }
  });

  // The token may already be known (returning user, or APNs answered
  // before the session came up).
  attempt();

  return cancelPendingRegistration;
};

/**
 * Gets all user notifications
 */
export const getNotifications = async (): Promise<INotificationsResponse> => {
  if (USE_MOBILE_MOCKS) {
    return mockFallback('notifications', mockTenantNotifications);
  }
  // Set the token in the AxiosUtility

  try {
    const {data} = await AxiosUtility.get('/notifications');
    return data;
  } catch (err: any) {
    if (isEndpointUnavailable(err)) {
      return mockFallback('notifications', mockTenantNotifications);
    }
    throw err;
  }
};

/**
 * Marks one notification read. PATCH /notifications/{id}/read
 *
 * Verified live on api-dev 2026-07-29. Unlike the read rollups this is
 * a WRITE, so it deliberately has no fixture fallback — silently
 * "succeeding" against a dead endpoint would leave the row looking read
 * until the next refetch snapped it back. Callers surface the failure.
 */
export const markNotificationRead = async (id: string) => {
  // Fixtures mode must never touch the network — not for reads and not
  // for writes. Fixture rows carry synthetic ids ('n1', 'n2'), so without
  // this guard tapping one PATCHed `/notifications/n1/read` against the
  // live gateway and surfaced a raw "must be a valid UUID" backend error
  // to the user. A demo row is local; resolve and let the caller refetch.
  if (USE_MOBILE_MOCKS) {
    return Promise.resolve({id, read: true});
  }
  const {data} = await AxiosUtility.patch(`/notifications/${id}/read`);
  return data;
};

/** Unread badge count. GET /notifications/unread-count → {unread: n} */
export const getUnreadCount = async (): Promise<number> => {
  if (USE_MOBILE_MOCKS) {
    const unread = (mockTenantNotifications?.content ?? []).filter(
      (n: any) => !n.read,
    ).length;
    return mockFallback('notifications.unread-count', unread);
  }
  try {
    const {data} = await AxiosUtility.get('/notifications/unread-count');
    return data?.unread ?? 0;
  } catch (err: any) {
    if (isEndpointUnavailable(err)) {
      return mockFallback('notifications.unread-count', 0);
    }
    throw err;
  }
};

/**
 * Persist notification preferences. PATCH /tenants/notification-preferences
 * (BE §T15).
 *
 * The screen previously called an EMPTY `persist = () => {}`. Every switch
 * flipped local state and the reminder picker even toasted a confirmation,
 * so a tenant could turn SMS off, see it off, and keep receiving SMS —
 * with the setting silently back on next launch.
 */
export const updateNotificationPrefs = async (prefs: any) => {
  const blocked = blockedInFixtureMode(
    'PATCH /tenants/notification-preferences',
  );
  if (blocked) return blocked;
  const {data} = await AxiosUtility.patch(
    '/tenants/notification-preferences',
    prefs,
  );
  return data;
};

const NotificationService = {
  registerDeviceToken,
  registerWhenReady,
  cancelPendingRegistration,
  getNotifications,
  markNotificationRead,
  getUnreadCount,
  updateNotificationPrefs,
};

export default NotificationService;
