const React = require('react');
const renderer = require('react-test-renderer');
const {allSourceFiles, copyOf, read, readRaw} = require('./helpers/source');
const {CAPABILITIES, can} = require('../src/constants/capabilities');

// Capability-based guards, replacing phrase-only assurance.
//
// A phrase list only ever catches wordings someone already thought of.
// Four families ("instant", "two taps", "bureaus", "coverage is working")
// missed "the moment a tenant pays", "Reporting on", "build your credit",
// "Protected" and "Processing Payment" — every one of which shipped.
//
// Two guards replace it:
//   1. A declared capability list (constants/capabilities) that screens
//      consult, so honesty is a property of the code rather than of
//      whoever last wrote the copy.
//   2. ROUTE-MOUNT tests that actually render a screen in its loading,
//      error and empty states and assert on the rendered text — which
//      catches a claim no matter how it is worded or wrapped.

// The kit Screen wrapper reads safe-area insets; mounting outside a
// provider throws before any assertion runs.
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
  const texts = [];
  const walk = node => {
    if (node == null) return;
    if (typeof node === 'string') return texts.push(node);
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.children) node.children.forEach(walk);
  };
  walk(json);
  return texts.join(' ').replace(/\s+/g, ' ');
};

// Render inside an isolated module registry so each case can mock the
// screen's hooks independently.
//
// React and react-test-renderer must be required INSIDE the isolated
// registry too. Calling jest.resetModules() and then rendering with the
// outer renderer hands the component a different React instance than the
// renderer is driving, and every hook throws
// "Cannot read properties of null (reading 'useState')" — which looks
// like a broken screen but is a broken test.
const renderIsolated = (modulePath, mocks = {}) => {
  let text = '';
  jest.isolateModules(() => {
    for (const [mod, factory] of Object.entries(mocks)) {
      jest.doMock(mod, factory);
    }
    /* eslint-disable global-require */
    const React2 = require('react');
    const renderer2 = require('react-test-renderer');
    const Component = require(modulePath).default;
    /* eslint-enable global-require */
    let tree;
    renderer2.act(() => {
      tree = renderer2.create(React2.createElement(Component));
    });
    text = collectText(tree.toJSON());
  });
  return text;
};

const renderScreen = Component => {
  let tree;
  renderer.act(() => {
    tree = renderer.create(React.createElement(Component));
  });
  return collectText(tree.toJSON());
};

describe('capability declarations', () => {
  it('records what does not work yet', () => {
    // If one of these flips to true, the guards below start demanding a
    // working path — which is the point.
    expect(CAPABILITIES.rentPayments).toBe(false);
    expect(CAPABILITIES.creditReporting).toBe(false);
    expect(CAPABILITIES.rentInsurance).toBe(false);
    expect(CAPABILITIES.tenantScreening).toBe(false);
    expect(CAPABILITIES.conditionRecords).toBe(false);
    expect(CAPABILITIES.tenantSelfRegistration).toBe(false);
  });

  it('exposes a helper so screens ask rather than assume', () => {
    expect(can('rentPayments')).toBe(false);
    expect(can('notificationPreferences')).toBe(true);
  });
});

describe('route mounts: loading, error and empty states', () => {
  // Mount screens for real and read rendered text. Wording, wrapping and
  // nesting are irrelevant here, which is the point — a phrase list only
  // catches what someone already thought of.
  //
  // Each high-risk screen is driven through three states by mocking its
  // hooks: in flight, failed, and loaded-but-empty. The rule under test
  // is the one that kept being broken: a FAILURE must never read as a
  // reassuring financial fact.

  const REASSURANCE =
    /all settled|nothing owed|everything looks good|all caught up|nothing needs watching|coverage is working|all notices handled|0 payments/i;

  const tenantHomeMock = state => ({
    '../src/hooks/useTenantHome': () => ({
      useTenantHome: () => state,
      useTenantPayments: () => ({...state, payments: []}),
      useTenantStatement: () => ({...state, statement: undefined}),
      useTenantRepairs: () => ({...state, repairs: []}),
      useTenantChecklist: () => ({...state, checklist: undefined}),
      useTenantInsurance: () => ({...state, insurance: undefined}),
    }),
  });

  const SCREENS = [
    ['home', '../src/screens/tenant_home/home'],
    ['Receipts', '../src/screens/tenant_home/Receipts'],
    ['Deposit', '../src/screens/tenant_home/Deposit'],
    ['Insurance', '../src/screens/tenant_home/Insurance'],
  ];

  const STATES = {
    loading: {isPending: true, isRefetching: false, error: null, home: undefined},
    error: {
      isPending: false,
      isRefetching: false,
      error: new Error('network'),
      home: undefined,
    },
    empty: {isPending: false, isRefetching: false, error: null, home: {}},
  };

  for (const [name, modulePath] of SCREENS) {
    for (const [stateName, state] of Object.entries(STATES)) {
      it(`${name} renders in the ${stateName} state`, () => {
        // Rendering at all is half the assertion: these states are the
        // ones that crash when a screen assumes data.
        const text = renderIsolated(
          modulePath,
          tenantHomeMock({...state, refetch: jest.fn()}),
        );
        expect(typeof text).toBe('string');
      });
    }

    it(`${name} says nothing reassuring when the request failed`, () => {
      const text = renderIsolated(
        modulePath,
        tenantHomeMock({...STATES.error, refetch: jest.fn()}),
      );
      expect(text).not.toMatch(REASSURANCE);
    });
  }

  const UNAVAILABLE = [
    ['ChecklistRoom', '../src/screens/tenant_home/ChecklistRoom'],
    ['KycVerify', '../src/screens/tenant_home/KycVerify'],
  ];

  it.each(UNAVAILABLE)('%s renders an unavailable state', (_n, modulePath) => {
    expect(renderIsolated(modulePath)).toMatch(/not available yet/i);
  });
});

describe('the copy extractor is honest about what it could not read', () => {
  // Silently skipping an unparseable file means the sweep reports clean
  // for a file it never looked at.
  it('parses every source file', () => {
    const unreadable = [];
    for (const f of allSourceFiles()) {
      try {
        copyOf(f);
      } catch (err) {
        unreadable.push(`${f}: ${err.message.split('\n')[0]}`);
      }
    }
    expect(unreadable).toEqual([]);
  });

  it('sees text split across JSX lines', () => {
    // The exact failure that let "pay rent in two\n taps" pass.
    const {userFacingCopy} = require('./helpers/source');
    const sample = `
      const A = () => (
        <Text>
          Pay your rent in two
          taps — instant.
        </Text>
      );
    `;
    expect(userFacingCopy(sample).join(' ')).toMatch(/two taps/);
  });
});

describe('unavailable capabilities are not claimed in copy', () => {
  // Broader than the four original families, and derived from the
  // capability list rather than from memory.
  // Two escapes found in review, both fixed here and worth naming
  // because they are the general failure mode of phrase matching:
  //   · /mpesa/i did not match the live string "M-Pesa" (hyphen).
  //   · /build(ing)? … credit/ did not match "builds their own credit"
  //     (third-person verb).
  // Patterns are now written against word STEMS with optional
  // punctuation, not against remembered surface forms.
  const CLAIMS = {
    rentPayments:
      /\binstant(ly)?\b|two taps|in seconds|moment (you tap|a tenant pays)|straight to your bank|processing payment|m[-\s]?pesa|lipa na/i,
    creditReporting:
      /build\w*\s+(your |their |his |her )?(own )?credit|credit\s+reflects|reported to the bureaus?|reporting on\b|credit[-\s]reporting partner|TransUnion|Equifax/i,
    rentInsurance:
      /coverage is working|applies automatically to every unit|you.re covered|rent (is )?protected/i,
    conditionRecords:
      /we.ll (store|keep) (your |the )?(photos|record)|deductions are fair|side-by-side record/i,
  };

  // legalCopy holds DRAFT documents for capabilities that do not exist;
  // a separate test asserts no screen renders it.
  const EXEMPT = new Set(['constants/legalCopy.js']);
  const files = allSourceFiles().filter(f => !EXEMPT.has(f));

  it.each(Object.entries(CLAIMS))(
    '%s is not claimed anywhere',
    (capability, pattern) => {
      if (can(capability)) return; // capability works — claims are fine
      const offenders = files.filter(f => pattern.test(copyOf(f)));
      expect(offenders).toEqual([]);
    },
  );

  it('no screen renders the draft credit disclosure', () => {
    const offenders = allSourceFiles()
      .filter(f => f.startsWith('screens/'))
      .filter(f => readRaw(f).includes('CREDIT_REPORTING'));
    expect(offenders).toEqual([]);
  });
});

describe('removed unsafe routes stay removed', () => {
  // Comment-stripped: the removal notes necessarily name the routes they
  // removed, and matching those would fail on the explanation.
  const main = read('navigation/Main.jsx');

  it('tenant self-registration is not mounted', () => {
    // Posted to /profile/tenant (always 422), accepted unpublished
    // Terms, collected a government ID, and persisted the password and
    // ID into an unencrypted MMKV store.
    expect(main).not.toMatch(/auth__registration_/);
  });

  it('the M-Pesa payment screen is not mounted', () => {
    expect(main).not.toMatch(/invoice_make_payment/);
  });

  it('the registration screens are gone from the tree', () => {
    const left = allSourceFiles().filter(f =>
      f.startsWith('screens/authentication/registration/'),
    );
    expect(left).toEqual([]);
  });

  // NAME MATTERS. This was called "credentials are never persisted",
  // which was simply false — session tokens still persist, unencrypted.
  // A test title that overstates its guarantee is its own false-success
  // bug: it makes a reviewer believe a risk is closed.
  it('short-lived secrets are excluded from the unencrypted store', () => {
    const store = readRaw('provider/store/useGlobals.js');
    expect(store).toMatch(/partialize/);
    // Plaintext password + government ID (registration, now removed).
    expect(store).toMatch(/registering_user: undefined/);
    // Emailed account-recovery token.
    expect(store).toMatch(/reset_password: undefined/);
  });

  it('the unencrypted store is documented, not described as secure', () => {
    // Session tokens DO still persist here without an encryption key.
    // That is an open item, so it must be stated in the code and must
    // not be contradicted by any user-facing claim.
    const mmkv = readRaw('provider/store/MMKV.js');
    expect(mmkv).toMatch(/NOT ENCRYPTED AT REST/);
    expect(mmkv).toMatch(/react-native-keychain/);

    const offenders = allSourceFiles().filter(f =>
      /bank-level encryption|encrypted and sent|we encrypt/i.test(copyOf(f)),
    );
    expect(offenders).toEqual([]);
  });

  it('no credential is sent to telemetry', () => {
    const main = read('navigation/Main.jsx');
    // Was `Sentry.setUser({id: auth.access_token})` — a live bearer
    // token shipped to a third-party service every session.
    expect(main).not.toMatch(/setUser\([^)]*access_token/);
    expect(main).toMatch(/Sentry\.setUser\(\{id: profile\.userId\}\)/);
  });
});
