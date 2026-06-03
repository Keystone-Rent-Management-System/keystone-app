// USD money formatter for the landlord command center. The legacy
// numberWithCommas only handles the integer side and has no currency
// affixing — we ship money figures often enough now (dashboard,
// portfolio, payouts) that one shared formatter is worth the file.

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fmtCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const usd = n => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '$0';
  return fmt.format(Number(n));
};

export const usdCents = n => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '$0.00';
  return fmtCents.format(Number(n));
};

export const pct = (n, opts = {}) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const decimals = opts.decimals ?? 0;
  return `${Number(n).toFixed(decimals)}%`;
};
