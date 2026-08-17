const {
  ONBOARDING_STATES,
  VILLA,
  villaOnboarding,
  villaAgreement,
} = require('../src/services/mocks/villa');

const {read} = require('./helpers/source');

// The tenant onboarding journey. The rules worth locking down are the
// ones that are easy to break by accident and expensive to get wrong:
// screening must not announce a verdict, and approval — not a finished
// background check — is what unlocks an agreement.

describe('VILLA_5_TENANTS fixture family', () => {
  it('covers all eleven states', () => {
    expect(ONBOARDING_STATES).toHaveLength(11);
    for (const state of ONBOARDING_STATES) {
      expect(villaOnboarding(state).state).toBe(state);
    }
  });

  it('tells one coherent story', () => {
    expect(VILLA.property).toBe('Cedar Grove Villa');
    expect(VILLA.landlord).toBe('Maya Patel');
    expect(VILLA.applicant).toBe('Amina Brooks');
    expect(VILLA.space).toBe('Bedroom 3');
    expect(VILLA.rentShare).toBe(1000);
    expect(VILLA.villaRent).toBe(5000);
    // Five bedrooms: the applicant plus four sitting roommates.
    expect(VILLA.roommates).toHaveLength(4);
    expect(VILLA.bedrooms).toBe(5);
  });

  it('reads liability from the agreement, not from the landlord', () => {
    // The applicant owes her own share, never the villa total.
    expect(villaAgreement.liability.yourShare).toBe(VILLA.rentShare);
    expect(villaAgreement.liability.villaRent).toBe(VILLA.villaRent);
    expect(villaAgreement.monthlyRent).toBe(VILLA.rentShare);
    expect(villaAgreement.liability.summary).toMatch(/not responsible/i);
  });

  it('falls back to a safe state for an unknown input', () => {
    expect(villaOnboarding('NONSENSE').state).toBe('INVITE_RECEIVED');
    expect(villaOnboarding().state).toBe('INVITE_RECEIVED');
  });
});

describe('screening never reports a verdict to the applicant', () => {
  // A screening OUTCOME. Note "Locked until approved" is deliberately not
  // a verdict — it describes the agreement lock, and is the required copy.
  // The rule is about what the SCREENING step and the headline claim.
  const VERDICTS = /passed|strong applicant|you.{0,3}(re)? approved|qualified|declined by/i;

  const PRE_DECISION = ONBOARDING_STATES.filter(
    // Landlord approval is a real, reportable event; screening completion
    // is not. Only states before a decision are covered here.
    s =>
      !['AGREEMENT_READY', 'AGREEMENT_SIGNATURE_PENDING', 'ONBOARDED'].includes(
        s,
      ),
  );

  it.each(PRE_DECISION)('%s announces no result in its headline', state => {
    const s = villaOnboarding(state);
    expect(s.title).not.toMatch(VERDICTS);
    expect(s.body).not.toMatch(VERDICTS);
  });

  it.each(ONBOARDING_STATES)('%s screening step states no outcome', state => {
    const screening = villaOnboarding(state).steps.find(
      x => x.key === 'screening',
    );
    // The screening row may say In progress / Complete — never a result.
    expect(screening.sub ?? '').not.toMatch(
      /passed|failed|approved|declined|strong|weak|good|poor|score/i,
    );
  });

  it('says screening is complete and with the landlord', () => {
    const s = villaOnboarding('LANDLORD_REVIEW');
    expect(s.title).toBe('Screening complete — your landlord is reviewing it');
    expect(s.steps.find(x => x.key === 'screening').state).toBe('done');
    // …while the decision itself is still outstanding.
    expect(s.steps.find(x => x.key === 'review').state).toBe('waiting');
  });
});

describe('the agreement unlocks only on explicit landlord approval', () => {
  const BEFORE_APPROVAL = [
    'INVITE_RECEIVED',
    'ABOUT_YOU_REQUIRED',
    'IDENTITY_REQUIRED',
    'SCREENING_CONSENT_REQUIRED',
    'SCREENING_IN_PROGRESS',
    'SCREENING_NEEDS_INFORMATION',
    'LANDLORD_REVIEW',
    'ADVERSE_ACTION',
  ];

  it.each(BEFORE_APPROVAL)('%s has no agreement to sign', state => {
    // Absence is the lock: there is no boolean a bug could flip early.
    expect(villaOnboarding(state).agreement).toBeNull();
    expect(villaOnboarding(state).steps.find(s => s.key === 'agreement').state)
      .not.toBe('active');
  });

  it('a completed background check alone does not unlock it', () => {
    const s = villaOnboarding('LANDLORD_REVIEW');
    expect(s.steps.find(x => x.key === 'screening').state).toBe('done');
    expect(s.agreement).toBeNull();
    expect(s.steps.find(x => x.key === 'agreement').sub).toBe(
      'Locked until approved',
    );
  });

  it.each(['AGREEMENT_READY', 'AGREEMENT_SIGNATURE_PENDING', 'ONBOARDED'])(
    '%s carries the agreement',
    state => {
      expect(villaOnboarding(state).agreement).toMatchObject({
        agreementId: villaAgreement.agreementId,
      });
    },
  );
});

describe('tenant tabs stay hidden until onboarding succeeds', () => {
  it('only a confirmed ONBOARDED state completes', () => {
    for (const state of ONBOARDING_STATES) {
      expect(villaOnboarding(state).complete).toBe(state === 'ONBOARDED');
    }
  });

  it('BottomNav renders the onboarding stack when not onboarded', () => {
    const nav = read('navigation/BottomNav.jsx');
    expect(nav).toMatch(/useOnboarding/);
    expect(nav).toMatch(/!onboarded/);
    expect(nav).toMatch(/return <OnboardingStack \/>/);
  });

  it('an unknown status is not treated as onboarded', () => {
    const hook = read('hooks/useOnboarding.js');
    // Must require isSuccess, not merely the absence of an error.
    expect(hook).toMatch(/onboarded: isSuccess && OnboardingServices\.isOnboarded/);
  });

  it('the applicant stack exposes only the journey, Help and Sign out', () => {
    const stack = read('navigation/OnboardingStack.jsx');
    for (const forbidden of ['home_stack', 'pay_stack', 'my_home_stack']) {
      expect(stack).not.toMatch(new RegExp(forbidden));
    }
    expect(stack).toMatch(/help/);
  });
});

describe('demo mode is labelled and collects nothing sensitive', () => {
  it('every demo state is flagged', () => {
    for (const state of ONBOARDING_STATES) {
      expect(villaOnboarding(state).demo).toBe(true);
    }
  });

  it('the checklist and screening screens show the demo banner', () => {
    for (const rel of [
      'screens/onboarding/OnboardingChecklist.jsx',
      'screens/onboarding/ScreeningStep.jsx',
    ]) {
      expect(read(rel)).toMatch(/Demo — no screening report is being pulled/);
    }
  });

  it('About you asks for no SSN, DOB or identity document', () => {
    const about = read('screens/onboarding/AboutYou.jsx');
    for (const field of ['ssn', 'SSN', 'dateOfBirth', 'dob', 'secureTextEntry']) {
      expect(about).not.toMatch(new RegExp(field));
    }
  });

  it('onboarding writes never reach the network in Fixtures mode', () => {
    const svc = read('services/OnboardingServices.js');
    // Each mutation guards before its axios call.
    const mutations = svc.split('const ').filter(f => /AxiosUtility\.(post|patch)/.test(f));
    expect(mutations.length).toBeGreaterThan(0);
    for (const fn of mutations) {
      expect(fn.indexOf('blockedInFixtureMode')).toBeLessThan(
        fn.search(/AxiosUtility\.(post|patch)/),
      );
    }
  });

  it('live status is never fabricated', () => {
    const svc = read('services/OnboardingServices.js');
    const getStatus = svc.slice(svc.indexOf('const getStatus'), svc.indexOf('giveScreeningConsent'));
    // No fixture fallback on the live path — a fabricated "approved"
    // would tell someone they had a home.
    expect(getStatus).not.toMatch(/mockFallback|isEndpointUnavailable/);
  });
});

describe('waiting states do not ask the applicant to poll', () => {
  it.each(['SCREENING_IN_PROGRESS', 'LANDLORD_REVIEW', 'AGREEMENT_SIGNATURE_PENDING'])(
    '%s is marked as waiting and offers no action',
    state => {
      expect(villaOnboarding(state).waiting).toBe(true);
    },
  );

  it('the checklist tells them they can close the app', () => {
    const screen = read('screens/onboarding/OnboardingChecklist.jsx');
    expect(screen).toMatch(
      /You can close the app\. We’ll notify you when your status changes\./,
    );
    expect(screen).not.toMatch(/label="Refresh"/);
  });
});

describe('the invite opens the journey, not a sign-in', () => {
  it('the claim CTA navigates into onboarding, carrying the invite', () => {
    // WAS A SOURCE GREP, and a false one. It took a 900-character window
    // around "Set up my account" and matched /onboarding/ — which the
    // surrounding COMMENT satisfies. Repointing the CTA at a nonexistent
    // route left it green; that was verified by mutation, not assumed.
    //
    // This renders the screen with a resolved invite (the CTA does not
    // exist without one), presses the actual control, and asserts where
    // it went.
    const navigate = jest.fn();
    const invite = {
      token: 'inv_1',
      property: 'Cedar Grove Villa',
      unit: 'Bedroom 3',
      landlord: 'Maya Patel',
      tenantName: 'Amina Brooks',
      rent: 1000,
    };

    jest.resetModules();
    jest.doMock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({navigate, goBack: jest.fn()}),
      useRoute: () => ({params: {invite}}),
      useIsFocused: () => true,
    }));

    // eslint-disable-next-line global-require
    const React = require('react');
    // eslint-disable-next-line global-require
    const renderer = require('react-test-renderer');
    const ClaimLanding =
      // eslint-disable-next-line global-require
      require('../src/screens/authentication/ClaimLanding').default;

    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(ClaimLanding));
    });

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
    const cta = tree.root
      .findAll(n => typeof n.props?.onPress === 'function')
      .find(n => textOf(n).includes('Set up my account'));

    // If the control is not on screen, fail loudly rather than assert
    // nothing — that silence is what the old test was made of.
    expect(cta).toBeDefined();

    renderer.act(() => cta.props.onPress());

    expect(navigate).toHaveBeenCalledWith(
      'onboarding',
      expect.objectContaining({
        screen: 'onboarding__checklist',
        params: {invite},
      }),
    );
  });

  it('an unauthenticated invite deep link preserves the code', () => {
    const handler = read('hooks/useDeepLinkUrlHandler.js');
    expect(handler).toMatch(/url\.includes\('claim'\)/);
    expect(handler).toMatch(/auth__claim/);
  });
});
