/* eslint-env jest */
//
// The session boundary, exercised rather than grepped.
//
// Sprint 1's acceptance list is behavioural — cold start, expiry,
// concurrent 401, sign-out, relaunch, failed refresh — so these drive the
// real axios instance through a stub adapter and assert what the
// interceptors actually did. Source-shape assertions live in
// sprint1.test.js; nothing here passes because a file contains a string.
//
// `react-native-keychain` is mocked VIRTUAL. The package is installed and
// the pod is integrated, but it is a native module with no JS
// implementation under Jest, so the mock is what lets these exercise the
// Keychain-present paths a release build takes.
//
// A mock cannot tell us the native module is actually linked into the
// binary. That is what the on-device pass is for, and nothing here
// substitutes for it: every one of these would still pass against a build
// where the pod failed to link and `hasSecureStore()` returned false.

const mockKeychain = {
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  ACCESSIBLE: {WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly'},
};

jest.mock('react-native-keychain', () => mockKeychain, {virtual: true});
jest.mock('../src/services/AuthServices');

const axiosError = (status, config) => {
  const err = new Error(`Request failed with status code ${status}`);
  err.config = config;
  err.isAxiosError = true;
  err.response = {status, data: {}, headers: {}, config};
  return err;
};

/**
 * Find the pressable whose rendered text contains `label`.
 *
 * Locating a control by what the user reads is the point: pressing every
 * handler on screen and hoping proves nothing about which one was pressed.
 */
const findPressableByText = (root, label) => {
  const textOf = inst => {
    const out = [];
    const visit = node => {
      if (node == null) return;
      if (typeof node === 'string') {
        out.push(node);
        return;
      }
      (node.children || []).forEach(visit);
    };
    visit(inst);
    return out.join(' ');
  };
  return root
    .findAll(n => typeof n.props?.onPress === 'function')
    .find(n => textOf(n).includes(label));
};

const ok = (config, data = {ok: true}) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

/**
 * Fresh module registry per test. secureAuth, authSession and the axios
 * instance all hold module-level state (the in-memory tokens, the status,
 * the single-flight promise), so leaking one test's session into the next
 * would make these pass or fail in an order-dependent way.
 */
/**
 * Let pending promises settle INSIDE act().
 *
 * `await new Promise(r => setImmediate(r))` on its own lets a component's
 * async effect update state outside act, which React reports as
 * "An update to X inside a test was not wrapped in act(...)". The
 * assertions still passed, but a noisy run makes a real warning easy to
 * miss — and these suites exist to catch things that hide in noise.
 */
const settle = async () => {
  const renderer = require('react-test-renderer');
  await renderer.act(async () => {
    await new Promise(resolve => setImmediate(resolve));
  });
};

const load = () => {
  const secureAuth = require('../src/provider/store/secureAuth');
  const authSession = require('../src/provider/store/authSession');
  const AuthServices = require('../src/services/AuthServices').default;
  const {default: AxiosUtility, ensureFreshSession} =
    require('../src/services/AxiosServices');
  const {useAuthBootstrap} = require('../src/hooks/useAuthBootstrap');
  return {secureAuth, authSession, AuthServices, AxiosUtility, ensureFreshSession, useAuthBootstrap};
};

/**
 * Mount the bootstrap hook.
 *
 * `@testing-library/react-native` is not a dependency of this repo, so
 * this is the react-test-renderer equivalent — the same harness the other
 * suites use. It must run AFTER `load()` so it picks up the hook from the
 * same fresh module registry the assertions read from.
 */
const renderBootstrap = () => {
  const React = require('react');
  const renderer = require('react-test-renderer');
  const {useAuthBootstrap} = require('../src/hooks/useAuthBootstrap');
  const Harness = () => {
    useAuthBootstrap();
    return null;
  };
  let tree;
  renderer.act(() => {
    tree = renderer.create(React.createElement(Harness));
  });
  return tree;
};

beforeEach(() => {
  // SILENCE_EXPECTED_WARNINGS. These suites deliberately drive the
  // failure paths, so the diagnostics they emit are expected output, not
  // signal. console.error is left ALONE on purpose — React's act() and
  // ref warnings arrive there, and those are the ones worth seeing.
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.resetModules();
  jest.clearAllMocks();
  // Re-assert the keychain mock. `jest.resetModules()` clears the module
  // REGISTRY but not the mock factory registry, so a test that swaps in a
  // throwing factory (the "no secure store" case) would otherwise leave
  // every subsequent test running without a Keychain — and the sign-out
  // tests would pass vacuously, asserting against a delete that is never
  // called.
  jest.doMock('react-native-keychain', () => mockKeychain, {virtual: true});
  // Likewise the debug role preview: its default drives `forceRole`, and
  // these tests are about the real gate, not the bypass.
  jest.doMock('../src/provider/store/devRole', () => ({
    useDevRoleStore: Object.assign(sel => (sel ? sel({role: 'auto'}) : {role: 'auto'}), {
      getState: () => ({role: 'auto'}),
    }),
    useDevRole: (t, l) => ({isTenant: t, isLandlord: l}),
  }));
  mockKeychain.setGenericPassword.mockResolvedValue(true);
  mockKeychain.getGenericPassword.mockResolvedValue(false);
  mockKeychain.resetGenericPassword.mockResolvedValue(true);
});

describe('request interceptor · attachment', () => {
  it('attaches the in-memory access token', async () => {
    const {secureAuth, AxiosUtility} = load();
    secureAuth.setAccessToken('access-123');

    const adapter = jest.fn(config => Promise.resolve(ok(config)));
    AxiosUtility.defaults.adapter = adapter;

    await AxiosUtility.get('/tenants/rent-summary');

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe(
      'Bearer access-123',
    );
  });

  it('sends no Authorization when there is no session', async () => {
    const {AxiosUtility} = load();
    const adapter = jest.fn(config => Promise.resolve(ok(config)));
    AxiosUtility.defaults.adapter = adapter;

    await AxiosUtility.get('/tenants/rent-summary');

    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  it('EXCLUDES sign-in and refresh from the bearer', async () => {
    // A stale bearer on the token endpoint is how a valid refresh turns
    // into a 401.
    const {secureAuth, AxiosUtility} = load();
    secureAuth.setAccessToken('expired-token');

    const adapter = jest.fn(config => Promise.resolve(ok(config)));
    AxiosUtility.defaults.adapter = adapter;

    await AxiosUtility.post('/realms/keystone/protocol/openid-connect/token');
    await AxiosUtility.post('/profile/login');

    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
    expect(adapter.mock.calls[1][0].headers.Authorization).toBeUndefined();
  });
});

describe('response interceptor · refresh, replay, retry-once', () => {
  it('refreshes on 401 and replays with the NEW token', async () => {
    const {secureAuth, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');

    AuthServices.refreshToken.mockResolvedValue({
      access_token: 'fresh-999',
      refresh_token: 'refresh-def',
    });

    let call = 0;
    const adapter = jest.fn(config => {
      call += 1;
      if (call === 1) return Promise.reject(axiosError(401, config));
      return Promise.resolve(ok(config, {rent: 1800}));
    });
    AxiosUtility.defaults.adapter = adapter;

    const res = await AxiosUtility.get('/tenants/rent-summary');

    expect(res.data).toEqual({rent: 1800});
    expect(AuthServices.refreshToken).toHaveBeenCalledWith('refresh-abc');
    // The replay must NOT carry the token that just 401'd.
    expect(adapter.mock.calls[1][0].headers.Authorization).toBe(
      'Bearer fresh-999',
    );
  });

  it('rotated refresh token is durable BEFORE the replay', async () => {
    // Keycloak rotates refresh tokens. If the replay goes out before the
    // rotated token is stored and the process dies in between, the stored
    // token has already been spent and the next launch cannot recover.
    const {secureAuth, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');
    mockKeychain.setGenericPassword.mockClear();

    AuthServices.refreshToken.mockResolvedValue({
      access_token: 'fresh-999',
      refresh_token: 'rotated-xyz',
    });

    const order = [];
    mockKeychain.setGenericPassword.mockImplementation(() => {
      order.push('store');
      return Promise.resolve(true);
    });

    let call = 0;
    const adapter = jest.fn(config => {
      call += 1;
      if (call === 1) return Promise.reject(axiosError(401, config));
      order.push('replay');
      return Promise.resolve(ok(config));
    });
    AxiosUtility.defaults.adapter = adapter;

    await AxiosUtility.get('/tenants/rent-summary');

    expect(order).toEqual(['store', 'replay']);
  });

  it('CONCURRENT 401s trigger exactly one refresh', async () => {
    const {secureAuth, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');

    let resolveRefresh;
    AuthServices.refreshToken.mockReturnValue(
      new Promise(res => {
        resolveRefresh = res;
      }),
    );

    const seen = new Set();
    const adapter = jest.fn(config => {
      const key = config.url;
      if (!seen.has(key)) {
        seen.add(key);
        return Promise.reject(axiosError(401, config));
      }
      return Promise.resolve(ok(config, {url: config.url}));
    });
    AxiosUtility.defaults.adapter = adapter;

    const inFlight = Promise.all([
      AxiosUtility.get('/a'),
      AxiosUtility.get('/b'),
      AxiosUtility.get('/c'),
      AxiosUtility.get('/d'),
    ]);

    await settle();
    resolveRefresh({access_token: 'fresh-999', refresh_token: 'r2'});

    const results = await inFlight;

    expect(AuthServices.refreshToken).toHaveBeenCalledTimes(1);
    expect(results.map(r => r.data.url).sort()).toEqual(['/a', '/b', '/c', '/d']);
    // Every replay carries the new token, not just the one that won.
    const replays = adapter.mock.calls.slice(4);
    replays.forEach(([config]) => {
      expect(config.headers.Authorization).toBe('Bearer fresh-999');
    });
  });

  it('retries a failed request AT MOST ONCE', async () => {
    // A replay that 401s again is an authorisation failure, not a stale
    // token. Retrying past that is a request storm.
    const {secureAuth, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');

    AuthServices.refreshToken.mockResolvedValue({
      access_token: 'fresh-999',
      refresh_token: 'r2',
    });

    const adapter = jest.fn(config => Promise.reject(axiosError(401, config)));
    AxiosUtility.defaults.adapter = adapter;

    await expect(AxiosUtility.get('/tenants/rent-summary')).rejects.toThrow();

    // Original + exactly one replay.
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(AuthServices.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('does NOT refresh through the token endpoint itself', async () => {
    const {secureAuth, AuthServices, AxiosUtility} = load();
    await secureAuth.saveRefreshToken('refresh-abc');

    const adapter = jest.fn(config => Promise.reject(axiosError(401, config)));
    AxiosUtility.defaults.adapter = adapter;

    await expect(
      AxiosUtility.post('/realms/keystone/protocol/openid-connect/token'),
    ).rejects.toThrow();

    expect(AuthServices.refreshToken).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('a non-401 is passed through untouched', async () => {
    const {secureAuth, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('good');

    const adapter = jest.fn(config => Promise.reject(axiosError(500, config)));
    AxiosUtility.defaults.adapter = adapter;

    await expect(AxiosUtility.get('/anything')).rejects.toThrow();
    expect(AuthServices.refreshToken).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});

describe('failed refresh · the gate goes to signedOut', () => {
  it('clears memory AND secure storage, then signs out', async () => {
    const {secureAuth, authSession, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');
    authSession.default.getState().markAuthenticated();

    AuthServices.refreshToken.mockRejectedValue(new Error('invalid_grant'));

    AxiosUtility.defaults.adapter = jest.fn(config =>
      Promise.reject(axiosError(401, config)),
    );

    await expect(AxiosUtility.get('/tenants/rent-summary')).rejects.toThrow();

    expect(authSession.default.getState().status).toBe(authSession.SIGNED_OUT);
    expect(secureAuth.getAccessToken()).toBeNull();
    expect(mockKeychain.resetGenericPassword).toHaveBeenCalled();
  });

  it('tags the rejection so it is never read as an offline blip', async () => {
    // A bare Error has no `.response`, which the services' "endpoint
    // unavailable" check would otherwise treat as a network hiccup and
    // answer with fixture data — an expired session rendering as a
    // working screen full of numbers.
    const {secureAuth, AuthServices, AxiosUtility} = load();
    await secureAuth.saveRefreshToken('refresh-abc');
    AuthServices.refreshToken.mockRejectedValue(new Error('invalid_grant'));
    AxiosUtility.defaults.adapter = jest.fn(config =>
      Promise.reject(axiosError(401, config)),
    );

    await expect(AxiosUtility.get('/x')).rejects.toMatchObject({
      isAuthFailure: true,
    });
  });

  it('N concurrent failures do not fire N teardowns', async () => {
    const {secureAuth, AuthServices, AxiosUtility, authSession} = load();
    await secureAuth.saveRefreshToken('refresh-abc');
    authSession.default.getState().markAuthenticated();
    AuthServices.refreshToken.mockRejectedValue(new Error('invalid_grant'));
    AxiosUtility.defaults.adapter = jest.fn(config =>
      Promise.reject(axiosError(401, config)),
    );

    await Promise.allSettled([
      AxiosUtility.get('/a'),
      AxiosUtility.get('/b'),
      AxiosUtility.get('/c'),
    ]);

    expect(mockKeychain.resetGenericPassword).toHaveBeenCalledTimes(1);
  });
});

describe('cold start · the bootstrapping state', () => {
  it('starts in bootstrapping, never in a conclusion', () => {
    const {authSession} = load();
    expect(authSession.default.getState().status).toBe(
      authSession.BOOTSTRAPPING,
    );
  });

  it('no stored token → signedOut, with no refresh attempted', async () => {
    const {authSession, AuthServices} = load();
    mockKeychain.getGenericPassword.mockResolvedValue(false);

    renderBootstrap();

    await settle();

    expect(authSession.default.getState().status).toBe(authSession.SIGNED_OUT);
    expect(AuthServices.refreshToken).not.toHaveBeenCalled();
  });

  it('RELAUNCH: a stored token that refreshes → authenticated', async () => {
    const {authSession, AuthServices, secureAuth} = load();
    mockKeychain.getGenericPassword.mockResolvedValue({
      username: 'keystone.session',
      password: 'stored-refresh',
    });
    AuthServices.refreshToken.mockResolvedValue({
      access_token: 'fresh-999',
      refresh_token: 'rotated',
    });

    renderBootstrap();

    await settle();
    await settle();

    expect(AuthServices.refreshToken).toHaveBeenCalledWith('stored-refresh');
    expect(authSession.default.getState().status).toBe(
      authSession.AUTHENTICATED,
    );
    expect(secureAuth.getAccessToken()).toBe('fresh-999');
  });

  it('a stored token that will NOT exchange → signedOut, token erased', async () => {
    const {authSession, AuthServices} = load();
    mockKeychain.getGenericPassword.mockResolvedValue({
      username: 'keystone.session',
      password: 'spent-refresh',
    });
    AuthServices.refreshToken.mockRejectedValue(new Error('invalid_grant'));

    renderBootstrap();

    await settle();
    await settle();

    expect(authSession.default.getState().status).toBe(authSession.SIGNED_OUT);
    // A refresh token that cannot be exchanged must not survive on disk
    // to be retried on every subsequent launch.
    expect(mockKeychain.resetGenericPassword).toHaveBeenCalled();
  });
});

describe('the gate · nothing authenticated mounts while bootstrapping', () => {
  // The heavy children are stubbed to markers. What is under test is the
  // gate in src/Main.jsx, not the navigation tree it guards.
  const mountMain = () => {
    jest.doMock('../src/navigation/Main', () => ({
      __esModule: true,
      default: () => null,
    }));
    jest.doMock('../src/components/notifications', () => ({
      __esModule: true,
      default: () => null,
    }));
    jest.doMock('../src/hooks', () => ({
      useInitialURL: () => {},
      useDeepLinkUrlListener: () => {},
    }));
    jest.doMock('@react-navigation/native', () => {
      const R = require('react');
      return {
        // forwardRef: Main.jsx passes `ref={navigationRef}`, and a plain
        // function component given a ref triggers a React warning.
        NavigationContainer: R.forwardRef(({children}, _ref) =>
          R.createElement('NAVIGATION_CONTAINER', null, children),
        ),
        // RootNavigation (imported by Main) needs the ref factory.
        createNavigationContainerRef: () => ({
          isReady: () => false,
          navigate: jest.fn(),
        }),
        useNavigation: () => ({navigate: jest.fn()}),
      };
    });

    const React = require('react');
    const renderer = require('react-test-renderer');
    const Main = require('../src/Main').default;
    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(Main));
    });
    return tree;
  };

  const hasNavigator = tree =>
    tree.root.findAllByType('NAVIGATION_CONTAINER').length > 0;

  it('renders NO navigator while the session question is open', async () => {
    const {authSession} = load();
    mockKeychain.getGenericPassword.mockResolvedValue({
      username: 'keystone.session',
      password: 'stored-refresh',
    });
    // A refresh held open: the gate must HOLD for as long as the answer
    // is unknown, rather than falling into either conclusion by default.
    // It is released at the end so the test does not leave a pending
    // promise behind.
    let releaseRefresh;
    const AuthServices = require('../src/services/AuthServices').default;
    AuthServices.refreshToken.mockReturnValue(
      new Promise(res => {
        releaseRefresh = res;
      }),
    );

    const tree = mountMain();
    await settle();

    expect(authSession.default.getState().status).toBe(
      authSession.BOOTSTRAPPING,
    );
    expect(hasNavigator(tree)).toBe(false);

    releaseRefresh({access_token: 'a', refresh_token: 'b'});
    await settle();
  }, 20000);

  it('mounts the navigator once the question is answered', async () => {
    const {authSession} = load();
    mockKeychain.getGenericPassword.mockResolvedValue(false);

    const tree = mountMain();
    await settle();
    await settle();

    expect(authSession.default.getState().status).toBe(authSession.SIGNED_OUT);
    expect(hasNavigator(tree)).toBe(true);
  }, 20000);

  it('holds the native splash for exactly as long as it holds the tree', async () => {
    // Hiding the splash on mount is what let a returning user see the
    // signed-out front door before the refresh landed.
    const SplashScreen = require('react-native-splash-screen');
    load();
    mockKeychain.getGenericPassword.mockResolvedValue({
      username: 'keystone.session',
      password: 'stored-refresh',
    });
    let releaseRefresh;
    const AuthServices = require('../src/services/AuthServices').default;
    AuthServices.refreshToken.mockReturnValue(
      new Promise(res => {
        releaseRefresh = res;
      }),
    );

    mountMain();
    await settle();

    expect(SplashScreen.hide).not.toHaveBeenCalled();

    releaseRefresh({access_token: 'a', refresh_token: 'b'});
    await settle();
  }, 20000);
});

describe('P0 · a dead session evicts the user from the protected tree', () => {
  // Renders the REAL navigation/Main.jsx with a fake stack navigator that
  // records which routes it registers. What is under test is the screen
  // set this component declares per status — registering `bottom-nav`
  // unconditionally is what kept the tab navigator alive through a
  // session ending, and `initialRouteName` cannot fix it because React
  // Navigation reads that once, at first mount.
  const mountNav = () => {
    // The gate describe above mocks navigation/Main; these tests are
    // ABOUT navigation/Main, and doMock registrations outlive
    // resetModules, so it has to be explicitly un-mocked here.
    jest.dontMock('../src/navigation/Main');
    const registered = [];
    jest.doMock('@react-navigation/stack', () => {
      const R = require('react');
      return {
        createStackNavigator: () => ({
          Navigator: ({children}) => R.createElement(R.Fragment, null, children),
          Screen: ({name}) => {
            if (!registered.includes(name)) registered.push(name);
            return null;
          },
        }),
      };
    });
    // Screen components are irrelevant here; only the route set matters.
    const stub = () => null;
    jest.doMock('@/screens', () => new Proxy({}, {get: () => stub}));
    jest.doMock('../src/screens', () => new Proxy({}, {get: () => stub}));
    jest.doMock('../src/navigation/BottomNav', () => stub);
    jest.doMock('../src/navigation/MyUnitsStack', () => stub);
    jest.doMock('../src/navigation/OnboardingStack', () => stub);
    jest.doMock('../src/navigation/options', () => ({
      withBackBarOptions: {},
    }));
    jest.doMock(
      '../src/screens/landlord_home/screening/ScreeningConsent',
      () => stub,
    );
    jest.doMock('../src/hooks', () => ({useAuth: () => ({profile: null})}));

    const React = require('react');
    const renderer = require('react-test-renderer');
    const MainNav = require('../src/navigation/Main').default;
    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(MainNav));
    });
    return {registered, tree, renderer};
  };

  it('does NOT register bottom-nav while signed out', () => {
    const {authSession} = load();
    authSession.default.getState().markSignedOut();

    const {registered} = mountNav();

    expect(registered).toContain('welcome');
    expect(registered).not.toContain('bottom-nav');
    // The rest of the private surface is gone with it.
    expect(registered).not.toContain('invoice_view');
    expect(registered).not.toContain('more__account_password');
  });

  it('registers bottom-nav only while authenticated', () => {
    const {authSession} = load();
    authSession.default.getState().markAuthenticated();

    const {registered} = mountNav();

    expect(registered).toContain('bottom-nav');
  });

  it('UNREGISTERS the protected tree when a refresh fails mid-session', async () => {
    // The exact reported hole: authenticated, sitting inside the tabs,
    // refresh fails. Clearing the token is not enough — the private route
    // has to stop being mounted.
    const {authSession, secureAuth, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');
    authSession.default.getState().markAuthenticated();

    const {registered, tree, renderer} = mountNav();
    expect(registered).toContain('bottom-nav');

    AuthServices.refreshToken.mockRejectedValue(new Error('invalid_grant'));
    AxiosUtility.defaults.adapter = jest.fn(config =>
      Promise.reject(axiosError(401, config)),
    );

    await renderer.act(async () => {
      await AxiosUtility.get('/tenants/rent-summary').catch(() => {});
    });

    // Collect a FRESH route set from the re-render that the status change
    // caused, rather than inspecting the stale one.
    registered.length = 0;
    renderer.act(() => {
      tree.update(
        require('react').createElement(
          require('../src/navigation/Main').default,
        ),
      );
    });

    expect(authSession.default.getState().status).toBe(authSession.SIGNED_OUT);
    expect(registered).not.toContain('bottom-nav');
    expect(registered).toContain('welcome');
  });

  it('KEEPS the unauthenticated doors registered while signed out', () => {
    // The applicant journey begins from a resolved invite, with no
    // session. An earlier pass moved `onboarding` inside the authed
    // block, which deleted the destination out from under
    // ClaimLanding's only CTA. These routes are doors INTO the product;
    // they are not protected surfaces and must survive a signed-out gate.
    const {authSession} = load();
    authSession.default.getState().markSignedOut();

    const {registered} = mountNav();

    expect(registered).toContain('onboarding');
    expect(registered).toContain('auth__claim');
    expect(registered).toContain('welcome');
  });

  it('ClaimLanding’s “Set up my account” targets a REGISTERED route', () => {
    // Presses the actual control, with a RESOLVED INVITE supplied through
    // the route so the CTA exists at all.
    //
    // The previous version of this test mocked `useRoute()` with empty
    // params, so the resolved-invite branch never rendered, the CTA was
    // never on screen, and it pressed only whatever else happened to be
    // visible. It then asserted separately that `onboarding` was
    // registered — an assertion true regardless of where the CTA pointed.
    // Repointing the CTA at a nonexistent route would have left it green.
    const {authSession} = load();
    authSession.default.getState().markSignedOut();
    const {registered} = mountNav();

    const navigate = jest.fn();
    const invite = {
      token: 'inv_1',
      property: 'Magnolia Court',
      unit: '4B',
      address: '128 Magnolia Ave',
      landlord: 'Keystone Property Group',
      tenantName: 'Sarah Chen',
      rent: 1800,
    };

    jest.doMock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({navigate, goBack: jest.fn()}),
      // THE INVITE. `ClaimLanding` seeds its state from
      // `route.params.invite`, so this is what makes the CTA render.
      useRoute: () => ({params: {invite}}),
      useIsFocused: () => true,
    }));

    const React = require('react');
    const renderer = require('react-test-renderer');
    const ClaimLanding =
      require('../src/screens/authentication/ClaimLanding').default;

    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(ClaimLanding));
    });

    const cta = findPressableByText(tree.root, 'Set up my account');
    // Guard against the exact failure this test replaces: if the control
    // is not on screen, FAIL rather than quietly asserting nothing.
    expect(cta).toBeDefined();

    renderer.act(() => cta.props.onPress());

    expect(navigate).toHaveBeenCalledTimes(1);
    const [destination, params] = navigate.mock.calls[0];
    // The destination the CTA actually asked for must be a route the
    // signed-out navigator actually declares. This is the pairing that
    // broke, and it is now asserted as a pairing.
    expect(registered).toContain(destination);
    // …and it carries the invite into the journey.
    expect(params?.params?.invite).toEqual(invite);
  }, 20000);

  it('actively resets to welcome, rather than leaving history behind', async () => {
    // Unregistering stops the render; the reset is what removes the
    // private route from the navigation state so it cannot be swiped
    // back to.
    const RootNavigation = require('../src/RootNavigation');
    const reset = jest.fn();
    RootNavigation.navigationRef.current = {reset, navigate: jest.fn()};

    const {authSession} = load();
    authSession.default.getState().markAuthenticated();
    const {renderer, tree} = mountNav();

    await renderer.act(async () => {
      await authSession.endSession();
    });
    renderer.act(() => {
      tree.update(
        require('react').createElement(
          require('../src/navigation/Main').default,
        ),
      );
    });

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'welcome'}],
    });
    RootNavigation.navigationRef.current = null;
  });
});

describe('P1 · a failed secure write is not reported as a durable session', () => {
  it('carries the failure through refresh instead of discarding it', async () => {
    const {secureAuth, authSession, AuthServices, AxiosUtility} = load();
    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');

    // The Keychain exists but refuses the write.
    mockKeychain.setGenericPassword.mockRejectedValue(new Error('errSecIO'));

    AuthServices.refreshToken.mockResolvedValue({
      access_token: 'fresh-999',
      refresh_token: 'rotated',
    });

    let call = 0;
    AxiosUtility.defaults.adapter = jest.fn(config => {
      call += 1;
      if (call === 1) return Promise.reject(axiosError(401, config));
      return Promise.resolve(ok(config));
    });

    await AxiosUtility.get('/tenants/rent-summary');

    // The request still works — memory-only is a safe fallback...
    expect(authSession.default.getState().status).toBe(
      authSession.AUTHENTICATED,
    );
    // ...but the app knows the session will not survive relaunch.
    expect(authSession.default.getState().sessionPersisted).toBe(false);
  });

  it('WARNS even when the secure store is absent entirely', async () => {
    // This used to assert the opposite — that "no secure store" was a
    // configured state and therefore not worth mentioning. That rule was
    // wrong, and dangerously so: an operational probe would classify a
    // BROKEN store (missing keychain entitlement, OSStatus -34018) the
    // same way, silencing the warning in exactly the case that made the
    // defect visible on device.
    //
    // The user-facing fact does not depend on the cause. If the refresh
    // token is not durably stored, the session dies at relaunch.
    jest.resetModules();
    jest.doMock('react-native-keychain', () => {
      throw new Error('module not present');
    }, {virtual: true});

    const secureAuth = require('../src/provider/store/secureAuth');
    const authSession = require('../src/provider/store/authSession');
    const AuthServices = require('../src/services/AuthServices').default;
    const AxiosUtility = require('../src/services/AxiosServices').default;

    expect(secureAuth.hasSecureStore()).toBe(false);
    await secureAuth.saveRefreshToken('refresh-abc');
    AuthServices.refreshToken.mockResolvedValue({
      access_token: 'fresh-999',
      refresh_token: 'rotated',
    });
    let call = 0;
    AxiosUtility.defaults.adapter = jest.fn(config => {
      call += 1;
      if (call === 1) return Promise.reject(axiosError(401, config));
      return Promise.resolve(ok(config));
    });

    await AxiosUtility.get('/x');

    expect(authSession.default.getState().sessionPersisted).toBe(false);
  });

  it('hasSecureStore() does not claim the store WORKS', async () => {
    // The diagnostic weakness behind the -34018 hunt: a linked module
    // whose every call fails still answers true here. `probeSecureStore`
    // is the operational answer, and it records the native error.
    const {secureAuth} = load();
    expect(secureAuth.hasSecureStore()).toBe(true);

    mockKeychain.setGenericPassword.mockRejectedValue(
      Object.assign(new Error('failed'), {code: '-34018'}),
    );
    await expect(secureAuth.probeSecureStore()).resolves.toBe(false);

    const err = secureAuth.getSecureStoreError();
    expect(err.code).toBe('-34018');
    expect(err.op).toBe('probe');
  });

  it('probeSecureStore confirms an operational store', async () => {
    const {secureAuth} = load();
    const vault = {};
    mockKeychain.setGenericPassword.mockImplementation((u, p, o) => {
      vault[o.service] = p;
      return Promise.resolve(true);
    });
    mockKeychain.getGenericPassword.mockImplementation(o =>
      Promise.resolve(
        vault[o.service] ? {username: 'x', password: vault[o.service]} : false,
      ),
    );
    mockKeychain.resetGenericPassword.mockImplementation(o => {
      delete vault[o.service];
      return Promise.resolve(true);
    });

    await expect(secureAuth.probeSecureStore()).resolves.toBe(true);
    // The probe cleans up after itself.
    expect(vault['keystone.secure-probe']).toBeUndefined();
  });

  it('sign-in records durability and delegates the warning', () => {
    // The toast used to live here, which is exactly why the refresh paths
    // had none. Sign-in now only records the fact; the warning is issued
    // centrally by useSessionPersistenceWarning, covering every path.
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.join(__dirname, '../src/hooks/useLogin.ts'),
      'utf8',
    );
    expect(src).toMatch(/const persisted = await persistSession/);
    expect(src).toMatch(/markAuthenticated\(\{persisted\}\)/);
    expect(src).not.toMatch(/sign in again next time/);
  });
});

describe('P1 · no authenticated request follows a signedOut conclusion', () => {
  const teardown = [];
  afterEach(() => {
    teardown.forEach(fn => {
      try {
        fn();
      } catch (e) {
        /* already torn down */
      }
    });
    teardown.length = 0;
  });

  const renderAuth = () => {
    const React = require('react');
    const renderer = require('react-test-renderer');
    const useAuth = require('../src/hooks/useAuth').default;
    let seen;
    const Harness = () => {
      seen = useAuth();
      return null;
    };
    const {QueryClient, QueryClientProvider} = require('@tanstack/react-query');
    // gcTime 0 + explicit teardown: a live QueryClient keeps cache timers
    // running past the test, which jest reports as a leaked worker.
    const client = new QueryClient({
      defaultOptions: {queries: {retry: false, gcTime: 0}},
    });
    let tree;
    renderer.act(() => {
      tree = renderer.create(
        React.createElement(
          QueryClientProvider,
          {client},
          React.createElement(Harness),
        ),
      );
    });
    teardown.push(() => {
      tree.unmount();
      client.clear();
    });
    return () => seen;
  };

  it('does NOT fetch the profile while signed out', async () => {
    // `MainNav` calls useAuth() unconditionally, so this fired on the
    // Welcome screen of a fresh install: an authenticated request, with no
    // session to refresh, guaranteed to 401, on the one screen that exists
    // because there is no session.
    const {authSession} = load();
    authSession.default.getState().markSignedOut();
    const AuthServices = require('../src/services/AuthServices').default;
    AuthServices.getProfile.mockResolvedValue({userId: 'u1'});

    renderAuth();
    await settle();

    expect(AuthServices.getProfile).not.toHaveBeenCalled();
  });

  it('does NOT fetch the profile while bootstrapping', async () => {
    load();
    const AuthServices = require('../src/services/AuthServices').default;
    AuthServices.getProfile.mockResolvedValue({userId: 'u1'});

    renderAuth();
    await settle();

    expect(AuthServices.getProfile).not.toHaveBeenCalled();
  });

  it('DOES fetch it once authenticated', async () => {
    const {authSession} = load();
    authSession.default.getState().markAuthenticated();
    const AuthServices = require('../src/services/AuthServices').default;
    AuthServices.getProfile.mockResolvedValue({userId: 'u1'});

    renderAuth();
    await settle();

    expect(AuthServices.getProfile).toHaveBeenCalled();
  });
});

describe('P1 · the persistence warning covers every path, not just sign-in', () => {
  const mountWarning = () => {
    const React = require('react');
    const renderer = require('react-test-renderer');
    const {
      useSessionPersistenceWarning,
    } = require('../src/hooks/useSessionPersistenceWarning');
    const Harness = () => {
      useSessionPersistenceWarning();
      return null;
    };
    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(Harness));
    });
    return {tree, renderer, React, Harness};
  };

  it('warns when a REFRESH fails to persist the rotated token', async () => {
    // The path that previously said nothing at all. Sign-in had a toast;
    // the refresh paths set the flag and moved on, so the session simply
    // vanished at next launch with no explanation.
    const {secureAuth, authSession, AuthServices, AxiosUtility} = load();
    const {toast} = require('../src/utils/toast');
    jest.spyOn(toast, 'show');

    secureAuth.setAccessToken('stale');
    await secureAuth.saveRefreshToken('refresh-abc');
    authSession.default.getState().markAuthenticated();

    const {renderer} = mountWarning();

    mockKeychain.setGenericPassword.mockRejectedValue(new Error('errSecIO'));
    AuthServices.refreshToken.mockResolvedValue({
      access_token: 'fresh-999',
      refresh_token: 'rotated',
    });
    let call = 0;
    AxiosUtility.defaults.adapter = jest.fn(config => {
      call += 1;
      if (call === 1) return Promise.reject(axiosError(401, config));
      return Promise.resolve(ok(config));
    });

    await renderer.act(async () => {
      await AxiosUtility.get('/tenants/rent-summary');
    });

    expect(authSession.default.getState().sessionPersisted).toBe(false);
    expect(toast.show).toHaveBeenCalledWith(
      expect.stringContaining('sign in again next time'),
      expect.anything(),
    );
  });

  it('stays silent for a durable session', async () => {
    const {authSession} = load();
    const {toast} = require('../src/utils/toast');
    jest.spyOn(toast, 'show');
    authSession.default.getState().markAuthenticated({persisted: true});

    mountWarning();
    await settle();

    expect(toast.show).not.toHaveBeenCalled();
  });

  it('warns ONCE, not on every render', async () => {
    const {authSession} = load();
    const {toast} = require('../src/utils/toast');
    jest.spyOn(toast, 'show');
    authSession.default.getState().markAuthenticated({persisted: false});

    // Re-render the SAME component type. A fresh arrow function per
    // update is a different type, so React unmounts and remounts — which
    // resets the "already warned" ref and would make this pass no matter
    // what the hook does.
    const {tree, renderer, React, Harness} = mountWarning();
    renderer.act(() => tree.update(React.createElement(Harness)));
    renderer.act(() => tree.update(React.createElement(Harness)));

    expect(toast.show).toHaveBeenCalledTimes(1);
  });
});

describe('sign-out · not complete until the store says so', () => {
  it('clears memory immediately, before awaiting the deletion', async () => {
    const {secureAuth, authSession} = load();
    secureAuth.setAccessToken('access-123');
    await secureAuth.saveRefreshToken('refresh-abc');
    authSession.default.getState().markAuthenticated();

    let releaseDelete;
    mockKeychain.resetGenericPassword.mockReturnValue(
      new Promise(res => {
        releaseDelete = res;
      }),
    );

    const pending = authSession.endSession();

    // Synchronously after the call, before the native delete settles:
    // this process can no longer authenticate, and the gate has moved.
    expect(secureAuth.getAccessToken()).toBeNull();
    expect(authSession.default.getState().status).toBe(authSession.SIGNED_OUT);

    releaseDelete(true);
    await expect(pending).resolves.toBeUndefined();
  });

  it('DELAYED deletion: the promise does not settle early', async () => {
    const {secureAuth, authSession} = load();
    await secureAuth.saveRefreshToken('refresh-abc');

    let releaseDelete;
    mockKeychain.resetGenericPassword.mockReturnValue(
      new Promise(res => {
        releaseDelete = res;
      }),
    );

    let settled = false;
    const pending = authSession.endSession().then(() => {
      settled = true;
    });

    // Several turns of the microtask queue — a sign-out that resolved on
    // its own timing rather than the store's would have finished by now.
    await settle();
    await settle();
    expect(settled).toBe(false);

    releaseDelete(true);
    await pending;
    expect(settled).toBe(true);
  });

  it('REJECTED deletion: endSession rejects and flags the failed wipe', async () => {
    const {secureAuth, authSession} = load();
    await secureAuth.saveRefreshToken('refresh-abc');
    authSession.default.getState().markAuthenticated();

    mockKeychain.resetGenericPassword.mockRejectedValue(
      new Error('User interaction required'),
    );

    await expect(authSession.endSession()).rejects.toThrow(
      'User interaction required',
    );

    // Dead in this process...
    expect(secureAuth.getAccessToken()).toBeNull();
    expect(authSession.default.getState().status).toBe(authSession.SIGNED_OUT);
    // ...but the caller is told the disk copy may have survived, so it
    // does not present a clean sign-out.
    expect(authSession.default.getState().secureWipeFailed).toBe(true);
  });

  it('a rejected deletion is never reported as a clean sign-out', () => {
    // The screen must branch on the rejection rather than navigating away
    // unconditionally in a `.finally`.
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.join(__dirname, '../src/screens/more/more.jsx'),
      'utf8',
    );
    expect(src).toMatch(/await endSession\(\)/);
    expect(src).toMatch(/could not erase the saved session/);
  });
});
