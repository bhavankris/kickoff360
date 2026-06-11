/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Theme tokens resolve from CSS variables that ThemeProvider sets from
      // computeTheme() via NativeWind vars() — the whole app re-tints when the
      // favourite team / mode / intensity changes. Alpha is baked into each
      // token (they are rgba()/hex strings), so use the bare names; /opacity
      // modifiers are not supported on these.
      colors: {
        canvas: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        surface2: 'var(--c-surface2)',
        surface3: 'var(--c-surface3)',
        line: 'var(--c-line)',
        line2: 'var(--c-line2)',
        ink: 'var(--c-text)',
        muted: 'var(--c-muted)',
        faint: 'var(--c-faint)',
        brand: 'var(--c-brand)',
        'brand-text': 'var(--c-brand-text)',
        'brand-ink': 'var(--c-brand-ink)',
        'brand-soft': 'var(--c-brand-soft)',
        'brand-line': 'var(--c-brand-line)',
        accent: 'var(--c-accent)',
        'accent-text': 'var(--c-accent-text)',
        glass: 'var(--c-glass)',
        'glass-line': 'var(--c-glass-line)',
        live: 'var(--c-live)',
        win: 'var(--c-win)',
      },
      // RN needs an exact fontFamily per weight; these map the design's type
      // system (Archivo for UI, Space Mono for labels/numbers) onto the
      // variants loaded in src/theme/fonts.ts.
      fontFamily: {
        archivo: 'Archivo_400Regular',
        'archivo-medium': 'Archivo_500Medium',
        'archivo-semibold': 'Archivo_600SemiBold',
        'archivo-bold': 'Archivo_700Bold',
        'archivo-extrabold': 'Archivo_800ExtraBold',
        'archivo-black': 'Archivo_900Black',
        mono: 'SpaceMono_400Regular',
        'mono-bold': 'SpaceMono_700Bold',
      },
    },
  },
  plugins: [],
};
