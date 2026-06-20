const COLORS = require('./src/constants/Theme');

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Keystone tokens — preferred for new code.
        keystone_navy: COLORS.keystone_navy,
        keystone_gold: COLORS.keystone_gold,
        keystone_cream: COLORS.keystone_cream,
        keystone_stone: COLORS.keystone_stone,
        // Command-center system (light, brand-matched to web)
        keystone_canvas: COLORS.keystone_canvas,
        keystone_slate: COLORS.keystone_slate,
        keystone_chip: COLORS.keystone_chip,
        keystone_hairline: COLORS.keystone_hairline,
        text_muted: COLORS.text_muted,
        c_success: COLORS.c_success,
        c_danger: COLORS.c_danger,
        c_pending: COLORS.c_pending,
        // Contrast-checked role tokens (see Theme.js ROLES). gold_text
        // is gold-as-text on light; text_muted_strong is small-copy
        // muted; the *_text status hues pass AA as text on light.
        gold_text: COLORS.gold_text,
        text_muted_strong: COLORS.text_muted_strong,
        c_success_text: COLORS.c_success_text,
        c_danger_text: COLORS.c_danger_text,
        c_pending_text: COLORS.c_pending_text,
        // Legacy aliases — resolve to Keystone palette via Theme.js.
        primary: COLORS.primary,
        primaryBg: COLORS.primary_bg,
        primary_bg_pale: COLORS.primary_bg_pale,
        inactive_text: COLORS.inactive_text,
        active_text: COLORS.active_text,
        bg: COLORS.bg,
        grey_1: COLORS.grey_1,
        c_green: COLORS.c_green,
        c_green_bg: COLORS.c_green_bg,
        border_grey: COLORS.border_grey,
        bg_pale: COLORS.bg_pale,
        ctext: COLORS.text_color,
        bg_grey: COLORS.bg_grey,
        bg_green: COLORS.bg_green,
      },
      fontFamily: {
        // Inter is the web SPA's primary typeface (font-inter in
        // src/index.css). These keys mirror Tailwind's font-weight
        // convention so screens can swap one className to switch.
        inter: ['Inter-Regular'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
        // Legacy — keep until every screen is swept off OpenSauceSans.
        'open-sauce-sans': ['OpenSauceSans-Regular'],
        'open-sauce-sans-bold': ['OpenSauceSans-Bold'],
        'open-sauce-sans-semibold': ['OpenSauceSans-SemiBold'],
        'open-sauce-sans-medium': ['OpenSauceSans-Medium'],
        sometypemono: ['SometypeMono-Medium'],
      },
      fontSize: {
        '2xs': '10px',
        11: '11px',
        13: '13px',
        15: '15px',
      },
    },
  },
  plugins: [],
};
/** @type {import("tailwindcss").Config} */
