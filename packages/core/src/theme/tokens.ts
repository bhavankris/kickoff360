import { teamFor } from '../data/teams';
import { ink, lum, mix, rgba } from './color';

/**
 * kickoff360 theme engine — computeTheme(code, { intensity, mode }) → token map.
 * Pre-theme (code=null) uses the neutral kickoff360 palette with the electric-green
 * brand; once a favourite team is picked the whole app adopts its colors.
 * Pure data out (hex/rgba strings) so mobile and a future web app share it.
 */

export type ThemeMode = 'dark' | 'light';
export type ThemeIntensity = 'subtle' | 'full';

export interface ThemeOptions {
  intensity?: ThemeIntensity;
  mode?: ThemeMode;
}

export interface ThemeTokens {
  mode: ThemeMode;
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  line: string;
  line2: string;
  text: string;
  muted: string;
  faint: string;
  /** Raw team brand color — fills, big blocks. */
  brand: string;
  /** Brand tuned to stay readable as TEXT on the canvas. */
  brandText: string;
  /** Ink that sits on top of `brand` fills. */
  brandInk: string;
  brandSoft: string;
  brandLine: string;
  accent: string;
  accentText: string;
  glass: string;
  glassLine: string;
  /** Header gradient stops (render top→bottom / 150deg). */
  headerFrom: string;
  headerTo: string;
  live: string;
  win: string;
}

const NEUTRAL_BRAND = '#21e08a'; // kickoff360 signature electric green

/** Brand color tuned to stay readable as TEXT on the canvas. */
function brandTextFor(brand: string, mode: ThemeMode): string {
  const L = lum(brand);
  if (mode === 'light') {
    if (L > 0.55) return mix(brand, '#0a0e12', 0.55);
    if (L > 0.4) return mix(brand, '#0a0e12', 0.38);
    if (L > 0.24) return mix(brand, '#0a0e12', 0.14);
    return brand;
  }
  if (L < 0.18) return mix(brand, '#ffffff', 0.58);
  if (L < 0.3) return mix(brand, '#ffffff', 0.34);
  return brand;
}

export function computeTheme(code: string | null | undefined, opts: ThemeOptions = {}): ThemeTokens {
  const intensity: ThemeIntensity = opts.intensity ?? 'full';
  const mode: ThemeMode = opts.mode === 'light' ? 'light' : 'dark';
  const team = code ? teamFor(code) : undefined;
  const brand = team ? team.primary : NEUTRAL_BRAND;
  const accent = team ? team.accent : '#ffd34d';
  const lightFlag = team ? team.light : false;
  const full = intensity === 'full' && !!team;

  const brandInk = ink(brand);
  const brandText = brandTextFor(brand, mode);
  const accentText = brandTextFor(accent, mode);

  if (mode === 'light') {
    const baseBg = '#eef1f6';
    const baseSurf = '#ffffff';
    const baseSurf2 = '#f0f3f8';
    const bg = full ? mix(baseBg, brand, lightFlag ? 0.1 : 0.13) : baseBg;
    const surface = full ? mix(baseSurf, brand, lightFlag ? 0.03 : 0.045) : baseSurf;
    const surface2 = full ? mix(baseSurf2, brand, lightFlag ? 0.06 : 0.09) : baseSurf2;
    return {
      mode,
      bg,
      surface,
      surface2,
      surface3: mix(surface2, '#0a0e12', 0.05),
      line: 'rgba(15,23,35,0.10)',
      line2: 'rgba(15,23,35,0.17)',
      text: '#10151d',
      muted: '#586271',
      faint: '#8b95a4',
      brand,
      brandText,
      brandInk,
      brandSoft: rgba(brandText, full ? 0.15 : 0.13),
      brandLine: rgba(brandText, 0.4),
      accent,
      accentText,
      glass: 'rgba(255,255,255,0.60)',
      glassLine: 'rgba(15,23,35,0.12)',
      headerFrom: full
        ? mix('#ffffff', brand, lightFlag ? 0.18 : 0.26)
        : mix('#ffffff', brand, 0.1),
      headerTo: bg,
      live: '#ff4d4f',
      win: '#1faa5e',
    };
  }

  const black = '#08090d';
  const bg = full ? mix(black, brand, lightFlag ? 0.07 : 0.1) : '#0a0c11';
  const surface = full ? mix('#12151c', brand, lightFlag ? 0.06 : 0.09) : '#12151c';
  const surface2 = full ? mix('#181c25', brand, lightFlag ? 0.07 : 0.11) : '#181c25';
  return {
    mode,
    bg,
    surface,
    surface2,
    surface3: mix(surface2, '#ffffff', 0.04),
    line: 'rgba(255,255,255,0.08)',
    line2: 'rgba(255,255,255,0.14)',
    text: '#f3f6f9',
    muted: '#9aa3b2',
    faint: '#646c7b',
    brand,
    brandText,
    brandInk,
    brandSoft: rgba(brand, full ? 0.18 : 0.16),
    brandLine: rgba(brandText, 0.4),
    accent,
    accentText,
    glass: 'rgba(0,0,0,0.24)',
    glassLine: 'rgba(255,255,255,0.10)',
    headerFrom: full ? mix(brand, black, 0.18) : mix('#12151c', brand, 0.1),
    headerTo: bg,
    live: '#ff4d4f',
    win: '#34d27b',
  };
}
