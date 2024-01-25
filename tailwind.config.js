const COLORS = require('./src/constants/Theme');

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        primaryBg: COLORS.primary_bg,
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
        inter: ['Inter-Regular'],
        'inter-bold': ['Inter-Bold'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-medium': ['Inter-Medium'],
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
