/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#090A24',
        white: '#F6F7FD',
        dark: '#0a0a0a',
        primaryLight: '#78ad96',
        logoDarkGreen: '#43A889',
        logoLightGreen: '#C8DD80',
        darkTransparent: 'rgba(10, 10, 10,0.7)',
        primary: '#628CF6',
        secondary: '#457bac',
        light: '#cfe9ff',
        light2: '#d9edff',
        accent: '#007D57',
        primaryButton: '#43A889',
        secondaryButton: '#C8DD80',
        tertiaryButton: '#c7c7c7',
        hoverButtonColor: '#ddd',
        hoverButtonDangerColor: '#FF6666',
        danger: '#ff3333',
      },
      fontFamily: {
        title: ['var(--font-open-sans)'],
        body: ['var(--font-montserrat)'],
      },
    },
    plugins: [],
  },
};
