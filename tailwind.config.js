import { COLORS } from "./src/constants/Theme";

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./<custom-folder>/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        inactive_text: COLORS.inactive_text,
        active_text: COLORS.active_text,
        bg: COLORS.bg,
        grey_1: COLORS.grey_1,
        c_green: COLORS.c_green,
        c_green_bg: COLORS.c_green_bg,
        border_grey: COLORS.border_grey,
        bg_pale: COLORS.bg_pale,
      },
      fontFamily: {
        inter: ["Inter-Regular"],
        "inter-bold": ["Inter-Bold"],
        "inter-semibold": ["Inter-SemiBold"],
        "inter-medium": ["Inter-Mesium"],
        "sometypemono": ["SometypeMono-Medium"],
      },
    },
  },
  plugins: [],
};
