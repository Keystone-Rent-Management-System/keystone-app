/* eslint-env jest */
//
// The INBOUND half of push.
//
// Outbound registration had a great deal of attention; the handler that
// DISPLAYS what arrives had none. It is mounted for the whole life of the
// app once bootstrapping ends — signed out included — and it republishes
// the backend's title/message through `localNotification`. Sign-out
// clears the local token and stops outbound work, and neither of those
// touches this path.

const mockLocalNotification = jest.fn();
let mockUseMocks = false;

jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: mockLocalNotification,
  createChannel: jest.fn(),
}));

jest.mock('../src/services/mocks', () => ({
  get USE_MOBILE_MOCKS() {
    return mockUseMocks;
  },
}));

const mockInvalidateQueries = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({invalidateQueries: mockInvalidateQueries}),
}));

/**
 * Mount the component and hand back the `onNotification` it registered.
 * Driving the real handler is the point — asserting on source text would
 * not show whether the guard actually runs before `localNotification`.
 */
const mountAndGetHandler = () => {
  const React = require('react');
  const renderer = require('react-test-renderer');
  const RemoteNotification = require('../src/components/notifications').default;
  // Required HERE, not at module scope: `jest.resetModules()` hands the
  // component a fresh copy of the mock, so a top-level reference points
  // at a different object and never sees the configure() call.
  const PushNotification = require('react-native-push-notification');
  renderer.act(() => {
    renderer.create(React.createElement(RemoteNotification));
  });
  const call = PushNotification.configure.mock.calls.at(-1);
  return call[0].onNotification;
};

const ACCOUNT_PUSH = {
  title: 'Rent Received',
  message: 'Unit 4B — James Otieno, $1,800.00',
  data: {type: 'GENERAL'},
};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  mockUseMocks = false;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  // The profile store is persisted, so it survives resetModules.
  require('../src/provider/store/profile').useProfileStore
    .getState()
    .clearProfile();
});

const asUser = id => {
  const {useProfileStore} = require('../src/provider/store/profile');
  useProfileStore.getState().saveProfile({userId: id});
};

const authed = () => {
  const authSession = require('../src/provider/store/authSession');
  authSession.default.getState().markAuthenticated();
  return authSession;
};

const bodyOf = () => {
  const [args] = mockLocalNotification.mock.calls.at(-1) ?? [{}];
  return `${args.title ?? ''} ${args.message ?? ''}`;
};

describe('no session → nothing is displayed', () => {
  it('drops an account notification while SIGNED OUT', () => {
    const authSession = require('../src/provider/store/authSession');
    authSession.default.getState().markSignedOut();

    mountAndGetHandler()(ACCOUNT_PUSH);

    // If the gateway still maps this handset to the previous user, this
    // is the app declining to put their rent on a stranger's screen.
    expect(mockLocalNotification).not.toHaveBeenCalled();
  });

  it('drops one while still BOOTSTRAPPING', () => {
    // The launch state is not a session either.
    require('../src/provider/store/authSession');

    mountAndGetHandler()(ACCOUNT_PUSH);

    expect(mockLocalNotification).not.toHaveBeenCalled();
  });
});

describe('a session is not enough — WHOSE notification is it?', () => {
  it('drops a push addressed to a DIFFERENT user', () => {
    authed();
    asUser('user-B');

    mountAndGetHandler()({
      ...ACCOUNT_PUSH,
      data: {...ACCOUNT_PUSH.data, recipientUserId: 'user-A'},
    });

    expect(mockLocalNotification).not.toHaveBeenCalled();
  });

  it('renders detail from `data` for a CONTRACT-COMPLIANT matching push', () => {
    // The payload is built the way the backend contract asks for it:
    // top-level title/body GENERIC (those are what the OS shows on a
    // locked screen with no app code running), detail confined to `data`,
    // recipient stamped.
    //
    // An earlier version of this test put "Your kitchen tap is scheduled"
    // in the TOP-LEVEL message — a payload that violates the contract —
    // and so it proved the rich path worked only for payloads we are
    // asking the backend to stop sending. A compliant payload would have
    // rendered nothing but the generic copy.
    authed();
    asUser('user-B');

    mountAndGetHandler()({
      title: 'Keystone',
      message: 'You have a new update',
      data: {
        type: 'GENERAL',
        recipientUserId: 'user-B',
        title: 'Repair scheduled',
        body: 'Your kitchen tap — plumber Thursday 9am',
      },
    });

    expect(mockLocalNotification).toHaveBeenCalled();
    const body = bodyOf();
    expect(body).toContain('kitchen tap');
    expect(body).toContain('Repair scheduled');
  });

  it('a compliant push for ANOTHER user is dropped, data detail and all', () => {
    authed();
    asUser('user-B');

    mountAndGetHandler()({
      title: 'Keystone',
      message: 'You have a new update',
      data: {
        type: 'GENERAL',
        recipientUserId: 'user-A',
        title: 'Repair scheduled',
        body: "A's kitchen tap — plumber Thursday 9am",
      },
    });

    expect(mockLocalNotification).not.toHaveBeenCalled();
  });

  it('matching recipient with NO data copy shows only the generic top-level', () => {
    // Nothing is invented: if the backend sends a compliant generic
    // payload and no `data` copy, the generic copy is all the user gets.
    authed();
    asUser('user-B');

    mountAndGetHandler()({
      title: 'Keystone',
      message: 'You have a new update',
      data: {type: 'GENERAL', recipientUserId: 'user-B'},
    });

    expect(bodyOf()).toBe('Keystone You have a new update');
  });

  it('UNATTRIBUTABLE push shows nothing account-bearing', () => {
    // Today's reality: the backend stamps no recipient. We cannot prove
    // the push belongs to the person holding the phone, so it must not be
    // rendered from the payload.
    //
    // The payload here is deliberately one the EXISTING claim sanitiser
    // does NOT touch — a maintenance update trips none of the
    // rent/credit/insurance patterns. An earlier version of this test
    // used the rent payload, which the sanitiser strips anyway, so it
    // stayed green with this guard deleted. Verified by mutation.
    authed();
    asUser('user-B');

    mountAndGetHandler()({
      title: 'Repair scheduled',
      message: 'Unit 4B — James Otieno, plumber Thursday 9am',
      data: {type: 'GENERAL'},
    });

    expect(mockLocalNotification).toHaveBeenCalled();
    const body = bodyOf();
    expect(body).not.toContain('James Otieno');
    expect(body).not.toContain('Unit 4B');
    expect(body).not.toContain('Thursday');
    expect(body).toContain('Keystone');
  });

  it('ACCEPTANCE — A signs out, B signs in, an A-addressed push arrives', () => {
    // The required scenario, in ONE process with no module reset: the
    // handover window where B is authenticated but the gateway may still
    // deliver for A.
    const authSession = authed();
    asUser('user-A');
    const onNotification = mountAndGetHandler();

    // A signs out; B signs in. Same process, same handset.
    authSession.default.getState().markSignedOut();
    authSession.default.getState().markAuthenticated();
    asUser('user-B');

    // Delayed push for A.
    onNotification({
      title: 'Rent Received',
      message: "A's unit — $1,800.00",
      data: {type: 'GENERAL', recipientUserId: 'user-A'},
    });
    expect(mockLocalNotification).not.toHaveBeenCalled();

    // A push for B does display.
    onNotification({
      title: 'Repair update',
      message: 'Your tap is scheduled',
      data: {type: 'GENERAL', recipientUserId: 'user-B'},
    });
    expect(mockLocalNotification).toHaveBeenCalledTimes(1);
    expect(bodyOf()).toContain('tap is scheduled');
  });
});

describe('Fixtures mode is not contaminated by real traffic', () => {
  it('drops a real push while demonstrating synthetic data', () => {
    // A handset registered while Live keeps receiving real pushes. Mid-
    // demo, an actual tenant's payment or repair could land on screen.
    authed();
    asUser('user-B');
    mockUseMocks = true;

    mountAndGetHandler()(ACCOUNT_PUSH);

    expect(mockLocalNotification).not.toHaveBeenCalled();
  });
});

// A PAYMENT_RECEIVED test used to live here, claiming to show the auth
// guard runs before every display path. It proved nothing: `rentPayments`
// is a false capability, so that event is dropped by the capability check
// whether or not the auth guard exists — verified by mutation, where it
// stayed green with the guard deleted. The GENERAL cases above exercise
// the paths that actually republish backend copy.

describe('the handler must not feed itself', () => {
  // `react-native-push-notification` routes LOCAL notifications back
  // through `onNotification`, the same callback as remote ones. Every
  // display path here calls `localNotification`, so without an origin
  // marker each display re-enters the handler and displays again.
  //
  // The earlier tests could not see this: `mockLocalNotification` only
  // RECORDED the call. Nothing ever fed the library's echo back in, so
  // the loop had no way to appear.

  /** Re-deliver whatever the app just displayed, as the library would. */
  const echoLastLocal = onNotification => {
    const [payload] = mockLocalNotification.mock.calls.at(-1);
    onNotification({
      ...payload,
      // The library surfaces the local notification with its own copy of
      // the custom fields.
      data: payload.data,
      userInfo: payload.userInfo,
    });
  };

  it('an UNATTRIBUTED remote push does not loop', () => {
    // The worst case: the generic fallback has no recipient either, so
    // its echo lands in the same unattributable branch that produced it.
    authed();
    asUser('user-B');
    const onNotification = mountAndGetHandler();

    onNotification({
      title: 'Keystone',
      message: 'You have a new update',
      data: {type: 'GENERAL'},
    });
    expect(mockLocalNotification).toHaveBeenCalledTimes(1);

    echoLastLocal(onNotification);

    expect(mockLocalNotification).toHaveBeenCalledTimes(1);
  });

  it('a rich contract-compliant push does not loop', () => {
    authed();
    asUser('user-B');
    const onNotification = mountAndGetHandler();

    onNotification({
      title: 'Keystone',
      message: 'You have a new update',
      data: {
        type: 'GENERAL',
        recipientUserId: 'user-B',
        title: 'Repair scheduled',
        body: 'Your kitchen tap — plumber Thursday 9am',
      },
    });
    expect(mockLocalNotification).toHaveBeenCalledTimes(1);

    echoLastLocal(onNotification);
    echoLastLocal(onNotification);

    expect(mockLocalNotification).toHaveBeenCalledTimes(1);
  });

  it('the echo does not trigger a refetch storm either', () => {
    // Each pass also called `invalidateQueries()`, so the loop hit the
    // network as well as the notification shade.
    authed();
    asUser('user-B');
    const onNotification = mountAndGetHandler();

    onNotification({
      title: 'Keystone',
      message: 'You have a new update',
      data: {type: 'GENERAL'},
    });
    const afterFirst = mockInvalidateQueries.mock.calls.length;

    echoLastLocal(onNotification);

    expect(mockInvalidateQueries.mock.calls.length).toBe(afterFirst);
  });

  it('the guard runs before the auth gate', () => {
    // A local echo arriving while signed out must be ignored as a local
    // echo, not merely dropped by the auth check — otherwise the guard's
    // position is untested and could regress to a later line.
    const authSession = require('../src/provider/store/authSession');
    authSession.default.getState().markAuthenticated();
    asUser('user-B');
    const onNotification = mountAndGetHandler();

    onNotification({
      title: 'Keystone',
      message: 'You have a new update',
      data: {type: 'GENERAL'},
    });
    const [payload] = mockLocalNotification.mock.calls.at(-1);

    // Marker present, and it is the FIRST thing consulted.
    expect(payload.data.__keystoneLocal).toBe(true);
    expect(payload.userInfo.__keystoneLocal).toBe(true);
  });
});

describe('iOS delivery is acknowledged on every path', () => {
  // `notification.finish(...)` is marked REQUIRED by the library's README
  // and was never called anywhere. The early returns added for the auth,
  // attribution and loop guards made it worse: iOS throttles background
  // delivery for an app that stops acknowledging pushes, so the privacy
  // fixes could have quietly degraded push reliability.
  const cases = [
    ['signed out', () => require('../src/provider/store/authSession').default.getState().markSignedOut()],
    ['authenticated', () => { authed(); asUser('user-B'); }],
  ];

  it.each(cases)('acknowledges when %s', (_label, setup) => {
    setup();
    const finish = jest.fn();
    mountAndGetHandler()({...ACCOUNT_PUSH, finish});
    expect(finish).toHaveBeenCalled();
  });

  it('acknowledges a local echo too', () => {
    authed();
    asUser('user-B');
    const onNotification = mountAndGetHandler();
    onNotification({title: 'Keystone', message: 'x', data: {type: 'GENERAL'}});
    const [payload] = mockLocalNotification.mock.calls.at(-1);

    const finish = jest.fn();
    onNotification({...payload, finish});
    expect(finish).toHaveBeenCalled();
  });
});
