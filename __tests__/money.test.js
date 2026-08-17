/* eslint-env jest */
//
// The money layer had NO tests. Every amount and every date in the app
// renders through this file, and both of its defects fire on the default
// happy path — so a green suite over it meant nothing.
//
// These were written to FAIL against the previous implementation:
//   · `asDate` parsed date-only strings as UTC midnight while every
//     getter reads local, so west of UTC a due date rendered as the
//     previous month and the previous day.
//   · `usd` rounded to whole dollars, so a receipt printed $1,235 for
//     $1,234.56 and a list of rows did not add up to its own total.

// ZONE COVERAGE IS DONE BY RUNNING THIS SUITE TWICE, NOT IN-PROCESS.
//
// The first version of this file set `process.env.TZ` inside the test and
// re-required the module. That works in plain node but NOT under Jest —
// the zone had already been resolved, so all three "zones" silently
// tested the machine's own, and a suite that appeared to cover Auckland
// covered nothing. It was caught because Auckland reported the westward
// answer, which is impossible.
//
// So the assertion below is ZONE-INDEPENDENT instead, which is the real
// invariant: a date-only string names a calendar date, and must render as
// that date wherever the phone happens to be. A correct implementation
// passes in every zone; the UTC-midnight bug fails west of UTC and passes
// east — which is precisely why one pinned zone is not enough.
//
// Run both directions with:
//   TZ=America/Los_Angeles npx jest __tests__/money.test.js
//   TZ=Pacific/Auckland    npx jest __tests__/money.test.js
// (`npm run test:money` does both.)
const CURRENT_ZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone || process.env.TZ || 'unknown';

describe('usd — cents are not decoration', () => {
  const {usd} = require('../src/components/kit/money');

  it('keeps cents', () => {
    // The receipt case. $1,234.56 printed as $1,235 is a receipt for an
    // amount nobody paid.
    expect(usd(1234.56)).toBe('$1,234.56');
  });

  it('does not round a real amount away to nothing', () => {
    // Rendered next to "This is your current rent due", $0 is a lie.
    expect(usd(0.49)).toBe('$0.49');
    expect(usd(0.01)).toBe('$0.01');
  });

  it('renders whole amounts without noise', () => {
    // The design calls for "$1,800" on hero surfaces; forcing ".00"
    // everywhere would be a different kind of wrong.
    expect(usd(1800)).toBe('$1,800');
    expect(usd(0)).toBe('$0');
  });

  it('puts the minus OUTSIDE the currency symbol', () => {
    expect(usd(-1.5)).toBe('-$1.50');
    expect(usd(-1234.56)).toBe('-$1,234.56');
    expect(usd(-1800)).toBe('-$1,800');
  });

  it('never emits negative zero', () => {
    // `Math.round(-0.5)` is -0, which formatted as "$-0".
    expect(usd(-0.004)).toBe('$0');
    expect(usd(-0)).toBe('$0');
  });

  it('handles large values', () => {
    expect(usd(1234567.89)).toBe('$1,234,567.89');
  });
});

describe('missing money is not zero', () => {
  const {usd, sumUsd, NO_VALUE} = require('../src/components/kit/money');

  it('renders a dash, not a confident $0', () => {
    // `Roommates` rendered "$0/mo of $0 total" directly above "You only
    // owe your share… if a roommate pays late it's never on you"
    // whenever rent-summary failed — a fabricated number under a
    // liability assurance on a joint-and-several lease.
    expect(usd(undefined)).toBe(NO_VALUE);
    expect(usd(null)).toBe(NO_VALUE);
    expect(usd(NaN)).toBe(NO_VALUE);
    expect(usd('')).toBe(NO_VALUE);
  });

  it('a REAL zero still renders as zero', () => {
    // The distinction the whole change rests on. An explicit `?? 0` at a
    // call site means the caller has said it is zero.
    expect(usd(0)).toBe('$0');
    expect(usd(0.0)).toBe('$0');
    expect(usd('0')).toBe('$0');
  });

  it('a pre-formatted string is unparseable, not zero', () => {
    // The legacy double-formatting shape: "$1,800" quietly became "$0".
    expect(usd('1,800')).toBe(NO_VALUE);
    expect(usd('$1,800')).toBe(NO_VALUE);
    // A plain numeric string is fine.
    expect(usd('1800')).toBe('$1,800');
  });

  it('an unknown row makes the total unknown', () => {
    // Treating it as zero would print a total the visible rows do not add
    // up to — the invariant sumUsd exists to protect.
    expect(sumUsd([1800, 100.4, 0.49])).toBeCloseTo(1900.89, 2);
    expect(usd(sumUsd([1800, 100.4, 0.49]))).toBe('$1,900.89');
    expect(sumUsd([1800, undefined])).toBeNull();
    expect(usd(sumUsd([1800, undefined]))).toBe(NO_VALUE);
  });
});

describe('the row/total invariant', () => {
  const {usd, sumUsd} = require('../src/components/kit/money');

  it('a visible list adds up to its visible total', () => {
    // Three payments of $100.40 rendered as three $100 rows under a $301
    // header. Rounding rows and totals at DIFFERENT precisions is the
    // whole bug: round once, at the same precision, then sum.
    const rows = [100.4, 100.4, 100.4];
    const rendered = rows.map(usd);
    expect(rendered).toEqual(['$100.40', '$100.40', '$100.40']);
    expect(usd(sumUsd(rows))).toBe('$301.20');
  });

  it('holds for values that round individually', () => {
    const rows = [10.005, 10.005, 10.005];
    // Each row rounds to $10.01, so the total the user can add up is
    // $30.03 — not $30.02 from summing the raw floats first.
    expect(rows.map(usd)).toEqual(['$10.01', '$10.01', '$10.01']);
    expect(usd(sumUsd(rows))).toBe('$30.03');
  });

  it('holds across mixed signs', () => {
    const rows = [100.4, -50.2];
    expect(rows.map(usd)).toEqual(['$100.40', '-$50.20']);
    expect(usd(sumUsd(rows))).toBe('$50.20');
  });
});

describe(`asDate — a date-only string is a LOCAL date (running in ${CURRENT_ZONE})`, () => {
  const m = require('../src/components/kit/money');

  // BE_ASKS_MOBILE documents date-only strings ("dueDate": "2026-06-10").
  // ECMAScript parses those as UTC midnight while every getter in
  // money.js reads local, so west of UTC a due date rendered as the
  // previous month AND the previous day.
  const CASES = [
    ['2026-09-01', 'SEPTEMBER RENT', 'Sep 1'],
    ['2026-08-01', 'AUGUST RENT', 'Aug 1'],
    ['2026-06-01', 'JUNE RENT', 'Jun 1'],
    ['2026-01-01', 'JANUARY RENT', 'Jan 1'],
    ['2026-12-31', 'DECEMBER RENT', 'Dec 31'],
  ];

  CASES.forEach(([input, label, short]) => {
    it(`${input} renders as ${short} in any zone`, () => {
      expect(m.periodLabel(input)).toBe(label);
      expect(m.shortDate(input)).toBe(short);
    });
  });

  it('periodLabel and eventDate never disagree about the month', () => {
    // The P1-5 contradiction this file's header claims to have
    // eliminated: "RENT DUE · JULY" beside "Due Aug 1" reads as two
    // different due dates.
    CASES.forEach(([input]) => {
      const monthWord = m.periodLabel(input).split(' ')[0];
      const shortMonth = m.eventDate('Due', input).split(' ')[1];
      expect(monthWord.slice(0, 3)).toBe(shortMonth.toUpperCase());
    });
  });

  it('a tenant is not told they are late on the day rent is due', () => {
    // 9pm local on the due date — the exact moment the UTC bug bites.
    const now = new Date(2026, 8, 1, 21, 0, 0);
    expect(m.dueLine('2026-09-01', now)).toBe('Due Sep 1 · today');
  });

  it('still accepts full timestamps and Date instances', () => {
    // A full ISO timestamp carries its own offset; it must NOT be
    // re-interpreted as a local wall-clock date.
    expect(m.shortDate(new Date(2026, 8, 1))).toBe('Sep 1');
    // A timestamp is an INSTANT: it lands on whatever local day that
    // instant falls on, which differs by zone. Derive the expectation
    // from the same instant rather than hardcoding a day — an earlier
    // version guessed and was wrong east of UTC.
    const instant = new Date('2026-09-01T12:00:00Z');
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    expect(m.shortDate('2026-09-01T12:00:00Z')).toBe(
      `${MONTHS[instant.getMonth()]} ${instant.getDate()}`,
    );
  });
});

describe('every formatter guards a missing date', () => {
  const m = require('../src/components/kit/money');

  it('collectionLabel does not throw on an invalid date', () => {
    // The one export missing the `isValid` guard its siblings have:
    // MONTHS_LONG[NaN] is undefined and .toUpperCase() throws, taking the
    // landlord dashboard down with it.
    expect(() => m.collectionLabel(undefined)).not.toThrow();
    expect(() => m.collectionLabel('not-a-date')).not.toThrow();
    expect(m.collectionLabel(undefined)).toBe('RENT COLLECTION');
  });

  it('the others already degrade to an em dash or a bare noun', () => {
    expect(m.periodLabel(undefined)).toBe('RENT');
    expect(m.periodTitle(undefined)).toBe('Rent');
    expect(m.shortDate(undefined)).toBe('—');
    expect(m.eventDate('Due', undefined)).toBe('—');
    expect(m.dueLine(undefined)).toBe('—');
  });
});

describe('one formatter, not three', () => {
  const {read} = require('./helpers/source');

  it('utils/money re-exports the kit implementation', () => {
    // There were three `usd`s, two under the same name, disagreeing on
    // value AND sign placement — and Lease.jsx imported one while every
    // sibling tenant screen imported the other.
    const src = read('utils/money.js');
    expect(src).toMatch(/from '\.\.\/components\/kit\/money'/);
    expect(src).not.toMatch(/new Intl\.NumberFormat[\s\S]*style: 'currency'/);
  });

  it('ReportsHub abbreviates via the shared formatter', () => {
    const src = read('screens/landlord_home/ReportsHub.jsx');
    expect(src).not.toMatch(/Math\.round\(n \?\? 0\)\.toLocaleString/);
  });

  it('no screen hand-prefixes a minus onto a formatted amount', () => {
    // Portfolio did `-${usd(x)}`, so a genuinely negative input rendered
    // "--$500".
    const src = read('screens/landlord_home/Portfolio.jsx');
    expect(src).not.toMatch(/`-\$\{usd\(/);
  });
});

describe('the invariant survives COMPOSITION, not just the helper', () => {
  const {usd, sumUsd} = require('../src/components/kit/money');
  const {read} = require('./helpers/source');

  it('a list containing an unknown amount does not show a confident total', () => {
    // B7. `sumUsd` propagated null correctly, and the ONE call site
    // defeated it with `?? 0` — so the rows read "$1,800 · — · $250.50"
    // under a total of "$2,050.50". The helper was right and the screen
    // still lied, which is why this asserts the pair, not the helper.
    const amounts = [1800, undefined, 250.5];
    const rows = amounts.map(usd);
    expect(rows).toEqual(['$1,800', '—', '$250.50']);
    expect(usd(sumUsd(amounts))).toBe('—');
  });

  it('the collapse that caused it is gone from the call site', () => {
    // The defect was invisible to a test of `sumUsd` alone: the `?? 0`
    // sat between the data and the helper.
    const src = read('screens/tenant_home/Receipts.jsx');
    expect(src).toMatch(/sumUsd\(payments\.map\(p => p\.amount\)\)/);
    expect(src).not.toMatch(/sumUsd\([^)]*\?\? 0/);
  });

  it('no aggregate anywhere is fed a ?? 0 default', () => {
    // The general question ("is this default reasonable?") passed this
    // site. The right question is narrower: does the default feed a
    // formatter or an AGGREGATE?
    const {allSourceFiles, stripComments, readRaw} = require('./helpers/source');
    const offenders = allSourceFiles().filter(f =>
      /sumUsd\([^)]*\?\?\s*0/.test(stripComments(readRaw(f))),
    );
    expect(offenders).toEqual([]);
  });
});
