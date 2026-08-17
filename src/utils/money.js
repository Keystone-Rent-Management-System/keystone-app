// Money formatting for the landlord command center.
//
// THIS FILE NO LONGER IMPLEMENTS `usd`. It re-exports the one in
// components/kit/money, which is now the single implementation.
//
// There used to be three, two of them called `usd`:
//
//   kit/money.js        Math.round + toLocaleString  ->  "$-1" for -1.5
//   utils/money.js      Intl currency, 0dp           ->  "-$2"  for -1.5
//   ReportsHub.jsx      a third, k-suffixed
//
// They disagreed on the value AND on where the minus goes, and the split
// ran straight through the tenant surface: `Lease.jsx` imported this one
// while every sibling tenant screen imported the kit one, so two screens
// side by side could render the same number differently. `Portfolio.jsx`
// also hand-prefixed a "-" onto a formatted amount, so a genuinely
// negative input rendered "--$500".
//
// `usd` handles its own sign now. Callers must never prefix one.

export {usd, usdCompact, sumUsd} from '../components/kit/money';

/**
 * Explicit two-decimal form, for the few places that want cents shown
 * even on a whole amount — a statement reconciling against a bank line,
 * where "$1,800" and "$1,800.00" are read differently.
 *
 * `usd` already keeps cents whenever they are non-zero, so this is the
 * exception, not the default.
 */
export const usdCents = n => {
  const num = Number(n);
  if (n === null || n === undefined || Number.isNaN(num)) return '$0.00';
  const sign = num < 0 ? '-' : '';
  return `${sign}$${Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const pct = (n, opts = {}) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const decimals = opts.decimals ?? 0;
  return `${Number(n).toFixed(decimals)}%`;
};
