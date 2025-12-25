/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        "brand-black": "#090A24",
        "brand-white": "#F6F7FD",

        "brand-background": "#F6F7FD",
        "brand-default": "#C8DD80",
        "brand-primary": "#78AD96",
        "brand-secondary": "#005600",
        "brand-success": "#7FA1F6",
        "brand-warning": "#F8BD5F",
        "brand-danger": "#FF7E7E",

        "brand-dark-background": "#090A24",
        "brand-dark-default": "#DEF58F",
        "brand-dark-primary": "#84BDA4",
        "brand-dark-secondary": "#057A05",
        "brand-dark-success": "#628CF6",
        "brand-dark-warning": "#FFB951",
        "brand-dark-danger": "#E43131",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
