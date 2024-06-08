/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
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
    nextui({
      layout: {
        fontSize: {
          tiny: "0.75rem", // text-tiny
          small: "0.875rem", // text-small
          medium: "1rem", // text-medium
          large: "1.125rem", // text-large
        },
        lineHeight: {
          tiny: "1rem", // text-tiny
          small: "1.25rem", // text-small
          medium: "1.5rem", // text-medium
          large: "1.75rem", // text-large
        },
      },
      themes: {
        dark: {
          colors: {
            background: {
              DEFAULT: "#090A24",
            },
            foreground: {
              DEFAULT: "#F6F7FD",
            },
            /*             default: {
              We're keeping the grey default colors from the standard NextUI theme
            }, */
            primary: {
              DEFAULT: "#386641",
              50: "#e8f8eb",
              100: "#cbe5d0",
              200: "#acd2b3",
              300: "#8cc096",
              400: "#6cae79",
              500: "#52945f",
              600: "#3f7349",
              700: "#2c5233",
              800: "#18321d",
              900: "#011203",
            },
            secondary: {
              DEFAULT: "#43705d",
              50: "#e5f8f2",
              100: "#cbe3d9",
              200: "#aecfc2",
              300: "#8fbca9",
              400: "#71a991",
              500: "#589077",
              600: "#43705d",
              700: "#2f5042",
              800: "#193127",
              900: "#001209",
            },
            success: {
              DEFAULT: "#6c8729",
              50: "#f3fae3",
              100: "#e0eec0",
              200: "#cee19c",
              300: "#bad576",
              400: "#a6ca50",
              500: "#8db037",
              600: "#6e892a",
              700: "#4e621d",
              800: "#2e3b0e",
              900: "#0e1500",
            },
            warning: {
              DEFAULT: "#af9600",
              50: "#fffbdb",
              100: "#fff4af",
              200: "#ffed7e",
              300: "#ffe54d",
              400: "#ffde1e",
              500: "#e6c507",
              600: "#b39900",
              700: "#806d00",
              800: "#4d4200",
              900: "#1c1600",
            },
            danger: {
              DEFAULT: "#842f31",
              50: "#ffe9e9",
              100: "#efc6c6",
              200: "#dfa0a2",
              300: "#d07b7d",
              400: "#c25758",
              500: "#a83d3f",
              600: "#842f31",
              700: "#5f2023",
              800: "#3a1214",
              900: "#1b0303",
            },
          },
        },
        light: {
          colors: {
            background: {
              DEFAULT: "#F6F7FD",
            },
            foreground: {
              DEFAULT: "#090A24",
            },
            /*             default: {
              We're keeping the grey default colors from the standard NextUI theme
            }, */
            primary: {
              DEFAULT: "#386641",
              50: "#e8f8eb",
              100: "#cbe5d0",
              200: "#acd2b3",
              300: "#8cc096",
              400: "#6cae79",
              500: "#52945f",
              600: "#3f7349",
              700: "#2c5233",
              800: "#18321d",
              900: "#011203",
            },
            secondary: {
              DEFAULT: "#78AD96",
              50: "#e3f8f2",
              100: "#cae4d9",
              200: "#add0c0",
              300: "#8fbca9",
              400: "#70a890",
              500: "#578f76",
              600: "#426f5c",
              700: "#2d5041",
              800: "#183126",
              900: "#001309",
            },
            success: {
              DEFAULT: "#A7C957",
              50: "#f3fae2",
              100: "#e0edc0",
              200: "#cbe09d",
              300: "#b8d477",
              400: "#a4c751",
              500: "#8bae38",
              600: "#6c8729",
              700: "#4c601c",
              800: "#2d3a0e",
              900: "#0d1400",
            },
            warning: {
              DEFAULT: "#EDC62A",
              50: "#fff9dc",
              100: "#faecb2",
              200: "#f5e086",
              300: "#f1d358",
              400: "#edc62b",
              500: "#d4ad12",
              600: "#a5860a",
              700: "#766004",
              800: "#483a00",
              900: "#1b1300",
            },
            danger: {
              DEFAULT: "#BC4749",
              50: "#ffe8eb",
              100: "#f0c5c6",
              200: "#dfa1a2",
              300: "#d07b7e",
              400: "#c25759",
              500: "#a83d3f",
              600: "#842f31",
              700: "#5f2122",
              800: "#3b1213",
              900: "#1c0303",
            },
          },
        },
      },
    }),
  ],
};
