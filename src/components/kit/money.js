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

const asDate = d => (d instanceof Date ? d : new Date(d));

/** "$1,800" — tabular styling is the component's job, digits are ours. */
export const usd = n =>
  `$${Math.round(n ?? 0).toLocaleString('en-US')}`;

/** D1 · "JULY RENT" (uppercase for hero labels). */
export const periodLabel = date => `${MONTHS_LONG[asDate(date).getMonth()].toUpperCase()} RENT`;

/** D1 · landlord aggregate: "RENT COLLECTION · JULY 2026". */
export const collectionLabel = date => {
  const d = asDate(date);
  return `RENT COLLECTION · ${MONTHS_LONG[d.getMonth()].toUpperCase()}`;
};

/** Title-case period for receipts/rows: "Rent · June 2026" (D3). */
export const periodTitle = date => {
  const d = asDate(date);
  return `Rent · ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

/** "Aug 1" / "Aug 1, 2026" */
export const shortDate = (date, withYear = false) => {
  const d = asDate(date);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}${withYear ? `, ${d.getFullYear()}` : ''}`;
};

/** D2 · verb-first event date: eventDate('Paid', d) → "Paid Jul 23". */
export const eventDate = (verb, date, withYear = false) =>
  `${verb} ${shortDate(date, withYear)}`;

/**
 * D2 + D4 · "Due Aug 1 · in 5 days". Relative part only ever renders
 * beside the absolute date it restates.
 */
export const dueLine = (date, now = new Date()) => {
  const d = asDate(date);
  const days = Math.ceil((d - now) / 86400000);
  const rel =
    days < 0 ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} late`
    : days === 0 ? 'today'
    : days === 1 ? 'tomorrow'
    : `in ${days} days`;
  return `${eventDate('Due', d)} · ${rel}`;
};
