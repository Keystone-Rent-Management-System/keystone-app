const fs = require('fs');
const path = require('path');

// Guards for the 2026-07-31 truth-and-safety batch (UI_UX_REVIEW_2026-07-30
// P0-01, P0-03, P0-05, P0-08).
//
// These are source-level assertions rather than render tests on purpose.
// The defects they cover were never crashes or failed renders — every one
// of them looked perfect on screen. What made them dangerous was the
// *absence* of a request behind a confirmation, which only the source
// shows. A render test would have passed against all of them.

const {
  SRC,
  allSourceFiles,
  stripComments,
  read,
  readRaw,
} = require('./helpers/source');

// Any file that tells the user something happened.
const SUCCESS_CLAIM =
  /toast\.show\(\s*[`'"][^`'"]*(sent|submitted|saved|accepted|paid|notified|updated|on file)/i;

// …but a keyword is not a claim.
//
// Wiring SUCCESS_CLAIM up produced seven hits, and ALL SEVEN were honest
// failure messages that happen to contain one of those words:
//
//   "We couldn't send your notice — …. Nothing was sent."
//   "Signed out on this device, but we could not erase the saved session."
//
// Those are exactly the copy this suite exists to encourage. A detector
// that flags them would train someone to delete good messages, so the
// negated forms are excluded here. This narrows the DETECTOR, not the
// sweep: every file is still examined, and the mutation test below proves
// a genuine false success is still caught.
// The claim words on their own, for testing an EXTRACTED message.
//
// `SUCCESS_CLAIM` above bakes in the literal `toast.show(` prefix, so it
// cannot match a message once it has been pulled out of its call — which
// is why the Alert.alert and variable-message injections both escaped a
// detector that already "handled" them. Caught by mutation.
const CLAIM_WORDS =
  /(sent|submitted|saved|accepted|paid|notified|updated|on file)/i;

const NEGATED =
  /(couldn|could not|cannot|can't|wasn|was not|weren|were not|not been|nothing was|didn|did not|failed|unable)/i;

/**
 * Is this message a success claim?
 *
 * Negation is scoped to the CLAUSE containing the claim word, not to the
 * whole message. Testing the whole string meant one negated word
 * anaesthetised everything after it:
 *
 *   "Your repair request was sent — you no longer need to wait."
 *
 * escaped, because "no longer" sat in a different clause from "sent".
 * That is the same whole-scope mistake as the catch-body version, one
 * level down.
 *
 * WHAT THIS STILL DOES NOT CATCH, stated rather than papered over:
 *   · negation carried across a clause boundary
 *     ("We didn't reach the office. Your message was sent.")
 *   · a claim expressed without any of the keywords
 *     ("You're all set", "That's taken care of")
 *   · a message assembled at runtime from non-literal parts
 *
 * A keyword detector cannot close those. It is a net, not a proof — the
 * behavioural tests above it are what actually hold the invariant.
 */
const isSuccessClaim = text => {
  // Split on clause boundaries: sentence ends, dashes, semicolons.
  const clauses = String(text).split(/[.!?;]|\s[—–-]\s/);
  return clauses.some(
    clause => CLAIM_WORDS.test(clause) && !NEGATED.test(clause),
  );
};

describe('payment cannot fabricate a receipt (P0-01)', () => {
  const payRent = read('screens/tenant_home/PayRent.jsx');

  it('does not mint a confirmation code on the device', () => {
    // The original built one from Date.now() and passed it to the receipt.
    expect(payRent).not.toMatch(/const code\s*=/);
    expect(payRent).not.toMatch(/Date\.now\(\)/);
  });

  it('does not navigate to a receipt', () => {
    expect(payRent).not.toMatch(/rent_receipt/);
  });

  // Stronger than the original assertion, which only required the CTA to
  // be disabled. A disabled pay button on a checkout screen still presents
  // itself as a checkout; the screen is now read-only rent details.
  it('has no pay CTA at all', () => {
    expect(payRent).not.toMatch(/PrimaryButton/);
    expect(payRent).not.toMatch(/stickyFooter/);
  });

  it('does not present an authorization for a debit it cannot initiate', () => {
    expect(payRent).not.toMatch(/ConsentBlock/);
    expect(payRent).not.toMatch(/oneTimeMandate|regE/);
  });
});

describe('stubbed actions are disabled, not confirmed (P0-03)', () => {
  // Each of these claimed success with no request behind it.
  const cases = [
    ['screens/tenant_home/KycVerify.jsx', 'Identity submitted'],
    ['screens/tenant_home/Insurance.jsx', 'Proof submitted'],
    ['screens/tenant_home/Autopay.jsx', 'Autopay on'],
    ['screens/tenant_home/Credit.jsx', 'Rent reporting on'],
  ];

  it.each(cases)('%s no longer claims "%s"', (file, claim) => {
    expect(read(file)).not.toContain(claim);
  });

  it.each(cases)('%s contains no empty try block', file => {
    // `try { } catch` with nothing in the try was the tell for a stub
    // that still reported success.
    expect(read(file)).not.toMatch(/try\s*\{\s*(\/\/[^\n]*\n\s*)*\}\s*catch/);
  });

  it('screening offer/decline are disabled', () => {
    const report = read('screens/landlord_home/screening/ScreeningReport.jsx');
    expect(report).not.toContain('Adverse-action notice will be sent');
    expect(report).toMatch(/label="Decline"[^/]*disabled/s);
  });
});

describe('wired actions surface failure instead of swallowing it (P0-03)', () => {
  // These DO call a service. The bug was catching the error and then
  // reporting success anyway.
  const wired = [
    'screens/tenant_home/MoveOut.jsx',
    'screens/tenant_home/Help.jsx',
    'screens/tenant_home/ReportRepair.jsx',
    'screens/tenant_home/Lease.jsx',
  ];

  it.each(wired)('%s returns early from catch before any success', file => {
    const src = read(file);
    const catches = [...src.matchAll(/\}\s*catch\s*\([^)]*\)\s*\{([\s\S]*?)\n\s{2,4}\}/g)];
    expect(catches.length).toBeGreaterThan(0);
    for (const [, body] of catches) {
      // A catch must not fall through into the success path.
      expect(body).toMatch(/return;/);
      // ...and must actually tell the user.
      expect(body).toMatch(/toast\.show|Alert\.alert/);
    }
  });

  it.each(wired)('%s has no comment-only catch', file => {
    expect(read(file)).not.toMatch(
      /catch\s*\([^)]*\)\s*\{\s*(\/\/[^\n]*\n\s*)+\}/,
    );
  });
});

describe('compliance notices cannot be sent by a review action (P0-08)', () => {
  const compliance = read('screens/landlord_home/Compliance.jsx');

  it('has no send mutation wired to a control', () => {
    expect(compliance).not.toMatch(/sendMut/);
    expect(compliance).not.toMatch(/useSendComplianceNotice/);
  });

  it('no longer offers "Review draft" or "Skip increase"', () => {
    expect(compliance).not.toMatch(/label="Review draft"/);
    expect(compliance).not.toMatch(/label="Skip increase"/);
  });
});

describe('need-more-time cannot route to full payment (P0-05)', () => {
  const payHub = read('screens/tenant_home/PayHub.jsx');

  it('does not navigate to pay_rent with an unread flex flag', () => {
    expect(payHub).not.toMatch(/flex:\s*true/);
  });

  it('no longer offers the split/partial row', () => {
    expect(payHub).not.toContain('Split this month or pay part now');
  });
});

describe('no implementation language reaches the user', () => {
  const BANNED = [
    'BE support',
    'endpoint not yet shipped',
    'keystone.example',
    'coming soon',
  ];

  const walk = dir =>
    fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return /\.(js|jsx|ts|tsx)$/.test(e.name) ? [full] : [];
    });

  // mocks/ is fixture data for debug builds, never shown in a live build.
  const files = walk(SRC).filter(f => !f.includes(`${path.sep}mocks${path.sep}`));

  it.each(BANNED)('no source file contains %p', phrase => {
    const offenders = files.filter(f =>
      stripComments(fs.readFileSync(f, 'utf8'))
        .toLowerCase()
        .includes(phrase.toLowerCase()),
    );
    expect(offenders.map(f => path.relative(SRC, f))).toEqual([]);
  });
});

describe('fixtures never reach a live mutation (P0-06)', () => {
  // The first version of this suite only checked mark-as-read, which is
  // why repairs, complaints and notices-to-vacate still wrote to the live
  // gateway from a fixture-populated screen. Enumerate instead: find every
  // mutating call in the service layer and require a guard above it, so a
  // service added tomorrow is covered without editing this test.
  const SERVICES = path.join(SRC, 'services');

  const serviceFiles = fs
    .readdirSync(SERVICES)
    .filter(f => /\.(js|ts)$/.test(f))
    // Auth must reach the real identity provider in every mode — a faked
    // sign-in would be its own false-success bug.
    .filter(f => f !== 'AuthServices.js');

  // AST, not regex. Two text-matching attempts already missed real
  // mutations: the first looked for `AxiosUtility.post(` and never saw the
  // config-object form, and the line-scanning version could not span
  //     AxiosUtility({
  //       url: …,
  //       method: 'POST',
  //     })
  // which is how requestRepair and allocatePayments issue writes — so a
  // live POST sat unguarded while the suite was green. Walking the tree
  // finds a call however it is spelled or wrapped.
  const {parse} = require('@babel/parser');
  const WRITE_METHODS = ['post', 'put', 'patch', 'delete'];

  const findMutations = src => {
    const ast = parse(src, {
      sourceType: 'module',
      errorRecovery: true,
      plugins: ['jsx', 'typescript'],
    });
    const found = [];

    // Walk every node; collect calls that write via AxiosUtility, and
    // remember the innermost enclosing function so we can inspect its body.
    const walk = (node, fnStack) => {
      if (!node || typeof node.type !== 'string') return;

      const isFn = /Function(Declaration|Expression)|ArrowFunctionExpression/.test(
        node.type,
      );
      const stack = isFn ? [...fnStack, node] : fnStack;

      const callee = node.type === 'CallExpression' ? node.callee : null;
      if (callee) {
        // AxiosUtility.post(…) / .put / .patch / .delete
        const isMember =
          callee.type === 'MemberExpression' &&
          callee.object?.name === 'AxiosUtility' &&
          WRITE_METHODS.includes(callee.property?.name);

        // AxiosUtility({ method: 'POST', … }) — any casing, any position.
        let isConfig = false;
        if (callee.type === 'Identifier' && callee.name === 'AxiosUtility') {
          const arg = node.arguments?.[0];
          const method = arg?.properties?.find(
            p => p.key?.name === 'method' || p.key?.value === 'method',
          );
          const verb = String(method?.value?.value ?? '').toLowerCase();
          isConfig = WRITE_METHODS.includes(verb);
        }

        if (isMember || isConfig) {
          found.push({
            node,
            line: node.loc?.start.line,
            fn: stack[stack.length - 1],
            verb: isMember ? callee.property.name : 'config',
          });
        }
      }

      for (const key of Object.keys(node)) {
        if (key === 'loc' || key === 'leadingComments') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(c => walk(c, stack));
        else if (child && typeof child.type === 'string') walk(child, stack);
      }
    };

    walk(ast.program, []);
    return found;
  };

  // Presence is not enough — POSITION is the property that matters.
  // Searching the whole function body for "blockedInFixtureMode" passes a
  // guard written AFTER the network call, or one buried in an unrelated
  // branch, neither of which prevents anything. So: find the top-level
  // statement of the enclosing function that contains the mutation, and
  // require an earlier top-level statement that both mentions the guard
  // and returns. Scoping to top-level statements is what rules out a
  // guard tucked inside some other `if`.
  const guardsBefore = (src, mutation) => {
    const fn = mutation.fn;
    const body = fn?.body;
    // An expression-bodied arrow has no statements, so nothing can guard.
    if (!body || body.type !== 'BlockStatement') return false;

    const idx = body.body.findIndex(
      st => st.start <= mutation.node.start && st.end >= mutation.node.end,
    );
    if (idx <= 0) return false;

    const preceding = body.body.slice(0, idx);

    // Names bound from blockedInFixtureMode(...) in preceding statements.
    const guardNames = new Set();
    for (const st of preceding) {
      if (st.type !== 'VariableDeclaration') continue;
      for (const d of st.declarations) {
        if (src.slice(d.start, d.end).includes('blockedInFixtureMode')) {
          if (d.id?.name) guardNames.add(d.id.name);
        }
      }
    }

    // The guard must be an UNCONDITIONAL early return at this level: an
    // `if` whose TEST is the guard itself, that returns. Checking only
    // that some preceding statement mentions the guard would accept one
    // buried in `if (somethingElse) { ...guard... }`, which leaves the
    // call reachable on every other path.
    return preceding.some(st => {
      if (st.type !== 'IfStatement') return false;
      const test = src.slice(st.test.start, st.test.end);
      const isGuardTest =
        guardNames.has(test.trim()) || test.includes('USE_MOBILE_MOCKS');
      if (!isGuardTest) return false;
      return src.slice(st.consequent.start, st.consequent.end).includes('return');
    });
  };

  it('every mutating service call sits behind a fixture guard', () => {
    const unguarded = [];

    for (const file of serviceFiles) {
      const src = fs.readFileSync(path.join(SERVICES, file), 'utf8');
      for (const mutation of findMutations(src)) {
        if (!guardsBefore(src, mutation)) {
          unguarded.push(`${file}:${mutation.line} (${mutation.verb})`);
        }
      }
    }

    expect(unguarded).toEqual([]);
  });

  it('rejects a guard written after the network call', () => {
    const src = `
      import AxiosUtility from './AxiosServices';
      import {blockedInFixtureMode} from './fixtureGuard';
      const send = async () => {
        const {data} = await AxiosUtility.post('/x');
        const blocked = blockedInFixtureMode('POST /x');
        if (blocked) return blocked;
        return data;
      };
    `;
    const [mutation] = findMutations(src);
    expect(mutation).toBeDefined();
    expect(guardsBefore(src, mutation)).toBe(false);
  });

  it('rejects a guard buried in an unrelated branch', () => {
    const src = `
      import AxiosUtility from './AxiosServices';
      import {blockedInFixtureMode} from './fixtureGuard';
      const send = async flag => {
        if (flag) {
          const blocked = blockedInFixtureMode('POST /x');
          if (blocked) return blocked;
        }
        const {data} = await AxiosUtility.post('/x');
        return data;
      };
    `;
    const [mutation] = findMutations(src);
    // The guard only protects the `flag` path; the call is still reachable.
    expect(guardsBefore(src, mutation)).toBe(false);
  });

  it('accepts a correct early-return guard', () => {
    const src = `
      import AxiosUtility from './AxiosServices';
      import {blockedInFixtureMode} from './fixtureGuard';
      const send = async () => {
        const blocked = blockedInFixtureMode('POST /x');
        if (blocked) return blocked;
        const {data} = await AxiosUtility.post('/x');
        return data;
      };
    `;
    const [mutation] = findMutations(src);
    expect(guardsBefore(src, mutation)).toBe(true);
  });

  it('the detector sees the config-object form, not just dot-calls', () => {
    // Regression guard for the detector itself — this is the shape that
    // slipped through twice.
    const sample = `
      import AxiosUtility from './AxiosServices';
      const send = async fd =>
        await AxiosUtility({url: '/x', method: 'POST', data: fd});
    `;
    expect(findMutations(sample)).toHaveLength(1);
  });

  it('the detector covers every write verb', () => {
    const sample = `
      import AxiosUtility from './AxiosServices';
      const a = () => AxiosUtility.post('/a');
      const b = () => AxiosUtility.put('/b');
      const c = () => AxiosUtility.patch('/c');
      const d = () => AxiosUtility.delete('/d');
      const e = () => AxiosUtility.get('/e');
    `;
    expect(findMutations(sample).map(m => m.verb)).toEqual([
      'post',
      'put',
      'patch',
      'delete',
    ]);
  });

  it('the guard actually short-circuits before the network', () => {
    const g = read('services/fixtureGuard.js');
    expect(g).toMatch(/if \(!USE_MOBILE_MOCKS\) \{\s*return null;/);
    expect(g).toMatch(/return Promise\.resolve\(/);
  });

  it('mark-as-read short-circuits in Fixtures mode', () => {
    const svc = read('services/Notification.ts');
    const fn = svc.slice(svc.indexOf('export const markNotificationRead'));
    // The USE_MOBILE_MOCKS guard must come before the axios call, or
    // fixture ids ('n1') get PATCHed at the real gateway.
    expect(fn.indexOf('USE_MOBILE_MOCKS')).toBeGreaterThan(-1);
    expect(fn.indexOf('USE_MOBILE_MOCKS')).toBeLessThan(fn.indexOf('AxiosUtility.patch'));
  });

  it('switching data source clears the cache rather than invalidating', () => {
    const more = read('screens/more/more.jsx');
    const fn = more.slice(more.indexOf('const setDataSource ='), more.indexOf('// Live state'));
    expect(fn).toMatch(/queryClient\.clear\(\)/);
    expect(fn).not.toMatch(/invalidateQueries/);
  });
});

describe('an unknown compliance state is never an all-clear (P0-F1)', () => {
  it('the alerts hook exposes error and success rather than masking them', () => {
    const hook = read('hooks/useCompliance.js');
    expect(hook).toMatch(/error/);
    expect(hook).toMatch(/loaded: isSuccess/);
  });

  it('the reassuring copy is gated on a successful load', () => {
    const screen = read('screens/landlord_home/Compliance.jsx');
    expect(screen).toMatch(/const canReassure = loaded && !error;/);
    // "All notices handled" must sit behind canReassure, not behind an
    // empty array — an empty list is also what a 404 produces.
    const heroStart = screen.indexOf('All notices handled');
    expect(heroStart).toBeGreaterThan(-1);
    const guardBefore = screen.lastIndexOf('!canReassure', heroStart);
    expect(guardBefore).toBeGreaterThan(-1);
  });

  it('the simulated-success sender is gone', () => {
    expect(read('services/ComplianceServices.js')).not.toMatch(/sendNotice/);
    expect(read('hooks/useCompliance.js')).not.toMatch(
      /useSendComplianceNotice/,
    );
  });
});

describe('consent and PII are not solicited for absent features (P0-F4)', () => {
  it('KYC collects nothing', () => {
    const kyc = read('screens/tenant_home/KycVerify.jsx');
    for (const field of ['ssn', 'FormField', 'DatePicker', 'secureTextEntry']) {
      expect(kyc).not.toMatch(new RegExp(field));
    }
  });

  it('KYC makes no claim about where an SSN is sent', () => {
    expect(readRaw('screens/tenant_home/KycVerify.jsx')).not.toMatch(
      /sent only to Dwolla/,
    );
  });

  it('the add-a-bank entry point no longer opens the consent funnel', () => {
    const pm = read('screens/tenant_home/PaymentMethods.jsx');
    expect(pm).not.toMatch(/onPress=\{\(\) => setShowTos\(true\)\}/);
  });

  it('screening consent cannot report a started screening', () => {
    const sc = read('screens/landlord_home/screening/ScreeningConsent.jsx');
    expect(sc).not.toMatch(/Screening started/);
    expect(sc).toMatch(/label="Run my screening" disabled/);
  });
});

describe('unavailable features are explained, not simulated', () => {
  it('Autopay exposes no configuration controls', () => {
    const a = read('screens/tenant_home/Autopay.jsx');
    for (const control of [
      'SegmentedChoice', // day-of-month picker
      'setDay', // 1–28 day strip
      'setMethodId', // payment-method picker
      'setEnabled', // local on/off
    ]) {
      expect(a).not.toMatch(new RegExp(control));
    }
  });

  it('Autopay makes no unsupported outcome promises', () => {
    const a = readRaw('screens/tenant_home/Autopay.jsx');
    // Rendered copy only — the comment block explains what was removed.
    const rendered = read('screens/tenant_home/Autopay.jsx');
    expect(rendered).not.toMatch(/credit reported/i);
    expect(rendered).not.toMatch(/never retry silently/i);
    expect(rendered).not.toMatch(/automatically\./);
    expect(a).toMatch(/Not available yet/);
  });

  it('Credit collects no consent and names no bureau or partner', () => {
    const c = read('screens/tenant_home/Credit.jsx');
    expect(c).not.toMatch(/ConsentBlock/);
    expect(c).not.toMatch(/setConsent/);
    expect(c).not.toMatch(/TransUnion|Equifax|Experian/);
    expect(c).not.toMatch(/credit-reporting partner/);
    // The dispute route depends on a furnisher that does not exist.
    expect(c).not.toMatch(/disputeCta|disputeUrl/);

    // Follow the IMPORTED copy too. A screen can name a bureau without
    // the word appearing in its own JSX — Credit rendered
    // CREDIT_REPORTING.disclosure, which names TransUnion and Equifax
    // from constants/legalCopy. Checking only this file passed while the
    // claim was still on screen, so assert the screen does not render
    // that copy at all while reporting is unavailable.
    expect(c).not.toMatch(/CREDIT_REPORTING/);
  });

  it('PayRent is a read-only details screen', () => {
    const pr = read('screens/tenant_home/PayRent.jsx');
    expect(pr).not.toMatch(/ConsentBlock/); // no ACH authorization
    expect(pr).not.toMatch(/ACH/);
    expect(pr).not.toMatch(/YOU'RE PAYING/);
    expect(pr).not.toMatch(/paying today/);
    expect(pr).not.toMatch(/PrimaryButton/); // no pay CTA at all
    expect(pr).not.toMatch(/instantly/);
  });

  it('PaymentMethods has no dead consent funnel', () => {
    const pm = read('screens/tenant_home/PaymentMethods.jsx');
    expect(pm).not.toMatch(/showTos/);
    expect(pm).not.toMatch(/ConsentBlock/);
    expect(pm).not.toMatch(/DWOLLA/);
    expect(pm).not.toMatch(/kyc_verify/);
  });

  it('ScreeningConsent has no interactive consent apparatus', () => {
    const sc = read('screens/landlord_home/screening/ScreeningConsent.jsx');
    expect(sc).not.toMatch(/ConsentBlock/);
    expect(sc).not.toMatch(/setAgreed/);
    expect(sc).not.toMatch(/StepDone/); // hardcoded completion checkmarks
    expect(sc).not.toMatch(/Summary of your FCRA rights/); // dead link
    // The explanation must remain readable...
    expect(sc).toMatch(/INFO_COPY/);
    // ...but must not read as an authorization already given. Removing
    // the checkbox left "By continuing, you authorize Keystone…" behind,
    // on a screen titled "Your consent", with no continuation and nothing
    // stored — which is arguably worse than the checkbox was.
    expect(sc).not.toMatch(/you authorize/i);
    expect(sc).not.toMatch(/title="Your consent"/);
  });
});

describe('unavailable capabilities are not advertised anywhere', () => {
  // REPO-WIDE, and reading COPY rather than raw source.
  //
  // The previous version of this suite failed for two reasons that
  // between them hid a dozen live claims:
  //   1. It matched raw text, so a phrase wrapped across JSX lines
  //      ("pay rent in two{newline}taps") contained no "two taps"
  //      substring and passed.
  //   2. It used a six-file allowlist, so landlord screens, receipts,
  //      the credit screens, notification settings and the fixtures were
  //      never looked at.
  // `copyOf` normalises whitespace and returns only what a reader sees,
  // which makes a whole-repo sweep practical.
  const {allSourceFiles, copyOf} = require('./helpers/source');

  const CLAIMS = [
    [
      'instant settlement',
      /\binstant(ly)?\b|in seconds|two taps|moment you tap|instantly and permanently/i,
    ],
    [
      'credit reporting',
      /build(ing)? credit|reported to the bureaus?|credit[- ]reporting partner|TransUnion|Equifax/i,
    ],
    ['insurance in force', /coverage is working|applies automatically to every unit/i],
    ['adverse action handled for you', /Keystone sends it/i],
  ];

  // legalCopy holds DRAFT documents for capabilities that do not exist.
  // It is allowed to describe them — what matters is that no screen
  // renders it, which the next test asserts directly.
  const EXEMPT = new Set(['constants/legalCopy.js']);

  const files = allSourceFiles().filter(f => !EXEMPT.has(f));

  it.each(CLAIMS)('no file promises %s', (_label, pattern) => {
    const offenders = [];
    for (const f of files) {
      let copy;
      try {
        copy = copyOf(f);
      } catch {
        continue; // unparseable file — other suites will catch it
      }
      if (pattern.test(copy)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });

  it('no screen renders the draft credit disclosure', () => {
    const offenders = allSourceFiles()
      .filter(f => f.startsWith('screens/'))
      .filter(f => readRaw(f).includes('CREDIT_REPORTING'));
    expect(offenders).toEqual([]);
  });

  it('Home offers no Pay CTA', () => {
    const home = read('screens/tenant_home/home.jsx');
    expect(home).not.toMatch(/label: `Pay rent/);
    expect(home).toMatch(/View rent details/);
  });

  it('Welcome shows no fabricated money-landed moment', () => {
    const welcome = read('screens/authentication/Welcome.jsx');
    // A count-up to a specific amount behind a live "Instant" dot reads
    // as a payment that just settled.
    expect(welcome).not.toMatch(/useCountUp|Landed in your bank|Rent received/);
    expect(welcome).not.toMatch(/Dwolla|Plaid/);
  });
});

describe('absence of data is never presented as a working capability', () => {
  it('landlord insurance does not assert coverage it cannot confirm', () => {
    const ins = read('screens/landlord_home/Insurance.jsx');
    // An "Active" badge plus an insured-unit count derived from `?? 0`
    // told a landlord their rent was insured, when BE answers 501 and no
    // insurer partner exists. Absence of data is not evidence of cover.
    expect(ins).toMatch(/hasCoverage/);
    expect(ins).toMatch(/status === 'ACTIVE'/);
    expect(ins).not.toMatch(/coverage is working quietly/);
  });

  it('condition records are not captured to nowhere', () => {
    const room = read('screens/tenant_home/ChecklistRoom.jsx');
    // The collection form exists again — the demo journey promises
    // `conditionRecords`, and a promised step that renders only an
    // apology is a broken journey. What must stay true for every REAL
    // build: the capability-off path returns before any collection
    // control can mount. This pins the gate to an early return so a
    // refactor cannot quietly move collection above it; what each side
    // of the gate actually renders is proven behaviourally in
    // checklistRoom.test.js.
    expect(room).toMatch(/if \(!can\('conditionRecords'\)\)/);
    expect(read('screens/tenant_home/Checklist.jsx')).not.toMatch(
      /both you and your landlord get the side-by-side/,
    );
  });

  it('notification preferences are actually written', () => {
    const prefs = read('screens/tenant_home/NotificationPrefs.jsx');
    // `persist` was an empty function; every switch was cosmetic.
    expect(prefs).not.toMatch(/const persist = \(\) => \{\};/);
    expect(prefs).toMatch(/updateNotificationPrefs/);
    // A failed write must revert the control rather than leave the UI
    // asserting a preference the server never accepted.
    expect(prefs).toMatch(/revert\(\)/);
  });

  it('screening reads fixtures through the demo gate', () => {
    for (const rel of [
      'screens/landlord_home/screening/Screening.jsx',
      'screens/landlord_home/screening/ScreeningReport.jsx',
    ]) {
      const src = read(rel);
      expect(src).toMatch(/demoOnly\(mockScreening\)/);
      // A direct fixture read renders invented applicants and consumer
      // reports about named people in a LIVE build.
      expect(src).not.toMatch(/mockScreening\.(reports|applications|unit)/);
    }
  });

  it('renters insurance does not collect policy details it cannot send', () => {
    const ins = read('screens/tenant_home/Insurance.jsx');
    for (const f of ['FormField', 'PhotoCaptureTile', 'setCarrier', 'DatePicker']) {
      expect(ins).not.toMatch(new RegExp(f));
    }
  });
});

describe('an account with no tenancy is not given a $0 obligation', () => {
  it.each([
    'screens/tenant_home/PayRent.jsx',
    'screens/tenant_home/PayHub.jsx',
    'screens/tenant_home/home.jsx',
  ])('%s branches on a real tenancy', file => {
    const src = read(file);
    expect(src).toMatch(/hasTenancy/);
    expect(src).toMatch(/No active tenancy/);
  });

  it('the period is not derived from today when there is no due date', () => {
    // `periodLabel(rent.dueDate ?? new Date())` invented a current-month
    // obligation for an account with no lease.
    expect(read('screens/tenant_home/PayRent.jsx')).not.toMatch(
      /periodLabel\(rent\.dueDate \?\? new Date\(\)\)/,
    );
  });
});

describe('loading is distinct from failure (P0-F7)', () => {
  it('Compliance shows a checking state before the request resolves', () => {
    const c = read('screens/landlord_home/Compliance.jsx');
    const hero = c.slice(c.indexOf('<HeroCard'), c.indexOf('/>', c.indexOf('<HeroCard')));
    expect(hero).toMatch(/isPending/);
    // "Status unavailable" must sit behind isPending, not in front of it.
    expect(hero.indexOf('isPending')).toBeLessThan(
      hero.indexOf('Status unavailable'),
    );
  });

  it('the error strip is suppressed while the first load is in flight', () => {
    expect(read('screens/landlord_home/Compliance.jsx')).toMatch(
      /loadError=\{!isPending && error\}/,
    );
  });
});

describe('one canonical rent period (P0-04)', () => {
  it('checkout derives the period once and reuses it', () => {
    const pr = read('screens/tenant_home/PayRent.jsx');
    expect(pr).toMatch(/const period = rent\.periodLabel \?\?/);
    // The hero must not re-derive from dueDate independently.
    expect(pr).not.toMatch(/periodLabel\(rent\.dueDate \?\? new Date\(\)\)\}`/);
  });

  it('hub and checkout use the same source', () => {
    expect(read('screens/tenant_home/PayHub.jsx')).toMatch(
      /const period = rent\.periodLabel \?\?/,
    );
  });
});

describe('release builds cannot serve fixtures', () => {
  it('the endpoint-unavailable gate is bound to Fixtures mode', () => {
    const src = read('services/unavailable.js');
    const fn = src.slice(src.indexOf('export const isEndpointUnavailable'));
    expect(fn).toMatch(/if \(!USE_MOBILE_MOCKS\) \{\s*return false;/);
  });

  it('the data source resolver is __DEV__ gated', () => {
    expect(read('provider/store/devDataSource.ts')).toMatch(
      /__DEV__ \? useDataSourceStore\.getState\(\)\.source : 'live'/,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────
// THE SWEEP THAT WAS WRITTEN AND NEVER WIRED.
//
// `SUCCESS_CLAIM` was defined at the top of this file, commented "Any
// file that tells the user something happened", and then never referenced
// by a single assertion. The actual coverage was a four-file allowlist
// over 23 `onSuccess` handlers in 17 files — which is how a green suite
// sat over seven blockers.
//
// These are repo-wide and allowlist-free. A new screen is covered the day
// it is written, not the day someone remembers to add it to a list.

/**
 * Every user-facing message in a block, with the ones we cannot read
 * flagged rather than dropped.
 *
 * Covers `toast.show(msg)` AND `Alert.alert(title, msg)` — the latter has
 * its message in the SECOND argument, and four call sites already exist.
 * A non-literal first argument (`toast.show(OK_MSG)`) is reported as
 * unreadable unless it resolves to a module-scope string constant.
 */
const userMessagesIn = (block, file) => {
  const out = [];
  const src = stripComments(readRaw(file));
  const constants = {};
  for (const [, name, value] of src.matchAll(
    /(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*[`'"]([^`'"]*)[`'"]/g,
  )) {
    constants[name] = value;
  }

  // Balanced-paren scan, NOT a non-greedy regex.
  //
  // `toast.show(\`We couldn't save — ${getError(err)}.\`)` contains a
  // nested `)`, so a lazy `([\s\S]*?)\)` stopped inside the template and
  // handed back a truncated string with no closing quote — which the
  // detector then reported as "unreadable". Eight honest failure messages
  // were flagged as defects that way.
  const callArgs = (text, fnName) => {
    const found = [];
    const needle = `${fnName}(`;
    let i = text.indexOf(needle);
    while (i !== -1) {
      let depth = 0;
      let j = i + needle.length - 1;
      for (; j < text.length; j += 1) {
        if (text[j] === '(') depth += 1;
        else if (text[j] === ')') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      found.push(text.slice(i + needle.length, j));
      i = text.indexOf(needle, j === -1 ? i + needle.length : j);
    }
    return found;
  };

  const record = (raw, isAlert) => {
    // Alert's message is the SECOND argument; toast's is the first.
    // Split only at top level so a comma inside `${}` does not confuse it.
    // String-AWARE split. A message containing a comma ("Signed out on
    // this device, but we could not…") was being cut in half, leaving an
    // unterminated fragment the detector then called unreadable.
    const parts = [];
    let depth = 0;
    let quote = null;
    let buf = '';
    for (let k = 0; k < raw.length; k += 1) {
      const ch = raw[k];
      if (quote) {
        buf += ch;
        if (ch === quote && raw[k - 1] !== '\\') quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        quote = ch;
        buf += ch;
        continue;
      }
      if (ch === '(' || ch === '{' || ch === '[') depth += 1;
      if (ch === ')' || ch === '}' || ch === ']') depth -= 1;
      if (ch === ',' && depth === 0) {
        parts.push(buf);
        buf = '';
      } else buf += ch;
    }
    parts.push(buf);

    const arg = (isAlert ? parts.slice(1).join(',') : parts[0] ?? '').trim();
    if (arg === '') return;

    // Every string/template literal in the expression — a ternary picks
    // between two messages and both have to be checked.
    const literals = [...arg.matchAll(/[`'"]([^`'"]*)[`'"]/g)].map(mm => mm[1]);
    if (literals.length) {
      literals.forEach(text => out.push({text}));
      return;
    }
    const ident = /^([A-Za-z_$][\w$]*)$/.exec(arg);
    if (ident && constants[ident[1]] !== undefined) {
      out.push({text: constants[ident[1]]});
      return;
    }
    // Genuinely opaque. Fail loudly — silently skipping is the gap that
    // let `toast.show(OK_MSG)` drop a whole file out of the sweep.
    out.push({text: arg.slice(0, 60), unreadable: true});
  };

  callArgs(block, 'toast.show').forEach(raw => record(raw, false));
  callArgs(block, 'Alert.alert').forEach(raw => record(raw, true));
  return out;
};

const successClaimFiles = () =>
  allSourceFiles()
    .filter(f => /\.(js|jsx|ts|tsx)$/.test(f))
    .map(f => ({file: f, src: stripComments(readRaw(f))}))
    // Either surface counts — a file that only uses `Alert.alert` was
    // never in this list, so it was never examined. Keyed on a claim
    // WORD, not merely on the presence of a call: `utils/toast.ts` and a
    // warning-only hook are not success claims.
    .filter(
      ({src}) =>
        (/\btoast\.show\(|\bAlert\.alert\(/.test(src) &&
          CLAIM_WORDS.test(src)) ||
        SUCCESS_CLAIM.test(src),
    );

describe('repo-wide: a claim never rides on an unawaited call', () => {
  it('no success message follows a fire-and-forget request', () => {
    // THE P0-01 SHAPE, and the one the other sweep cannot reach: the file
    // DOES contain a request, so "does this file make a request?" passes
    // while the confirmation is still unconditional.
    //
    //   HelpServices.requestRepair();          // not awaited
    //   toast.show('Sent.');                   // fires regardless
    const offenders = [];
    allSourceFiles().forEach(file => {
      const src = stripComments(readRaw(file));
      // A service/mutation call that is neither awaited, returned, nor
      // chained — followed by a message on one of the next few lines.
      // `.mutate(` returns VOID — it is fire-and-forget by construction,
      // and was missed entirely: 12 sites, including
      // `PaymentAllocation.jsx` on the money path. It can legitimately be
      // returned, so the exclusions below still apply.
      const re =
        /(^|[\n;{]\s*)((?:[A-Za-z_$][\w$]*Services|NotificationService)\.[\w$]+\([^;]*\);|[\w$]+\.mutateAsync\([^;]*\);|[\w$]+\.mutate\([^;]*\);)([\s\S]{0,220})/g;
      for (const [, , call, after] of src.matchAll(re)) {
        if (/await\s|\.then\(|\.catch\(|return\s/.test(call)) continue;
        userMessagesIn(after, file).forEach(({text, unreadable}) => {
          if (!unreadable && isSuccessClaim(text)) {
            offenders.push(`${file}: ${call.trim().slice(0, 50)} -> ${text}`);
          }
        });
      }
    });
    expect(offenders).toEqual([]);
  });
});

describe('repo-wide: a success claim never comes from a failure path', () => {
  it('no file reports success from inside a catch block', () => {
    // The P0-03 shape: call the service, catch the error, tell the user
    // it worked anyway. Previously asserted on four hand-listed files.
    const offenders = [];
    successClaimFiles().forEach(({file, src}) => {
      // FAILURE HANDLING DOES NOT ONLY LIVE IN try/catch.
      //
      // This repo has 18 `onError:` handlers, 19 `onSuccess:` handlers and
      // eight-plus `.catch(` sites — that is where most of its error
      // handling actually is. A try/catch-only sweep was blind to nearly
      // all of the surface it exists to guard.
      //
      // `catch {` (optional binding, ES2019) was not matched at all
      // either; `LeaseExpiryServices.js` already uses it.
      const blocks = [
        ...src.matchAll(
          /\}\s*catch\s*(?:\([^)]*\))?\s*\{([\s\S]*?)\n\s{2,8}\}/g,
        ),
        ...src.matchAll(/\.catch\(\s*(?:\([^)]*\)|[\w$]+)\s*=>\s*\{([\s\S]*?)\n\s{2,8}\}/g),
        ...src.matchAll(/\.catch\(\s*(?:\([^)]*\)|[\w$]+)\s*=>\s*([^{\n][^\n]*)/g),
        ...src.matchAll(/onError:\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>\s*\{([\s\S]*?)\n\s{2,8}\}/g),
        ...src.matchAll(/onError:\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>\s*([^{\n][^\n]*)/g),

        // OUTCOME-INDEPENDENT PATHS.
        //
        // `onSettled` and `finally` run on BOTH branches by definition, so
        // a claim in either is unconditional the moment it is written —
        // a purer false success than the catch-block shape, because it
        // does not even need an error to fire.
        ...src.matchAll(/onSettled:\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>\s*\{([\s\S]*?)\n\s{2,8}\}/g),
        ...src.matchAll(/onSettled:\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>\s*([^{\n][^\n]*)/g),
        ...src.matchAll(/\bfinally\s*\{([\s\S]*?)\n\s{2,8}\}/g),

        // `.then(onOk, onErr)` — the two-argument form. Zero sites today;
        // included as cheap insurance rather than a live defect.
        ...src.matchAll(/\.then\([^,]*,\s*(?:\([^)]*\)|[\w$]+)\s*=>\s*\{([\s\S]*?)\n\s{2,8}\}/g),
        ...src.matchAll(/\.then\([^,]*,\s*(?:\([^)]*\)|[\w$]+)\s*=>\s*([^{\n][^\n]*)/g),
      ];
      const catches = blocks;
      catches.forEach(c => {
        userMessagesIn(c[1], file).forEach(({text, unreadable}) => {
          // An argument we cannot read is NOT a pass. Silently skipping
          // it is what let `toast.show(OK_MSG)` drop a whole file out of
          // the sweep — and "extract this string to a constant" is an
          // ordinary refactor nobody would think twice about.
          if (unreadable) {
            offenders.push(`${file}: UNREADABLE message argument — ${text}`);
            return;
          }
          if (isSuccessClaim(text)) {
            offenders.push(`${file}: ${text.replace(/\s+/g, ' ').trim()}`);
          }
        });
      });
    });
    expect(offenders).toEqual([]);
  });

  it('every success claim sits in a file that actually makes a request', () => {
    // A confirmation with no request behind it anywhere in the file is
    // the P0-01 shape — the thing a render test cannot see.
    //
    // Judged on the extracted MESSAGE, not on a claim word appearing
    // anywhere in the file: a receipt screen legitimately contains the
    // word "paid" in display copy while making no request of its own.
    const REQUEST = /(await\s|mutateAsync|\.mutate\(|Services\.|fetch\(|axios)/;
    const offenders = successClaimFiles()
      .filter(({file, src}) => {
        if (REQUEST.test(src)) return false;
        return userMessagesIn(src, file).some(
          ({text, unreadable}) => !unreadable && isSuccessClaim(text),
        );
      })
      .map(({file}) => file);
    expect(offenders).toEqual([]);
  });
});

describe('a 2xx is not a success', () => {
  it('flags services that hand the whole axios response to onSuccess', () => {
    // `onSuccess` fires on any 2xx. If the service returns the whole
    // response rather than `.data`, a 200 carrying an error body lands
    // there and the confirmation shows anyway — the handler never sees
    // the payload it would need to disagree with.
    //
    // Reported, not auto-fixed: changing a service's return shape is a
    // caller-visible change.
    const offenders = [];
    allSourceFiles()
      // AxiosServices is the interceptor itself — its `return await
      // AxiosUtility(originalRequest)` is the retry replay, not a
      // service handing a response to a screen.
      .filter(f => f.startsWith('services/') && f !== 'services/AxiosServices.js')
      // AxiosServices replays the original request inside its own
      // interceptor — that IS the whole response by design.
      .filter(f => f !== 'services/AxiosServices.js')
      .forEach(file => {
        const src = stripComments(readRaw(file));
        // `return await AxiosUtility({...})` with no `.data` destructure.
        const whole = /return\s+await\s+AxiosUtility\(/.test(src);
        if (whole) offenders.push(file);
      });
    // Known today — asserted so a NEW one fails the suite rather than
    // joining a silent majority.
    expect(offenders.sort()).toEqual(['services/help.ts']);
  });
});

// ─────────────────────────────────────────────────────────────────────
// A NAVIGATION IS A CLAIM.
//
// P0-01 verbatim, with the string removed:
//
//   HelpServices.requestRepair();                    // unawaited
//   nav.navigate('rent_receipt', {code, amount});    // "it happened"
//
// No toast, no Alert — invisible to every sweep above. And landing on a
// receipt bearing a confirmation code asserts MORE than any sentence
// could: the user now has something that looks like proof.
//
// The only thing preventing this today is `:91`
// (`expect(payRent).not.toMatch(/rent_receipt/)`) — a one-file allowlist,
// in the suite whose whole premise is that allowlists are how things
// escape. Any new screen can do it freely.
//
// ROUTE SIGNAL, chosen deliberately: a route whose NAME contains
// "receipt". The rule is "a screen that asserts a completed action", and
// receipt screens are the ones that do so with a reference code attached.
// Derived by pattern rather than a hardcoded list, so a new
// `*_receipt` route is covered the day it is added. A confirmation screen
// named something else (`payment_success`) would not be — noted, not
// solved, because guessing at names is how a rule becomes noise.
const CONFIRMATION_ROUTE = /receipt/i;

describe('repo-wide: a navigation is a claim too', () => {
  it('no confirmation screen is opened from an unawaited request', () => {
    const offenders = [];
    allSourceFiles().forEach(file => {
      const src = stripComments(readRaw(file));
      const re =
        /(^|[\n;{]\s*)((?:[A-Za-z_$][\w$]*Services|NotificationService)\.[\w$]+\([^;]*\);|[\w$]+\.mutateAsync\([^;]*\);|[\w$]+\.mutate\([^;]*\);)([\s\S]{0,260})/g;
      for (const [, , call, after] of src.matchAll(re)) {
        if (/await\s|\.then\(|\.catch\(|return\s/.test(call)) continue;
        for (const [, route] of after.matchAll(
          /\.(?:navigate|replace|push)\(\s*['"`]([^'"`]+)['"`]/g,
        )) {
          if (CONFIRMATION_ROUTE.test(route)) {
            offenders.push(`${file}: ${call.trim().slice(0, 40)} -> ${route}`);
          }
        }
      }
    });
    expect(offenders).toEqual([]);
  });

  it('navigating from an EXISTING record stays green', () => {
    // WAS `expect(src).toMatch(/receipt/i)` on three files — which passes
    // trivially and constrains nothing; its own comment conceded the real
    // assertion was elsewhere. A test that cannot fail looks like
    // coverage and isn't.
    //
    // These three open a receipt for a payment that ALREADY EXISTS. A
    // rule that flags them is too broad and would be switched off, so
    // their absence from the offender list is asserted directly.
    const legitimate = [
      'screens/tenant_home/Receipts.jsx',
      'screens/tenant_home/PayHub.jsx',
      'screens/tenant_home/payments/index.jsx',
    ];
    const offenders = [];
    allSourceFiles().forEach(file => {
      const src = stripComments(readRaw(file));
      const re =
        /(^|[\n;{]\s*)((?:[A-Za-z_$][\w$]*Services|NotificationService)\.[\w$]+\([^;]*\);|[\w$]+\.mutateAsync\([^;]*\);|[\w$]+\.mutate\([^;]*\);)([\s\S]{0,260})/g;
      for (const [, , call, after] of src.matchAll(re)) {
        if (/await\s|\.then\(|\.catch\(|return\s/.test(call)) continue;
        for (const [, route] of after.matchAll(
          /\.(?:navigate|replace|push)\(\s*['"`]([^'"`]+)['"`]/g,
        )) {
          if (CONFIRMATION_ROUTE.test(route)) offenders.push(file);
        }
      }
    });
    legitimate.forEach(f => expect(offenders).not.toContain(f));
  });
});
