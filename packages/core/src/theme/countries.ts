/**
 * Country theme palettes — pure data, no platform import (PURITY RULE).
 * RGB triples (space-separated) so they drop straight into CSS variables / NativeWind
 * `vars()`. Keyed by ISO 3166-1 alpha-3. Phase 0 ships a handful; Phase 1 adds all 48.
 */

export interface CountryPalette {
  primary: string;
  secondary: string;
  accent: string;
}

export const DEFAULT_PALETTE: CountryPalette = {
  primary: '30 64 175',
  secondary: '241 245 249',
  accent: '234 179 8',
};

export const COUNTRY_RGB: Record<string, CountryPalette> = {
  BRA: { primary: '0 156 59', secondary: '255 223 0', accent: '0 39 118' },
  ARG: { primary: '117 170 219', secondary: '255 255 255', accent: '252 209 22' },
  FRA: { primary: '0 35 149', secondary: '255 255 255', accent: '237 41 57' },
  ENG: { primary: '255 255 255', secondary: '207 20 43', accent: '0 38 84' },
  ESP: { primary: '198 11 30', secondary: '255 196 0', accent: '173 28 47' },
  DEFAULT: DEFAULT_PALETTE,
};

/** Palette for a country code, falling back to DEFAULT. */
export function paletteFor(countryCode: string | undefined | null): CountryPalette {
  if (!countryCode) return DEFAULT_PALETTE;
  return COUNTRY_RGB[countryCode] ?? DEFAULT_PALETTE;
}
