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
const TEXT_MUTED = '#7C7C7C'; // web text_gray_1
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

module.exports = COLORS;
