/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Colours resolve from CSS variables set per-country by ThemeProvider via vars().
      // Use as className="bg-primary text-ink".
      colors: {
        primary: 'rgb(var(--c-primary) / <alpha-value>)',
        secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
