/** Pure color math used by the theme engine (no platform imports). */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function hex2rgb(h: string): [number, number, number] {
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

export function rgb2hex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

/** Linear blend a→b by t (0..1). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hex2rgb(a);
  const [r2, g2, b2] = hex2rgb(b);
  return rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/** Hex + alpha → rgba() string (RN accepts these in styles). */
export function rgba(h: string, a: number): string {
  const [r, g, b] = hex2rgb(h);
  return `rgba(${r},${g},${b},${a})`;
}

/** Relative luminance (WCAG). */
export function lum(h: string): number {
  const [r, g, b] = hex2rgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Readable ink (near-black or white) for text sitting ON the given color. */
export function ink(h: string): string {
  return lum(h) > 0.5 ? '#14140f' : '#ffffff';
}
