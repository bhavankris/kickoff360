import { vars } from 'nativewind';
import { paletteFor } from '@repo/core/theme';

/**
 * Turn a country's palette (pure data from core) into a NativeWind style object that
 * sets the CSS variables Tailwind reads (bg-primary, text-ink, ...). Apply the result
 * to a wrapping View's `style`. The future web app sets the same variables via :root CSS.
 */
export const themeFor = (countryCode: string | undefined | null) => {
  const p = paletteFor(countryCode);
  return vars({
    '--c-primary': p.primary,
    '--c-secondary': p.secondary,
    '--c-accent': p.accent,
    '--c-surface': '255 255 255',
    '--c-ink': '17 24 39',
  });
};
