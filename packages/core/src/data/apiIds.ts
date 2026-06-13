/**
 * API-Sports ↔ kickoff360 reference bridge (WC2026: league 1, season 2026).
 * Pure data + pure functions (PURITY RULE). Team ids were verified against
 * the live /standings feed. Several venues come back from /fixtures with a
 * null id, so venues map by normalized NAME, not id.
 *
 * Per-tournament data: a future tournament swaps this module (and teams.ts),
 * not the projection code that consumes it.
 */
import { TEAMS } from './teams';

/** API-Sports team id → ISO alpha-3 code, all 48 WC2026 qualifiers. */
export const API_TEAM_IDS: Record<number, string> = {
  16: 'MEX', 17: 'KOR', 770: 'CZE', 1531: 'RSA',
  5529: 'CAN', 1113: 'BIH', 1569: 'QAT', 15: 'SUI',
  6: 'BRA', 31: 'MAR', 2386: 'HAI', 1108: 'SCO',
  2384: 'USA', 2380: 'PAR', 20: 'AUS', 777: 'TUR',
  25: 'GER', 5530: 'CUW', 1501: 'CIV', 2382: 'ECU',
  1118: 'NED', 12: 'JPN', 5: 'SWE', 28: 'TUN',
  1: 'BEL', 32: 'EGY', 22: 'IRN', 4673: 'NZL',
  9: 'ESP', 1533: 'CPV', 23: 'KSA', 7: 'URU',
  2: 'FRA', 13: 'SEN', 1567: 'IRQ', 1090: 'NOR',
  26: 'ARG', 1532: 'ALG', 775: 'AUT', 1548: 'JOR',
  27: 'POR', 1508: 'COD', 1568: 'UZB', 8: 'COL',
  10: 'ENG', 3: 'CRO', 1504: 'GHA', 11: 'PAN',
};

const norm = (s: string): string => s.toLowerCase().replace(/[^a-z]/g, '');

/** API naming that differs from our display names. */
const TEAM_NAME_ALIASES: Record<string, string> = {
  usa: 'USA',
  korearepublic: 'KOR',
  southkorea: 'KOR',
  capeverdeislands: 'CPV',
  congodr: 'COD',
  cotedivoire: 'CIV',
  turkey: 'TUR',
  bosniaherzegovina: 'BIH',
};

/**
 * Resolve an API-Sports team to an alpha-3 code: by numeric id first,
 * then by normalized name (covers id drift / future tournaments).
 */
export function teamCodeForApi(id: number | null | undefined, name?: string): string | undefined {
  if (id != null && API_TEAM_IDS[id]) return API_TEAM_IDS[id];
  if (!name) return undefined;
  const n = norm(name);
  return TEAM_NAME_ALIASES[n] ?? Object.values(TEAMS).find((t) => norm(t.name) === n)?.code;
}

/** Normalized API venue name → VENUES slug (ids are unreliable: often null). */
export const API_VENUE_NAMES: Record<string, string> = {
  metlifestadium: 'metlife',
  sofistadium: 'sofi',
  attstadium: 'att',
  mercedesbenzstadium: 'mercedes',
  nrgstadium: 'nrg',
  arrowheadstadium: 'arrowhead',
  lumenfield: 'lumen',
  levisstadium: 'levis',
  gillettestadium: 'gillette',
  hardrockstadium: 'hardrock',
  lincolnfinancialfield: 'lincoln',
  estadioazteca: 'azteca',
  estadioakron: 'akron',
  estadiobbva: 'bbva',
  bcplace: 'bcplace',
  bmofield: 'bmo',
};

export function venueSlugForApi(name?: string | null): string | undefined {
  if (!name) return undefined;
  return API_VENUE_NAMES[norm(name)];
}
