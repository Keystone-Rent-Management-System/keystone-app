import COLORS from '../src/constants/Theme';

// Guardrail for the contrast-checked ROLES. The whole point of the role
// system is that a button can't be assembled into a failing combo — so
// this test fails CI the moment a pairing drops below its WCAG bar, and
// proves the known-bad gold combos stay rejected. This is what stops the
// one-at-a-time "unreadable button" fixes from coming back.

// WCAG 2.1 relative luminance + contrast ratio (pure, no deps).
const srgb = c => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const lum = hex => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => srgb(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

const AA = 4.5; // WCAG AA, normal text
const {ROLES} = COLORS;

describe('Theme ROLES contrast', () => {
  it('every button {fill,label} pairing meets WCAG AA', () => {
    for (const [name, {fill, label}] of Object.entries(ROLES.btn)) {
      const r = ratio(fill, label);
      expect(`${name}:${r.toFixed(2)}`).toBe(`${name}:${r.toFixed(2)}`); // label in failure msg
      expect(r).toBeGreaterThanOrEqual(AA);
    }
  });

  it('the precious primary is gold fill with a NAVY label (never white)', () => {
    expect(ROLES.btn.primary.fill).toBe('#A89977');
    expect(ROLES.btn.primary.label).toBe('#152535');
    // White-on-gold is the exact bug we are guarding against.
    expect(ratio('#A89977', '#FFFFFF')).toBeLessThan(AA);
  });

  it('gold-as-text on light surfaces uses the darkened goldText token', () => {
    // Raw gold fails as text on any light surface…
    for (const bg of ['#FFFFFF', '#E7E5DA', '#F4F2EC']) {
      expect(ratio('#A89977', bg)).toBeLessThan(AA);
    }
    // …the goldText token passes on white.
    expect(ratio(ROLES.text.goldText, '#FFFFFF')).toBeGreaterThanOrEqual(AA);
  });

  it('status TEXT variants pass AA on white (the bright dots do not)', () => {
    expect(ratio(ROLES.status.pendingDot, '#FFFFFF')).toBeLessThan(AA); // bright = dots only
    expect(ratio(ROLES.status.dangerText, '#FFFFFF')).toBeGreaterThanOrEqual(AA);
    expect(ratio(ROLES.status.pendingText, '#FFFFFF')).toBeGreaterThanOrEqual(AA);
  });

  it('on-navy label and gold accent are both legible on the navy surface', () => {
    expect(ratio(ROLES.text.onNavy, ROLES.surface.navy)).toBeGreaterThanOrEqual(AA);
    expect(ratio(ROLES.text.goldAccent, ROLES.surface.navy)).toBeGreaterThanOrEqual(AA);
  });
});
