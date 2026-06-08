// Keystone US-market palette. Mirrors the web SPA's design tokens
// from tailwind.config.js (keystone_navy / keystone_gold /
// keystone_cream / primary_dark) so mobile + web feel like the same
// product.
//
// Legacy `primary` key is preserved as an alias of keystone_navy so
// existing screens keep compiling while we sweep call sites.

const KEYSTONE_NAVY = '#152535';
const KEYSTONE_GOLD = '#A89977';
const KEYSTONE_CREAM = '#E7E5DA';
const KEYSTONE_STONE = '#F4F2EC';

// ── Keystone command-center system (light, brand-matched) ──────────
// Mirrors the web SPA's design vocabulary (src/assets/Theme.js):
// white cards on a warm off-white canvas, cream icon chips, uppercase
// tracked zinc labels over navy values, gold accents, and the web's
// exact semantic status hues so mobile + web read as one product.
const KEYSTONE_CANVAS = '#F4F2EC'; // warm off-white page background
const KEYSTONE_SLATE = '#3B5366'; // supporting copy / hover (web secondary)
const KEYSTONE_CHIP = 'rgba(168,153,119,0.14)'; // cream/gold icon-chip fill
const KEYSTONE_HAIRLINE = 'rgba(21,37,53,0.08)'; // navy @ 8% — card borders
const TEXT_MUTED = '#6B6B6B'; // muted secondary — darkened from #7C7C7C so small copy passes AA on white (5.33) and on the canvas page bg (4.76)
const C_SUCCESS = '#05A660'; // web success_green
const C_DANGER = '#E53535'; // web error_red
const C_PENDING = '#CDA000'; // web pending_yellow

const COLORS = {
  // Keystone tokens (preferred)
  keystone_navy: KEYSTONE_NAVY,
  keystone_gold: KEYSTONE_GOLD,
  keystone_cream: KEYSTONE_CREAM,
  keystone_stone: KEYSTONE_STONE,

  // Command-center system (light, brand-matched to web)
  keystone_canvas: KEYSTONE_CANVAS,
  keystone_slate: KEYSTONE_SLATE,
  keystone_chip: KEYSTONE_CHIP,
  keystone_hairline: KEYSTONE_HAIRLINE,
  text_muted: TEXT_MUTED,
  c_success: C_SUCCESS,
  c_danger: C_DANGER,
  c_pending: C_PENDING,

  // Aliases the existing screens reference. These now resolve to the
  // Keystone palette without touching call sites; sweep to the
  // explicit `keystone_*` names happens in follow-up commits.
  primary: KEYSTONE_NAVY,
  primary_bg: `${KEYSTONE_NAVY}0D`,
  primary_bg_pale: KEYSTONE_STONE,
  bg: '#fff',
  grey_1: '#6C6C6C',
  c_green: '#14532D',
  c_green_bg: '#DCFCE760',
  border_grey: '#E8E8E8',
  bg_pale: KEYSTONE_CREAM,
  inactive_text: '#8E8E8E',
  active_text: KEYSTONE_NAVY,
  text_color: '#14142B',
  white: '#ffffff',
  bg_grey: '#f5f5f5',
  bg_green: '#D8F5DF',
  gradient_2: KEYSTONE_GOLD,
  likeRed: '#A61606',
};

// ── Contrast-checked role tokens ───────────────────────────────────
// Every pairing below is a verified WCAG 2.1 ratio (computed, not
// eyeballed). Reference a ROLE, never a raw hex, so a button can't be
// assembled into a failing combo. This is what ends the one-at-a-time
// "unreadable button" fixes.
//
// The core fact about the gold: #A89977 is a mid-luminance bronze. It
// FAILS as white-on-gold (2.80) and as gold-text-on-light (2.2–2.8),
// and there is no single gold that carries BOTH white and navy text.
// So gold is only ever paired with navy: navy-on-gold (5.56 AA) or
// gold-on-navy (5.56 AA). Never white on gold; never gold on a light
// surface (darken to GOLD_TEXT #5C5234 = 7.74 AAA for that).
const GOLD_TEXT = '#5C5234'; // gold-as-text on light → 7.74 AAA on white
const TEXT_MUTED_STRONG = '#5F5F5F'; // small-copy muted; #7C7C7C is large-only

const ROLES = {
  surface: {
    canvas: KEYSTONE_CANVAS, // page background
    card: '#FFFFFF', // standard card
    cream: KEYSTONE_CREAM, // quiet/raised panel
    navy: KEYSTONE_NAVY, // hero/feature (dark)
    hairline: KEYSTONE_HAIRLINE,
  },
  // Button = {fill, label} pairs, contrast-guaranteed.
  btn: {
    primary: {fill: KEYSTONE_GOLD, label: KEYSTONE_NAVY}, // 5.56 AA — the precious CTA (navy label, never white)
    strong: {fill: KEYSTONE_NAVY, label: KEYSTONE_CREAM}, // 15.58 AAA — solid primary on light surfaces
    secondary: {fill: KEYSTONE_CREAM, label: KEYSTONE_NAVY}, // 12.33 AAA — quiet action
  },
  text: {
    primary: KEYSTONE_NAVY, // on canvas/white/cream → 12–15 AAA
    secondary: KEYSTONE_SLATE, // 6.35–8.03 AA–AAA
    muted: TEXT_MUTED, // AA on white (5.33) + canvas (4.76)
    mutedStrong: TEXT_MUTED_STRONG, // heavier muted when more emphasis is wanted
    onNavy: KEYSTONE_CREAM, // 12.33 AAA label on navy
    goldAccent: KEYSTONE_GOLD, // 5.56 AA — gold accent on navy ONLY
    goldText: GOLD_TEXT, // gold-colored text on light surfaces
  },
  // Bright hues = dots/badges/fills only. Use the *_text variants for
  // status TEXT on light (the bright set fails as text: pending 2.44).
  status: {
    successDot: C_SUCCESS,
    dangerDot: C_DANGER,
    pendingDot: C_PENDING,
    successText: '#057A48',
    dangerText: '#C62828', // 5.62 AA on white
    pendingText: '#8A6D00', // 4.92 AA on white
  },
};

COLORS.gold_text = GOLD_TEXT;
COLORS.text_muted_strong = TEXT_MUTED_STRONG;
COLORS.c_success_text = ROLES.status.successText;
COLORS.c_danger_text = ROLES.status.dangerText;
COLORS.c_pending_text = ROLES.status.pendingText;
COLORS.ROLES = ROLES;

module.exports = COLORS;
