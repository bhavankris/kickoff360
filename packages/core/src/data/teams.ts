/**
 * WC2026 reference data — 48 teams across 12 groups (pure data, PURITY RULE).
 * Teams and group assignments mirror the REAL WC2026 draw as served by
 * API-Sports (league 1, season 2026) /standings — see ./apiIds for the
 * numeric-id bridge. Flags are stylized banded chips (dir = horizontal/
 * vertical, bands = colors) so no image assets are needed. Theming uses
 * primary + accent; `light` means the primary is bright enough to need dark
 * text on top of it. Codes are ISO 3166-1 alpha-3.
 */

export interface Team {
  code: string;
  name: string;
  group: string;
  /** Primary brand color (hex). */
  primary: string;
  /** Accent color (hex). */
  accent: string;
  /** True when `primary` needs dark ink on top. */
  light: boolean;
  /** Flag band direction: 'h' rows, 'v' columns. */
  dir: 'h' | 'v';
  /** Flag band colors, top→bottom or left→right. */
  bands: string[];
}

type TeamTuple = [string, string, string, string, string, boolean, 'h' | 'v', string[]];

const T: TeamTuple[] = [
  // Group A
  ['MEX', 'Mexico',         'A', '#0a7d4b', '#d81e3f', false, 'v', ['#0a7d4b', '#f4f4f0', '#d81e3f']],
  ['KOR', 'South Korea',    'A', '#c60c30', '#0a3478', false, 'h', ['#f4f4f0', '#c60c30', '#0a3478']],
  ['CZE', 'Czech Republic', 'A', '#d7141a', '#11457e', false, 'h', ['#f4f4f0', '#d7141a', '#11457e']],
  ['RSA', 'South Africa',   'A', '#007a4d', '#ffb612', false, 'h', ['#de3831', '#007a4d', '#001489']],
  // Group B
  ['CAN', 'Canada',         'B', '#d52b1e', '#f4f4f0', false, 'v', ['#d52b1e', '#f4f4f0', '#d52b1e']],
  ['BIH', 'Bosnia & Herzegovina', 'B', '#002f6c', '#fcd116', false, 'v', ['#002f6c', '#fcd116', '#002f6c']],
  ['QAT', 'Qatar',          'B', '#8a1538', '#f4f4f0', false, 'v', ['#f4f4f0', '#8a1538', '#8a1538']],
  ['SUI', 'Switzerland',    'B', '#d8243b', '#f4f4f0', false, 'v', ['#d8243b', '#f4f4f0', '#d8243b']],
  // Group C
  ['BRA', 'Brazil',         'C', '#009739', '#ffdf00', false, 'v', ['#009739', '#ffdf00', '#0a2d8f']],
  ['MAR', 'Morocco',        'C', '#c1272d', '#0a6233', false, 'h', ['#c1272d', '#c1272d', '#0a6233']],
  ['HAI', 'Haiti',          'C', '#0a209f', '#d81e3f', false, 'h', ['#0a209f', '#0a209f', '#d81e3f']],
  ['SCO', 'Scotland',       'C', '#0a4f9e', '#f4f4f0', false, 'h', ['#0a4f9e', '#f4f4f0', '#0a4f9e']],
  // Group D
  ['USA', 'United States',  'D', '#0a3161', '#b31942', false, 'h', ['#0a3161', '#f4f4f0', '#b31942']],
  ['PAR', 'Paraguay',       'D', '#d52b1e', '#0a38a8', false, 'h', ['#d52b1e', '#f4f4f0', '#0a38a8']],
  ['AUS', 'Australia',      'D', '#0a8a52', '#ffce00', false, 'h', ['#0a2d8f', '#0a8a52', '#ffce00']],
  ['TUR', 'Türkiye',        'D', '#e30a17', '#f4f4f0', false, 'h', ['#e30a17', '#f4f4f0', '#e30a17']],
  // Group E
  ['GER', 'Germany',        'E', '#1a1f2b', '#d4af37', false, 'h', ['#1a1a1a', '#d81e3f', '#ffce00']],
  ['CUW', 'Curaçao',        'E', '#0a2d8f', '#ffce00', false, 'h', ['#0a2d8f', '#ffce00', '#0a2d8f']],
  ['CIV', 'Ivory Coast',    'E', '#f77f00', '#0a8a52', false, 'v', ['#f77f00', '#f4f4f0', '#0a8a52']],
  ['ECU', 'Ecuador',        'E', '#ffce00', '#0a2d8f', true,  'h', ['#ffce00', '#0a2d8f', '#d81e3f']],
  // Group F
  ['NED', 'Netherlands',    'F', '#f36c21', '#0a2d8f', false, 'h', ['#ae1c28', '#f4f4f0', '#0a2d8f']],
  ['JPN', 'Japan',          'F', '#bc002d', '#f4f4f0', false, 'h', ['#f4f4f0', '#bc002d', '#f4f4f0']],
  ['SWE', 'Sweden',         'F', '#006aa7', '#fecc02', false, 'h', ['#006aa7', '#fecc02', '#006aa7']],
  ['TUN', 'Tunisia',        'F', '#e70013', '#f4f4f0', false, 'v', ['#e70013', '#f4f4f0', '#e70013']],
  // Group G
  ['BEL', 'Belgium',        'G', '#e8112d', '#ffce00', false, 'v', ['#1a1a1a', '#ffce00', '#e8112d']],
  ['EGY', 'Egypt',          'G', '#c8102e', '#1a1a1a', false, 'h', ['#c8102e', '#f4f4f0', '#1a1a1a']],
  ['IRN', 'Iran',           'G', '#239f40', '#da0000', false, 'h', ['#239f40', '#f4f4f0', '#da0000']],
  ['NZL', 'New Zealand',    'G', '#1a1f2b', '#d81e3f', false, 'h', ['#1a1f2b', '#f4f4f0', '#d81e3f']],
  // Group H
  ['ESP', 'Spain',          'H', '#aa151b', '#f1bf00', false, 'h', ['#aa151b', '#f1bf00', '#aa151b']],
  ['CPV', 'Cape Verde',     'H', '#003893', '#f7d116', false, 'h', ['#003893', '#f4f4f0', '#cf2027']],
  ['KSA', 'Saudi Arabia',   'H', '#0a6c35', '#f4f4f0', false, 'h', ['#0a6c35', '#0a6c35', '#0a6c35']],
  ['URU', 'Uruguay',        'H', '#5cb8e4', '#0a2d8f', true,  'h', ['#5cb8e4', '#f4f4f0', '#5cb8e4']],
  // Group I
  ['FRA', 'France',         'I', '#1e3a8a', '#ef4135', false, 'v', ['#1e3a8a', '#f4f4f0', '#ef4135']],
  ['SEN', 'Senegal',        'I', '#0a8a52', '#ffce00', false, 'v', ['#0a8a52', '#ffce00', '#d81e3f']],
  ['IRQ', 'Iraq',           'I', '#ce1126', '#007a3d', false, 'h', ['#ce1126', '#f4f4f0', '#1a1a1a']],
  ['NOR', 'Norway',         'I', '#ba0c2f', '#00205b', false, 'h', ['#ba0c2f', '#f4f4f0', '#00205b']],
  // Group J
  ['ARG', 'Argentina',      'J', '#5fb6e6', '#f4f4f0', true,  'h', ['#5fb6e6', '#f4f4f0', '#5fb6e6']],
  ['ALG', 'Algeria',        'J', '#0a6233', '#d21034', false, 'v', ['#0a6233', '#f4f4f0', '#d21034']],
  ['AUT', 'Austria',        'J', '#ed2939', '#f4f4f0', false, 'h', ['#ed2939', '#f4f4f0', '#ed2939']],
  ['JOR', 'Jordan',         'J', '#0a7d4b', '#d81e3f', false, 'h', ['#1a1a1a', '#f4f4f0', '#0a7d4b']],
  // Group K
  ['POR', 'Portugal',       'K', '#da291c', '#0a6600', false, 'v', ['#0a6600', '#0a6600', '#da291c']],
  ['COD', 'DR Congo',       'K', '#007fff', '#f7d618', false, 'v', ['#007fff', '#f7d618', '#ce1021']],
  ['UZB', 'Uzbekistan',     'K', '#1eb53a', '#0099b5', false, 'h', ['#0099b5', '#f4f4f0', '#1eb53a']],
  ['COL', 'Colombia',       'K', '#fcd116', '#0a3893', true,  'h', ['#fcd116', '#0a3893', '#d81e3f']],
  // Group L
  ['ENG', 'England',        'L', '#cf142b', '#1d3a8a', false, 'v', ['#f4f4f0', '#cf142b', '#f4f4f0']],
  ['CRO', 'Croatia',        'L', '#d8243b', '#1741a6', false, 'h', ['#d8243b', '#f4f4f0', '#1741a6']],
  ['GHA', 'Ghana',          'L', '#0a8a52', '#ffce00', false, 'h', ['#d81e3f', '#ffce00', '#0a8a52']],
  ['PAN', 'Panama',         'L', '#d81e3f', '#072357', false, 'v', ['#072357', '#f4f4f0', '#d81e3f']],
];

export const TEAMS: Record<string, Team> = {};
for (const [code, name, group, primary, accent, light, dir, bands] of T) {
  TEAMS[code] = { code, name, group, primary, accent, light, dir, bands };
}

/** Team by alpha-3 code, or undefined for unknown codes. */
export const teamFor = (code: string): Team | undefined => TEAMS[code];

/** Group letter (A–L) → member team codes, in seeding order. */
export const GROUPS: Record<string, string[]> = {};
for (const [code, , group] of T) {
  (GROUPS[group] = GROUPS[group] ?? []).push(code);
}

/** All teams sorted by display name. */
export const allTeams = (): Team[] =>
  Object.values(TEAMS).sort((a, b) => a.name.localeCompare(b.name));

// ── Venues (WC2026 host stadiums) ────────────────────────────────────
export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  cap: number;
  pitch: string;
}

export const VENUES: Record<string, Venue> = {
  metlife:   { id: 'metlife',   name: 'MetLife Stadium',         city: 'New York / NJ', country: 'USA',    cap: 82500, pitch: 'Hybrid grass' },
  sofi:      { id: 'sofi',      name: 'SoFi Stadium',            city: 'Los Angeles',   country: 'USA',    cap: 70240, pitch: 'Natural grass' },
  att:       { id: 'att',       name: 'AT&T Stadium',            city: 'Dallas',        country: 'USA',    cap: 80000, pitch: 'Retractable roof' },
  mercedes:  { id: 'mercedes',  name: 'Mercedes-Benz Stadium',   city: 'Atlanta',       country: 'USA',    cap: 71000, pitch: 'Natural grass' },
  nrg:       { id: 'nrg',       name: 'NRG Stadium',             city: 'Houston',       country: 'USA',    cap: 72220, pitch: 'Retractable roof' },
  arrowhead: { id: 'arrowhead', name: 'Arrowhead Stadium',       city: 'Kansas City',   country: 'USA',    cap: 76416, pitch: 'Natural grass' },
  lumen:     { id: 'lumen',     name: 'Lumen Field',             city: 'Seattle',       country: 'USA',    cap: 68740, pitch: 'Hybrid grass' },
  levis:     { id: 'levis',     name: "Levi's Stadium",          city: 'San Francisco', country: 'USA',    cap: 68500, pitch: 'Natural grass' },
  gillette:  { id: 'gillette',  name: 'Gillette Stadium',        city: 'Boston',        country: 'USA',    cap: 65878, pitch: 'Natural grass' },
  hardrock:  { id: 'hardrock',  name: 'Hard Rock Stadium',       city: 'Miami',         country: 'USA',    cap: 65326, pitch: 'Natural grass' },
  lincoln:   { id: 'lincoln',   name: 'Lincoln Financial Field', city: 'Philadelphia',  country: 'USA',    cap: 69596, pitch: 'Hybrid grass' },
  azteca:    { id: 'azteca',    name: 'Estadio Azteca',          city: 'Mexico City',   country: 'Mexico', cap: 87523, pitch: 'Natural grass' },
  akron:     { id: 'akron',     name: 'Estadio Akron',           city: 'Guadalajara',   country: 'Mexico', cap: 49850, pitch: 'Natural grass' },
  bbva:      { id: 'bbva',      name: 'Estadio BBVA',            city: 'Monterrey',     country: 'Mexico', cap: 53500, pitch: 'Natural grass' },
  bcplace:   { id: 'bcplace',   name: 'BC Place',                city: 'Vancouver',     country: 'Canada', cap: 54500, pitch: 'Hybrid grass' },
  bmo:       { id: 'bmo',       name: 'BMO Field',               city: 'Toronto',       country: 'Canada', cap: 45500, pitch: 'Natural grass' },
};

export const venueFor = (id: string | null | undefined): Venue | undefined =>
  id ? VENUES[id] : undefined;

/** First-choice goalkeeper per nation — used for the derived Golden Glove board. */
export const KEEPERS: Record<string, string> = {
  BRA: 'Alisson',           ARG: 'Emiliano Martínez', FRA: 'Mike Maignan',
  ENG: 'Jordan Pickford',   POR: 'Diogo Costa',       ESP: 'Unai Simón',
  GER: 'M. ter Stegen',     NED: 'Bart Verbruggen',   CZE: 'J. Staněk',
  USA: 'Matt Turner',       JPN: 'Zion Suzuki',       CRO: 'D. Livaković',
  SWE: 'Robin Olsen',       AUT: 'Patrick Pentz',     BEL: 'Koen Casteels',
  URU: 'Sergio Rochet',     COL: 'Camilo Vargas',     MEX: 'Guillermo Ochoa',
  SUI: 'Yann Sommer',       NOR: 'Ørjan Nyland',      TUR: 'U. Çakır',
  RSA: 'Ronwen Williams',
};
