// Date/period rule — money surfaces (kit 1h, rules D1–D4).
// One formatter owns every money string so a period label and an event
// date can never contradict each other ("RENT DUE · JULY" + "Due Aug 1"
// was the P1-5 bug: it reads as two due dates).
//
//   D1 · period label = "{MONTH} RENT"; landlord aggregate =
//        "RENT COLLECTION · {MONTH} {YEAR}".
//   D2 · event dates are verb-first: "Due Aug 1", "Paid Jul 23".
//   D3 · receipts carry both: period in the title, verb-date in meta.
//   D4 · relative time only ever follows the absolute date it restates.

const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// A date-only string names a CALENDAR DATE, not an instant.
//
// `new Date('2026-09-01')` parses as UTC midnight (ECMAScript says
// date-only forms are UTC), while every getter below reads local. West of
// UTC that lands on the previous day of the previous month:
//
//   TZ=America/Los_Angeles, dueDate "2026-09-01"
//     periodLabel -> "AUGUST RENT"   eventDate -> "Due Aug 31"
//
// A tenant in Pacific opening the app on the evening rent is due was told
// they were a day late — the exact "two different due dates"
// contradiction the header above claims this file eliminated.
//
// The bug is invisible east of UTC, which is why the suite runs under two
// zones rather than one.
//
// `BE_ASKS_MOBILE` documents the backend sending date-only strings, so
// this is the normal case, not an edge one. Full timestamps carry their
// own offset and are left alone.
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export const asDate = d => {
  if (d instanceof Date) return d;
  if (typeof d === 'string') {
    const m = DATE_ONLY.exec(d.trim());
    if (m) {
      // Local midnight on the named day, in whatever zone the phone is.
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }
  }
  return new Date(d);
};

// A missing or unparseable date must render as an em dash, never as
// "undefined NaN". `new Date(undefined)` is an Invalid Date, so
// MONTHS_SHORT[NaN] is undefined and getDate() is NaN — which is exactly
// what a tenant saw ("Due undefined NaN") on any screen whose data had
// not loaded or whose account has no tenancy. Guarding here covers every
// caller instead of each call site remembering to.
const isValid = d => d instanceof Date && !Number.isNaN(d.getTime());
export const NO_DATE = '—';

// The money equivalent of NO_DATE. "We don't know" must be able to say so
// rather than defaulting to a number.
export const NO_VALUE = '—';

// THE ONE MONEY FORMATTER. `utils/money` re-exports this; nothing else
// implements it.
//
// It used to be `Math.round(n).toLocaleString()`, which:
//   · printed $1,234.56 as "$1,235" — a receipt for an amount nobody paid
//   · printed $0.49 as "$0" beside "this is your current rent due"
//   · printed -1.5 as "$-1", with the minus inside the currency symbol
//   · broke the row/total invariant: three $100.40 rows under a $301
//     header, because rows and totals were rounded at different points
//
// Cents are significant everywhere money is owed or paid. Whole amounts
// still render whole ("$1,800"), because the design calls for that on
// hero surfaces and forcing ".00" everywhere is its own kind of wrong.

/** Cents are the unit of record; everything rounds here, exactly once. */
const toCents = n => {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  // `Math.round(-0.5)` is -0, which formats as "-0". Normalise it away.
  const cents = Math.round(num * 100);
  return Object.is(cents, -0) ? 0 : cents;
};

const GROUPED = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const GROUPED_CENTS = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * "$1,800" · "$1,234.56" · "-$1,234.56"
 *
 * The minus sits OUTSIDE the symbol, which is how negative currency is
 * written — and it means callers never have to prefix one themselves.
 */
export const usd = n => {
  // MISSING IS NOT ZERO.
  //
  // This returned "$0" for undefined, null and unparseable input, which
  // is a confident statement about money we do not have. `Roommates`
  // rendered "$0/mo of $0 total" directly above "You only owe your
  // share… if a roommate pays late it's never on you" whenever
  // rent-summary failed — a fabricated number under a liability
  // assurance, on a joint-and-several lease.
  //
  // Dates already had `NO_DATE` for exactly this reason; money had no
  // equivalent. An explicit `usd(x ?? 0)` still renders "$0", because
  // that caller has said it means zero.
  //
  // A pre-formatted string ("1,800") is unparseable and returns the dash
  // rather than silently becoming zero — the same double-formatting
  // shape that produced the original defect.
  if (n === null || n === undefined) return NO_VALUE;
  // `Number('')` is 0, so an empty string would otherwise report a
  // confident zero — the same defect in a different disguise.
  if (typeof n === 'string' && n.trim() === '') return NO_VALUE;
  const num = typeof n === 'number' ? n : Number(String(n).trim());
  if (!Number.isFinite(num)) return NO_VALUE;

  const cents = toCents(num);
  const abs = Math.abs(cents);
  const sign = cents < 0 ? '-' : '';
  const whole = abs / 100;
  const body =
    abs % 100 === 0 ? GROUPED.format(whole) : GROUPED_CENTS.format(whole);
  return `${sign}$${body}`;
};

/**
 * Sum a list the way the screen renders it: round each row to cents
 * FIRST, then add. Summing raw floats and rounding the total is what let
 * a visible list disagree with its own visible total.
 */
export const sumUsd = values => {
  const list = values ?? [];
  // If any row is unknown, the total is unknown — silently treating it as
  // zero would produce a total the visible rows do not add up to, which
  // is the invariant this function exists to protect.
  if (list.some(v => v === null || v === undefined || !Number.isFinite(Number(v)))) {
    return null;
  }
  return list.reduce((acc, v) => acc + toCents(v), 0) / 100;
};

/**
 * "$1,800" · "$120.5k" — compact form for dense landlord surfaces.
 * Delegates, so it can never drift from `usd`.
 */
export const usdCompact = n => {
  const num = Number(n) || 0;
  if (Math.abs(num) >= 100000) {
    const sign = num < 0 ? '-' : '';
    return `${sign}$${(Math.abs(num) / 1000).toFixed(1)}k`;
  }
  return usd(num);
};

/** D1 · "JULY RENT" (uppercase for hero labels). */
export const periodLabel = date => {
  const d = asDate(date);
  return isValid(d) ? `${MONTHS_LONG[d.getMonth()].toUpperCase()} RENT` : 'RENT';
};

/**
 * D1 · landlord aggregate: "RENT COLLECTION · JULY".
 *
 * This was the one export missing the `isValid` guard its siblings have.
 * On an invalid date `MONTHS_LONG[NaN]` is undefined and `.toUpperCase()`
 * THROWS — so a landlord whose dashboard data had not loaded got a red
 * screen rather than a dash, which is the one failure mode the guard
 * everywhere else exists to prevent.
 */
export const collectionLabel = date => {
  const d = asDate(date);
  return isValid(d)
    ? `RENT COLLECTION · ${MONTHS_LONG[d.getMonth()].toUpperCase()}`
    : 'RENT COLLECTION';
};

/** Title-case period for receipts/rows: "Rent · June 2026" (D3). */
export const periodTitle = date => {
  const d = asDate(date);
  return isValid(d) ? `Rent · ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}` : 'Rent';
};

/** "Aug 1" / "Aug 1, 2026" */
export const shortDate = (date, withYear = false) => {
  const d = asDate(date);
  if (!isValid(d)) return NO_DATE;
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}${withYear ? `, ${d.getFullYear()}` : ''}`;
};

/** D2 · verb-first event date: eventDate('Paid', d) → "Paid Jul 23". */
export const eventDate = (verb, date, withYear = false) => {
  const when = shortDate(date, withYear);
  // Don't emit a dangling verb ("Due —") when there is no date at all.
  return when === NO_DATE ? NO_DATE : `${verb} ${when}`.trim();
};

/**
 * D2 + D4 · "Due Aug 1 · in 5 days". Relative part only ever renders
 * beside the absolute date it restates.
 */
export const dueLine = (date, now = new Date()) => {
  const d = asDate(date);
  if (!isValid(d)) return NO_DATE;
  const days = Math.ceil((d - now) / 86400000);
  const rel =
    days < 0 ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} late`
    : days === 0 ? 'today'
    : days === 1 ? 'tomorrow'
    : `in ${days} days`;
  return `${eventDate('Due', d)} · ${rel}`;
};
