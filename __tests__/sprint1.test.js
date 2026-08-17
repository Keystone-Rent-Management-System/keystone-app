const React = require('react');
const renderer = require('react-test-renderer');
const {allSourceFiles, copyOf, read, readRaw} = require('./helpers/source');
const {CAPABILITIES, can} = require('../src/constants/capabilities');

// Sprint 1 — Trust and State Integrity.
//
// The rule these all serve: an app may not state a financial or legal
// fact it does not know. Loading, failure and "capability absent" are
// each distinct from a real answer, and none of them may be rendered as
// a reassuring conclusion.

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  SafeAreaProvider: ({children}) => children,
  SafeAreaView: ({children}) => children,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
  useRoute: () => ({params: {}}),
  useIsFocused: () => true,
}));

const collectText = json => {
  const out = [];
  const walk = n => {
    if (n == null) return;
    if (typeof n === 'string') return out.push(n);
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.children) n.children.forEach(walk);
  };
  walk(json);
  return out.join(' ').replace(/\s+/g, ' ');
};

// React and the renderer are required INSIDE the isolated registry.
// Resetting modules and rendering with an outer renderer hands the
// component a different React instance and every hook throws.
const renderIsolatedNamed = (modulePath, exportName, mocks = {}, props = {}) => {
  let text = '';
  jest.isolateModules(() => {
    for (const [mod, factory] of Object.entries(mocks)) jest.doMock(mod, factory);
    /* eslint-disable global-require */
    const R = require('react');
    const rtr = require('react-test-renderer');
    const C = require(modulePath)[exportName];
    /* eslint-enable global-require */
    let tree;
    rtr.act(() => {
      tree = rtr.create(R.createElement(C, props));
    });
    text = collectText(tree.toJSON());
  });
  return text;
};

const renderIsolated = (modulePath, mocks = {}, props = {}) => {
  let text = '';
  jest.isolateModules(() => {
    for (const [mod, factory] of Object.entries(mocks)) jest.doMock(mod, factory);
    /* eslint-disable global-require */
    const R = require('react');
    const rtr = require('react-test-renderer');
    const C = require(modulePath).default;
    /* eslint-enable global-require */
    let tree;
    rtr.act(() => {
      tree = rtr.create(R.createElement(C, props));
    });
    text = collectText(tree.toJSON());
  });
  return text;
};

// Conclusions an app must never draw from absent data.
const FALSE_CONCLUSION =
  /\$0\b|all settled|nothing owed|no payments yet|not covered|everything looks good|all caught up|nothing needs watching|no claims|0 payments|· 0\b/i;

const tenantHome = state => ({
  '../src/hooks/useTenantHome': () => ({
    useTenantHome: () => state,
    useTenantPayments: () => ({...state, payments: state.payments ?? []}),
    useTenantStatement: () => ({...state, statement: state.statement}),
    useTenantRepairs: () => ({...state, repairs: []}),
    useTenantChecklist: () => ({...state, checklist: state.checklist}),
    useTenantInsurance: () => ({...state, insurance: state.insurance}),
  }),
});

const STATES = {
  loading: {isPending: true, isRefetching: false, error: null},
  error: {isPending: false, isRefetching: false, error: new Error('network')},
  empty: {isPending: false, isRefetching: false, error: null, home: {}},
};

describe('1 · insurance has four distinct states', () => {
  const load = extra =>
    renderIsolated(
      '../src/screens/tenant_home/Insurance',
      tenantHome({refetch: jest.fn(), ...extra}),
    );

  it('unavailable capability never reads as "Not covered"', () => {
    // rentInsurance is false, so this is the live path today.
    expect(can('rentInsurance')).toBe(false);
    const text = load({...STATES.empty, insurance: undefined});
    expect(text).not.toMatch(/not covered/i);
    expect(text).toMatch(/not available yet/i);
  });

  it('a failed request never reads as "Not covered"', () => {
    const text = load({...STATES.error, insurance: undefined});
    expect(text).not.toMatch(/not covered/i);
  });

  it('loading never reads as "Not covered"', () => {
    const text = load({...STATES.loading, insurance: undefined});
    expect(text).not.toMatch(/not covered/i);
  });

  it('the four states are structurally distinct in source', () => {
    const src = read('screens/tenant_home/Insurance.jsx');
    for (const s of ['unavailable', 'failed', 'covered', 'notCovered']) {
      expect(src).toMatch(new RegExp(s));
    }
  });
});

describe('2 · Activity — receipts and statement tested separately', () => {
  const receipts = extra =>
    renderIsolated(
      '../src/screens/tenant_home/Receipts',
      tenantHome({refetch: jest.fn(), ...extra}),
      {initialMode: 'receipts'},
    );
  // The module's DEFAULT export hard-codes receipts mode, so passing
  // initialMode to it silently tested receipts twice. Use the named
  // `Activity` component, which is what both modes actually render.
  const statement = extra =>
    renderIsolatedNamed(
      '../src/screens/tenant_home/Receipts',
      'Activity',
      tenantHome({refetch: jest.fn(), ...extra}),
      {initialMode: 'statement'},
    );

  it('receipts failure shows no "$0", no "0 payments", no "No payments yet"', () => {
    const text = receipts({...STATES.error, payments: []});
    expect(text).not.toMatch(/no payments yet/i);
    expect(text).not.toMatch(/\$0\b/);
    expect(text).not.toMatch(/0 payments/i);
  });

  it('statement failure shows no zero totals, no empty ledger, no "settled"', () => {
    const text = statement({...STATES.error, statement: undefined});
    expect(text).not.toMatch(/all settled|nothing owed/i);
    expect(text).not.toMatch(/\$0\b/);
  });

  it('both modes render in loading and empty without crashing', () => {
    for (const render of [receipts, statement]) {
      for (const state of Object.values(STATES)) {
        expect(typeof render({...state})).toBe('string');
      }
    }
  });
});

describe('3 · Maintenance shows — for every unknown count', () => {
  const load = state =>
    renderIsolated('../src/screens/landlord_home/Maintenance', {
      '../src/hooks/useMaintenance': () => ({
        useMaintenance: () => ({refetch: jest.fn(), ...state}),
      }),
    });

  it.each([
    ['loading', {isPending: true, loaded: false, error: null, summary: undefined}],
    ['error', {isPending: false, loaded: false, error: new Error('x'), summary: undefined}],
  ])('%s renders no zero counts', (_n, state) => {
    const text = load(state);
    expect(text).not.toMatch(/·\s*0\b/);
    expect(text).not.toMatch(/nothing needs watching/i);
  });
});

describe('4 · payment notifications cannot carry unsupported copy', () => {
  // eslint-disable-next-line global-require
  const {sanitiseUnsupportedCopy} = require('../src/components/notifications');

  it('replaces settlement copy arriving through the general handler', () => {
    const out = sanitiseUnsupportedCopy({
      title: '🏠 Rent Received',
      message: 'Unit 4B — James Otieno\n$1,800.00\nNow in Chase ****4821',
    });
    expect(out.title).not.toMatch(/rent received/i);
    expect(out.message).not.toMatch(/now in|\$1,800/i);
  });

  it('leaves unrelated copy untouched', () => {
    const out = sanitiseUnsupportedCopy({
      title: 'Repair update',
      message: 'Your plumber is booked for Tuesday.',
    });
    expect(out.title).toBe('Repair update');
    expect(out.message).toMatch(/plumber/);
  });

  it('drops PAYMENT_RECEIVED entirely and gates channel creation', () => {
    const src = read('components/notifications/index.jsx');
    expect(src).toMatch(/PAYMENT_RECEIVED' && !can\('rentPayments'\)/);
    expect(src).toMatch(/if \(can\('rentPayments'\)\) \{/);
    // The general handler must not republish raw payload copy.
    expect(src).toMatch(/sanitiseUnsupportedCopy/);
    // The general handler must publish the SANITISED values, not the
    // raw payload. (Asserting the raw string is absent would match the
    // sanitiser's own fallback return.)
    expect(src).toMatch(/title: safe\.title/);
    expect(src).toMatch(/message: safe\.message/);
  });
});

describe('5 · every capability flag is structurally enforced', () => {
  it('all 11 flags have at least one consumer in src/', () => {
    const unused = [];
    for (const name of Object.keys(CAPABILITIES)) {
      const used = allSourceFiles().some(f =>
        readRaw(f).includes(`can('${name}')`),
      );
      if (!used) unused.push(name);
    }
    // A flag nobody consults enforces nothing.
    expect(unused).toEqual([]);
  });

  it('a stale fixture cannot reactivate credit reporting', () => {
    // Fixture says enabled with a score; the flag must still win.
    const text = renderIsolated(
      '../src/screens/tenant_home/home',
      tenantHome({
        isPending: false,
        error: null,
        refetch: jest.fn(),
        home: {credit: {enabled: true, score: 712, delta: 18, streakMonths: 9}},
      }),
    );
    expect(text).not.toMatch(/712|▲ 18/);
  });

  it('a stale fixture cannot reactivate landlord insurance claims', () => {
    const src = read('screens/landlord_home/Insurance.jsx');
    expect(src).toMatch(/can\('rentInsurance'\) \? demoOnly\(mockInsuranceClaims, \[\]\) : \[\]/);
  });

  it('screening fixtures are gated by capability, not only demo mode', () => {
    for (const f of [
      'screens/landlord_home/screening/Screening.jsx',
      'screens/landlord_home/screening/ScreeningReport.jsx',
    ]) {
      expect(read(f)).toMatch(/can\('tenantScreening'\) \? demoOnly/);
    }
  });
});

describe('6 · session credentials', () => {
  const secure = read('provider/store/secureAuth.js');

  it('prefers Keychain and falls back to memory, never to plaintext', () => {
    expect(secure).toMatch(/react-native-keychain/);
    expect(secure).toMatch(/WHEN_UNLOCKED_THIS_DEVICE_ONLY/);
    expect(secure).not.toMatch(/mmkvStorage\.set\('_state_auth'.*token/);
  });

  it('keeps the access token in memory only', () => {
    expect(secure).toMatch(/accessTokenInMemory/);
    // Only the refresh token is ever written to the secure store.
    expect(secure).toMatch(/setGenericPassword\(ACCOUNT, token/);
  });

  it('migration is versioned and wipes rather than migrates', () => {
    expect(secure).toMatch(/SESSION_STORAGE_VERSION = 2/);
    expect(secure).toMatch(/_auth_storage_version/);
    // A wipe, not a copy into the secure store.
    expect(secure).not.toMatch(/saveRefreshToken\(auth/);
  });

  it('sign-out clears the secure store, and awaits it', () => {
    // This used to grep useGlobals.js for `clearSession()`. That assertion
    // passed against the defect it was meant to catch: the call was there,
    // but inside a synchronous zustand setter with its promise dropped, so
    // "clears the secure store" was true only in the sense that it had
    // asked. Teardown now belongs to `endSession`, which is awaitable —
    // and the behavioural coverage (success, rejection, delay) lives in
    // authSession.test.js. What is asserted here is the structure that
    // makes awaiting possible at all.
    const session = read('provider/store/authSession.js');
    expect(session).toMatch(/await clearSession\(\)/);
    // Memory dies first, before the await — not after it.
    expect(session).toMatch(/setAccessToken\(null\)[\s\S]*await clearSession/);
    // And the secure delete no longer swallows its own failure.
    expect(secure).not.toMatch(/catch[\s\S]{0,60}nothing to clear/);
  });

  it('no session token is persisted to MMKV', () => {
    const store = read('provider/store/useGlobals.js');
    expect(store).toMatch(/auth: undefined/);
    // …and the shallow-merge trap that this created is handled.
    expect(store).toMatch(/merge: \(persisted, current\)/);
  });
});

describe('7 · no credential reaches telemetry', () => {
  it('setUser receives a profile id, never a token', () => {
    const main = read('navigation/Main.jsx');
    expect(main).not.toMatch(/setUser\([^)]*access_token/);
    expect(main).toMatch(/Sentry\.setUser\(\{id: profile\.userId\}\)/);
  });

  it('events are scrubbed of Authorization headers before send', () => {
    // captureException(axiosError) serialises config.headers, so the
    // fixed setUser call was not sufficient on its own.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const out = scrubEvent({
      extra: {
        response: {
          config: {headers: {Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.abc'}},
        },
      },
    });
    expect(JSON.stringify(out)).not.toMatch(/eyJhbGciOi/);
    expect(out.extra.response.config.headers.Authorization).toBe('[redacted]');
  });

  it('a Bearer-prefixed token in a message is redacted', () => {
    // NAME IS DELIBERATELY NARROW. This was called "a bearer token
    // ANYWHERE in the event is redacted", which is a claim the scrubber
    // did not honour: its regex required the literal `Bearer ` prefix, so
    // the assertion below was the only shape it could pass. The
    // unprefixed case is covered separately, and used to fail.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const out = scrubEvent({
      message: 'failed with Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig',
    });
    expect(JSON.stringify(out)).not.toMatch(/eyJhbGciOi/);
  });

  it('an UNPREFIXED jwt in a serialised response body is redacted', () => {
    // The real leak. A failed refresh captures an axios error whose
    // `response.data` is Keycloak's token-endpoint body — three
    // credentials as bare strings, no `Bearer` anywhere in the event.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const jwt =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    const out = scrubEvent({
      extra: {
        response: {
          data: {access_token: jwt, refresh_token: jwt, id_token: jwt},
        },
      },
    });
    const json = JSON.stringify(out);
    expect(json).not.toMatch(/eyJhbGciOi/);
    expect(json).not.toContain(jwt);
  });

  it('an opaque (non-jwt) refresh token is redacted by key', () => {
    // Keycloak refresh tokens are often UUID-shaped session handles. No
    // token-shaped pattern can recognise one, so the key has to.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const opaque = '9f8c2b41-6d3e-4a77-9b21-0e5d8a3f1c64';
    const out = scrubEvent({
      extra: {response: {data: {refresh_token: opaque}}},
    });
    expect(JSON.stringify(out)).not.toContain(opaque);
  });

  it('an opaque credential in BREADCRUMBS is redacted', () => {
    // The largest surface in a Sentry event, and the one the key-walk
    // originally skipped: it visited only extra/contexts/request. An
    // axios breadcrumb carries request and response data, so an opaque
    // refresh token here matched no JWT pattern and no walked branch.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const opaque = '3c1f7e08-5b92-4d61-8a44-7f2e9d0c6b13';
    const out = scrubEvent({
      breadcrumbs: [
        {category: 'xhr', data: {url: '/token', refresh_token: opaque}},
      ],
    });
    expect(JSON.stringify(out)).not.toContain(opaque);
  });

  it('survives a circular event without dropping the scrub', () => {
    // Sentry events routinely contain cycles (a config referencing its
    // own request). A naive whole-event walk recurses forever and the
    // catch-all silently returns the event UNSCRUBBED.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const opaque = 'aa11bb22-cc33-dd44-ee55-ff6677889900';
    const jwt =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.aaaaaaaaaaaaaaaaaaaaaa';
    const event = {
      extra: {response: {data: {refresh_token: opaque}}},
      message: `token ${jwt}`,
    };
    event.extra.response.self = event.extra.response; // the cycle
    const out = scrubEvent(event);
    // Asserted field-wise: the event is still circular, so the test
    // cannot stringify it either.
    expect(out.extra.response.data.refresh_token).toBe('[redacted]');
    // And the string pass still ran despite the cycle — this is what
    // threw and silently skipped before.
    expect(out.message).not.toContain(jwt);
  });

  it('does NOT redact `code`, which is overwhelmingly an error code', () => {
    // Redacting every `code` would gut the telemetry this exists to
    // protect.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const out = scrubEvent({extra: {error: {code: 'ECONNABORTED'}}});
    expect(out.extra.error.code).toBe('ECONNABORTED');
  });

  it('sensitive HEADERS in breadcrumbs are redacted', () => {
    // The last gap between the two walkers: the key walker went global
    // but the header walker still visited only request/extra/contexts, so
    // a Cookie or X-Api-Key on a breadcrumb was neither a sensitive key
    // nor a JWT and survived.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const out = scrubEvent({
      breadcrumbs: [
        {
          category: 'xhr',
          data: {
            headers: {
              Cookie: 'session=abc123def456ghi',
              'X-Api-Key': 'sk_live_9f8c2b416d3e4a77',
              'Set-Cookie': 'refresh=zzz; HttpOnly',
              Accept: 'application/json',
            },
          },
        },
      ],
    });
    const headers = out.breadcrumbs[0].data.headers;
    expect(headers.Cookie).toBe('[redacted]');
    expect(headers['X-Api-Key']).toBe('[redacted]');
    expect(headers['Set-Cookie']).toBe('[redacted]');
    // Non-sensitive headers are untouched — this has to stay debuggable.
    expect(headers.Accept).toBe('application/json');
  });

  it('handles the array-of-pairs header form', () => {
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const out = scrubEvent({
      extra: {
        req: {
          headers: [
            ['Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.a.b'],
            ['Accept', 'application/json'],
          ],
        },
      },
    });
    expect(out.extra.req.headers[0][1]).toBe('[redacted]');
    expect(out.extra.req.headers[1][1]).toBe('application/json');
  });

  it('scrubbing is stable across repeated calls', () => {
    // A /g regex kept as a module constant carries `lastIndex` between
    // calls, so the second identical event can slip through untouched.
    // eslint-disable-next-line global-require
    const {scrubEvent} = require('../src/utils/sentryScrub');
    const event = () => ({
      message: 'Bearer eyJhbGciOiJIUzI1NiJ9.payload.signature-value',
    });
    expect(JSON.stringify(scrubEvent(event()))).not.toMatch(/eyJhbGciOi/);
    expect(JSON.stringify(scrubEvent(event()))).not.toMatch(/eyJhbGciOi/);
    expect(JSON.stringify(scrubEvent(event()))).not.toMatch(/eyJhbGciOi/);
  });

  it('no source claims setUser(null) removes historical events', () => {
    const offenders = allSourceFiles().filter(f =>
      /setUser\(null\)[^\n]*(delete|remove|purge)/i.test(readRaw(f)),
    );
    expect(offenders).toEqual([]);
  });
});

describe('cross-cutting: failures never become financial conclusions', () => {
  const SCREENS = [
    ['home', '../src/screens/tenant_home/home'],
    ['Receipts', '../src/screens/tenant_home/Receipts'],
    ['Deposit', '../src/screens/tenant_home/Deposit'],
    ['Insurance', '../src/screens/tenant_home/Insurance'],
    ['PayHub', '../src/screens/tenant_home/PayHub'],
    ['PayRent', '../src/screens/tenant_home/PayRent'],
  ];

  it.each(SCREENS)('%s draws no conclusion from a failed request', (_n, path) => {
    const text = renderIsolated(path, tenantHome({...STATES.error, refetch: jest.fn()}));
    expect(text).not.toMatch(FALSE_CONCLUSION);
  });

  it.each(SCREENS)('%s renders in loading and empty states', (_n, path) => {
    for (const state of [STATES.loading, STATES.empty]) {
      expect(
        typeof renderIsolated(path, tenantHome({...state, refetch: jest.fn()})),
      ).toBe('string');
    }
  });
});
