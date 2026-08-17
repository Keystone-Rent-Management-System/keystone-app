/* eslint-env jest */
//
// Device-token registration.
//
// Both defects here were found on device, not by these tests, and both
// were invisible to a source read: a module-load store snapshot looks
// identical to a live read, and an unhandled rejection only shows up when
// something actually runs.

jest.mock('../src/services/AxiosServices', () => ({
  __esModule: true,
  default: {post: jest.fn(() => Promise.resolve({data: {ok: true}}))},
}));
// Switchable at RUNTIME rather than by re-mocking, so a Fixtures→Live
// transition happens inside ONE module registry. Re-mocking resets
// modules, which wipes `registeredToken` — and that erases the very state
// the stranding defect lives in.
let mockFixturesBlocked = false;
jest.mock('../src/services/fixtureGuard', () => ({
  blockedInFixtureMode: () =>
    mockFixturesBlocked
      ? Promise.resolve({status: 'fixture', fixture: true})
      : null,
}));
jest.mock('../src/services/mocks', () => ({
  USE_MOBILE_MOCKS: false,
  mockTenantNotifications: {content: []},
  mockFallback: (_k, v) => v,
}));
jest.mock('../src/services/unavailable', () => ({
  isEndpointUnavailable: () => false,
}));

beforeEach(() => {
  // SILENCE_EXPECTED_WARNINGS. These suites deliberately drive the
  // failure paths, so the diagnostics they emit are expected output, not
  // signal. console.error is left ALONE on purpose — React's act() and
  // ref warnings arrive there, and those are the ones worth seeing.
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.resetModules();
  jest.clearAllMocks();
  // Default: NOT in Fixtures mode.
  mockFixturesBlocked = false;
});

afterEach(() => {
  // Cancel any scheduled retry. A pending setTimeout outlives the test and
  // jest reports it as a leaked worker — and worse, a real-timer retry can
  // fire during a LATER test and corrupt its POST count.
  try {
    require('../src/services/Notification').cancelPendingRegistration();
  } catch (e) {
    /* module not loaded in this test */
  }
  jest.useRealTimers();
});

const load = () => {
  const {useNotificationStore} = require('../src/provider/store/notification.ts');
  const Notification = require('../src/services/Notification');
  const AxiosUtility = require('../src/services/AxiosServices').default;
  // Registration state is module-level and single-flight by design, so a
  // token registered in one test would otherwise be treated as already
  // done in the next. `jest.resetModules()` re-imports the module, but be
  // explicit rather than relying on that.
  Notification.__resetRegistrationState();
  // The persisted zustand store also survives, so clear the token too.
  useNotificationStore.getState().removeDeviceToken();
  return {useNotificationStore, Notification, AxiosUtility};
};

describe('the token is read at call time, not frozen at module load', () => {
  it('sees a token saved AFTER the module was imported', async () => {
    // The original bug. `const notificationStore =
    // useNotificationStore.getState()` at module scope froze
    // `deviceToken: null`, so a token saved later by `onRegister` was in
    // the store and invisible to the sender forever.
    const {useNotificationStore, Notification, AxiosUtility} = load();

    // Import happened above with an empty store; the token arrives now.
    useNotificationStore.getState().saveDeviceToken('apns-token-123');

    await Notification.registerDeviceToken();

    expect(AxiosUtility.post).toHaveBeenCalledWith(
      expect.stringContaining('apns-token-123'),
    );
  });
});

describe('a missing token is an ordinary state, not a rejection', () => {
  it('does NOT throw when APNs has not issued a token yet', async () => {
    const {Notification, AxiosUtility} = load();
    await expect(Notification.registerDeviceToken()).resolves.toEqual({
      registered: false,
      reason: 'no-device-token',
    });
    expect(AxiosUtility.post).not.toHaveBeenCalled();
  });

  it('registerWhenReady leaves no unhandled rejection on a fresh install', async () => {
    // This is the sign-in path on a first launch. It used to produce
    // "Possible Unhandled Promise Rejection: Notification token required."
    const {Notification} = load();
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);

    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));

    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });
});

describe('registration completes once the token arrives', () => {
  it('sends when onRegister saves the token later', async () => {
    // The missing half: nothing retried after the token appeared, so a
    // fresh install never registered at all.
    const {useNotificationStore, Notification, AxiosUtility} = load();

    Notification.registerWhenReady();
    expect(AxiosUtility.post).not.toHaveBeenCalled();

    // …APNs answers, and `onRegister` saves it.
    useNotificationStore.getState().saveDeviceToken('apns-late-999');
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledWith(
      expect.stringContaining('apns-late-999'),
    );
  });

  it('sends immediately when the token is already known', async () => {
    const {useNotificationStore, Notification, AxiosUtility} = load();
    useNotificationStore.getState().saveDeviceToken('apns-known-1');

    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
  });

  it('does not re-register the SAME token', async () => {
    // This used to assert "registers ONCE, not on every store write" and
    // wrote two DIFFERENT tokens — which now correctly registers twice,
    // because a rotated token must be sent. The real invariant is
    // narrower: an unchanged token is not re-sent.
    const {useNotificationStore, Notification, AxiosUtility} = load();

    Notification.registerWhenReady();
    useNotificationStore.getState().saveDeviceToken('apns-same');
    await new Promise(r => setImmediate(r));
    useNotificationStore.getState().saveDeviceToken('apns-same');
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
  });

  it('RETRIES until the POST actually succeeds', async () => {
    // The hole: the old version unsubscribed when the POST STARTED, so a
    // network or gateway failure was logged once and abandoned — the
    // handset was then never registered at all. "Attempted" is not
    // "registered".
    jest.useFakeTimers();
    const {useNotificationStore, Notification, AxiosUtility} = load();
    AxiosUtility.post
      .mockRejectedValueOnce(new Error('502'))
      .mockResolvedValueOnce({data: {ok: true}});

    useNotificationStore.getState().saveDeviceToken('apns-retry');
    Notification.registerWhenReady();
    await Promise.resolve();
    await Promise.resolve();
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(2500);

    expect(AxiosUtility.post).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('gives up after a bounded number of retries', async () => {
    jest.useFakeTimers();
    const {useNotificationStore, Notification, AxiosUtility} = load();
    AxiosUtility.post.mockRejectedValue(new Error('always down'));

    useNotificationStore.getState().saveDeviceToken('apns-doomed');
    Notification.registerWhenReady();
    await jest.advanceTimersByTimeAsync(120000);

    // Initial attempt + the three scheduled retries, then it stops
    // instead of hammering the gateway forever.
    expect(AxiosUtility.post).toHaveBeenCalledTimes(4);
    jest.useRealTimers();
  });

  it('repeated sign-ins do not duplicate the POST', async () => {
    // NAME IS DELIBERATELY NARROW. This was called "does not accumulate
    // subscribers", which it does not prove: with the collapse removed
    // the extra subscribers still fire, and the single-flight guard
    // suppresses the duplicate POST anyway — verified by mutation. What
    // is asserted here is the POST count. The subscriber leak itself is
    // caught by the cancel test below, where it has a visible effect.
    const {useNotificationStore, Notification, AxiosUtility} = load();

    Notification.registerWhenReady();
    Notification.registerWhenReady();
    Notification.registerWhenReady();

    useNotificationStore.getState().saveDeviceToken('apns-once');
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
  });

  it('sign-out disposes of a subscriber that is still waiting', async () => {
    // Signing out before APNs answers used to leave a live subscriber
    // that would later register the handset against a dead session.
    const {useNotificationStore, Notification, AxiosUtility} = load();

    // Called repeatedly FIRST, which is what makes this test able to see
    // a subscriber leak: if each call stacked a new subscriber, cancel
    // would only dispose of the most recent one and the earlier ones
    // would still fire after sign-out.
    Notification.registerWhenReady();
    Notification.registerWhenReady();
    Notification.registerWhenReady();
    Notification.cancelPendingRegistration();

    useNotificationStore.getState().saveDeviceToken('apns-after-signout');
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).not.toHaveBeenCalled();
  });

  it('sign-out cancels a scheduled retry', async () => {
    jest.useFakeTimers();
    const {useNotificationStore, Notification, AxiosUtility} = load();
    AxiosUtility.post.mockRejectedValue(new Error('502'));

    useNotificationStore.getState().saveDeviceToken('apns-x');
    Notification.registerWhenReady();
    await Promise.resolve();
    await Promise.resolve();
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    Notification.cancelPendingRegistration();
    await jest.advanceTimersByTimeAsync(120000);

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('IN-FLIGHT: a same-session repeat does not duplicate registration', async () => {
    // THE MISSING WINDOW. Repetition before any request starts, and after
    // one completes, were both covered; repetition WHILE a request is in
    // flight was not — and it duplicated.
    //
    // Trace of the defect: call 1 starts POST 1; call 2 bumped the epoch
    // and marked a restart; POST 1 succeeded server-side but its result
    // was discarded on the epoch check, so `registeredToken` was never
    // set, and the restart fired POST 2 for the same user and token.
    //
    // An earlier version of this test ASSERTED that second POST as
    // correct ("the current generation gets its own registration"), which
    // is how the duplicate survived review.
    const {useNotificationStore, Notification, AxiosUtility} = load();
    let releasePost;
    AxiosUtility.post.mockReturnValue(
      new Promise(res => {
        releasePost = res;
      }),
    );

    useNotificationStore.getState().saveDeviceToken('apns-race');
    Notification.registerWhenReady();
    await Promise.resolve();
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    // Same session, same user, same token — the hook re-running, say.
    Notification.registerWhenReady();
    await Promise.resolve();
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    // POST 1 succeeds. It is still exactly the request we wanted, so its
    // result stands and nothing else is sent.
    releasePost({data: {ok: true}});
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
  });

  it('IN-FLIGHT: sign-out discards a POST that succeeds afterwards', async () => {
    const {useNotificationStore, Notification, AxiosUtility} = load();
    let releasePost;
    AxiosUtility.post.mockReturnValue(
      new Promise(res => {
        releasePost = res;
      }),
    );

    useNotificationStore.getState().saveDeviceToken('apns-signout-race');
    Notification.registerWhenReady();
    await Promise.resolve();

    Notification.cancelPendingRegistration();
    releasePost({data: {ok: true}});
    await new Promise(r => setImmediate(r));

    // The token must NOT be recorded as registered against a session that
    // has ended — otherwise the next sign-in believes it is already done.
    AxiosUtility.post.mockResolvedValue({data: {ok: true}});
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));
    expect(AxiosUtility.post).toHaveBeenCalledTimes(2);
  });

  it('IN-FLIGHT: sign-out stops a POST that FAILS afterwards from retrying', async () => {
    // Cancellation happened before `retryTimer` existed, so the catch
    // block scheduled a retry for a session that was already over.
    jest.useFakeTimers();
    const {useNotificationStore, Notification, AxiosUtility} = load();
    let rejectPost;
    AxiosUtility.post.mockReturnValue(
      new Promise((_res, rej) => {
        rejectPost = rej;
      }),
    );

    useNotificationStore.getState().saveDeviceToken('apns-fail-race');
    Notification.registerWhenReady();
    await Promise.resolve();
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    Notification.cancelPendingRegistration();
    rejectPost(new Error('502 after sign-out'));
    await Promise.resolve();
    await Promise.resolve();

    await jest.advanceTimersByTimeAsync(120000);

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('re-registers when APNs ROTATES the token mid-session', async () => {
    // The subscriber used to remove itself after the first token, so a
    // rotation during a long session was never sent.
    const {useNotificationStore, Notification, AxiosUtility} = load();

    useNotificationStore.getState().saveDeviceToken('apns-v1');
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    useNotificationStore.getState().saveDeviceToken('apns-v2-rotated');
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(2);
    expect(AxiosUtility.post).toHaveBeenLastCalledWith(
      expect.stringContaining('apns-v2-rotated'),
    );
  });

  it('SAME session: registerWhenReady twice does not re-POST a registered token', async () => {
    // The other half of the A→B fix. `registerWhenReady` collapses repeat
    // calls, and if that collapse went through `cancelPendingRegistration`
    // it would also forget what this session had already registered — so
    // a second call in the SAME session re-POSTed the same token.
    //
    // The "repeated sign-ins" test cannot see this: all of its calls
    // happen BEFORE APNs supplies a token, so nothing has been registered
    // yet. This one completes the first POST first.
    const {useNotificationStore, Notification, AxiosUtility} = load();
    useNotificationStore.getState().saveDeviceToken('apns-stable');

    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    // Same user, same session, same token — e.g. the hook re-running.
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
  });

  it('A→B: a second user on the SAME handset re-registers', async () => {
    // Two authenticated users in ONE running process, with an UNCHANGED
    // APNs token. `registeredToken` is session-scoped — it means "this
    // handset is registered for whoever is signed in now" — but it used
    // to survive sign-out, so B's sign-in saw token === registeredToken
    // and sent nothing.
    //
    // The consequence is not cosmetic: either the backend still maps the
    // device to A and B receives A's rent and payment notifications, or
    // logout dropped the mapping and B receives none. Both are wrong.
    //
    // Note this test deliberately does NOT reset module state midway —
    // that reset is exactly what hid the defect.
    const {useNotificationStore, Notification, AxiosUtility} = load();
    useNotificationStore.getState().saveDeviceToken('apns-shared-handset');

    // User A signs in.
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));
    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);

    // A signs out.
    Notification.cancelPendingRegistration();

    // User B signs in on the same handset, same APNs token, same process.
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(2);
    expect(AxiosUtility.post).toHaveBeenLastCalledWith(
      expect.stringContaining('apns-shared-handset'),
    );
  });

  it('a rotation during the FINAL retry is not stranded', async () => {
    // `restartRequested` is set while the last attempt is IN FLIGHT, then
    // that attempt exhausts its retries: the give-up branch returned
    // without calling `maybeRestart()`, so the rotated token was never
    // sent even though the subscription was still live.
    //
    // The in-flight window has to be held open deliberately. An earlier
    // version of this test rotated between retries, where `inFlight` is
    // false and the subscription registers the new token directly — so it
    // passed against the defect. Verified by mutation.
    jest.useFakeTimers();
    const {useNotificationStore, Notification, AxiosUtility} = load();

    let rejectFinal;
    let calls = 0;
    AxiosUtility.post.mockImplementation(url => {
      calls += 1;
      if (String(url).includes('apns-rotated')) {
        return Promise.resolve({data: {ok: true}});
      }
      // Attempts 1-3 fail immediately; the 4th (final) is held open.
      if (calls < 4) return Promise.reject(new Error('gateway down'));
      return new Promise((_res, rej) => {
        rejectFinal = rej;
      });
    });

    useNotificationStore.getState().saveDeviceToken('apns-original');
    Notification.registerWhenReady();

    // Reach the final attempt and leave it pending.
    await jest.advanceTimersByTimeAsync(41000);
    expect(calls).toBe(4);
    expect(rejectFinal).toBeDefined();

    // Rotation lands WHILE that final request is still in flight.
    useNotificationStore.getState().saveDeviceToken('apns-rotated');
    await Promise.resolve();

    // The final attempt now fails with no retries left.
    rejectFinal(new Error('gateway down'));
    await jest.advanceTimersByTimeAsync(1000);

    const rotatedCalls = AxiosUtility.post.mock.calls.filter(c =>
      String(c[0]).includes('apns-rotated'),
    );
    expect(rotatedCalls.length).toBe(1);
    jest.useRealTimers();
  });

  it('a failed POST does not escape as an unhandled rejection', async () => {
    const {useNotificationStore, Notification, AxiosUtility} = load();
    AxiosUtility.post.mockRejectedValue(new Error('500 from gateway'));
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);

    useNotificationStore.getState().saveDeviceToken('apns-x');
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));

    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });
});

describe('Fixtures mode must not be mistaken for a real registration', () => {
  // The rest of the push suite runs with the guard unblocked, so this
  // path was unreachable by any of it — which is how the defect survived.

  it('reports registered:false rather than a success body', async () => {
    const {useNotificationStore, Notification} = load();
    mockFixturesBlocked = true;
    useNotificationStore.getState().saveDeviceToken('apns-fixtures');

    await expect(Notification.registerDeviceToken()).resolves.toEqual({
      registered: false,
      reason: 'fixtures',
    });
  });

  it('a blocked write sends nothing', async () => {
    const {useNotificationStore, Notification, AxiosUtility} = load();
    mockFixturesBlocked = true;
    useNotificationStore.getState().saveDeviceToken('apns-blocked');

    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).not.toHaveBeenCalled();
  });

  it('FIXTURES → LIVE: the token is still ELIGIBLE, so the real POST goes out', async () => {
    // The stranding case, in ONE process and ONE module registry.
    //
    // A blocked write must not mark the token done. If it does, the
    // reviewer switches to Live to run the acceptance pass and — auth
    // status unchanged, APNs token unchanged — `token ===
    // registeredToken` suppresses the POST, so the handset is never
    // registered with the real backend.
    //
    // Deliberately NO cancel between the two phases: this asserts the
    // eligibility of the token itself, not that teardown happens to clear
    // it. Resetting modules here would erase exactly what is under test.
    const {useNotificationStore, Notification, AxiosUtility} = load();

    mockFixturesBlocked = true;
    useNotificationStore.getState().saveDeviceToken('apns-src-switch');
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));
    expect(AxiosUtility.post).not.toHaveBeenCalled();

    // Source flipped to Live; same session, same token.
    mockFixturesBlocked = false;
    Notification.registerWhenReady();
    await new Promise(r => setImmediate(r));

    expect(AxiosUtility.post).toHaveBeenCalledTimes(1);
    expect(AxiosUtility.post).toHaveBeenCalledWith(
      expect.stringContaining('apns-src-switch'),
    );
  });

  it('the HOOK re-registers on a Fixtures→Live flip', async () => {
    // WAS A SOURCE REGEX asserting `useDataSourceStore` and `[status,
    // source]` appeared in the file. That proved the dependency was
    // written, not that flipping the source actually re-registers — and
    // the service-level test above deliberately skips the cancel that
    // React's effect cleanup really performs. Between them they proved
    // two implementation details and never the real transition.
    const {useNotificationStore, Notification, AxiosUtility} = load();
    const authSession = require('../src/provider/store/authSession');
    const {useDataSourceStore} = require('../src/provider/store/devDataSource');
    const {
      useSessionPushRegistration,
    } = require('../src/hooks/useSessionPushRegistration');

    authSession.default.getState().markAuthenticated();
    useDataSourceStore.getState().setSource('mock');
    mockFixturesBlocked = true;
    useNotificationStore.getState().saveDeviceToken('apns-hook-flip');

    const React = require('react');
    const renderer = require('react-test-renderer');
    const Harness = () => {
      useSessionPushRegistration();
      return null;
    };
    let tree;
    await renderer.act(async () => {
      tree = renderer.create(React.createElement(Harness));
    });
    expect(AxiosUtility.post).not.toHaveBeenCalled();

    // The real trigger: the user flips the source control to Live.
    mockFixturesBlocked = false;
    await renderer.act(async () => {
      useDataSourceStore.getState().setSource('live');
      await new Promise(r => setImmediate(r));
    });

    expect(AxiosUtility.post).toHaveBeenCalledWith(
      expect.stringContaining('apns-hook-flip'),
    );

    await renderer.act(async () => {
      tree.unmount();
    });
    useDataSourceStore.getState().setSource('live');
  });
});
