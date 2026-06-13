import { MatchDetailSchema } from '@repo/core/schemas';
import { teamCodeForApi } from '@repo/core/data';

/**
 * Map the three API-Sports match-centre feeds (/fixtures/events, /lineups,
 * /statistics) into the `matchDetails/{matchId}` shape the app renders.
 */

// ── Raw API shapes (the fields we consume) ───────────────────────────

export interface RawEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string; // 'Goal' | 'Card' | 'subst' | 'Var'
  detail: string; // 'Normal Goal' | 'Penalty' | 'Yellow Card' | 'Substitution 1' | ...
  comments: string | null;
}

export interface RawLineup {
  team: { id: number; name: string };
  formation: string | null;
  startXI: { player: { id: number; name: string; number: number; pos: string | null } }[];
  substitutes: { player: { id: number; name: string; number: number; pos: string | null } }[];
}

export interface RawTeamStats {
  team: { id: number; name: string };
  statistics: { type: string; value: number | string | null }[];
}

// ── Mapping helpers ──────────────────────────────────────────────────

const POS: Record<string, string> = { G: 'GK', D: 'DF', M: 'MF', F: 'FW' };

type AppEvent = { minute: number; type: 'goal' | 'yellow' | 'red' | 'sub'; team: string; player: string; detail: string };

export function mapEvents(raw: RawEvent[]): AppEvent[] {
  const out: AppEvent[] = [];
  for (const e of raw) {
    const team = teamCodeForApi(e.team.id, e.team.name);
    if (!team) continue;
    const minute = e.time.elapsed + (e.time.extra ?? 0);
    if (e.type === 'Goal') {
      if (e.detail === 'Missed Penalty') continue;
      const detail =
        e.detail === 'Penalty' ? 'Penalty'
        : e.detail === 'Own Goal' ? 'Own goal'
        : e.assist.name ? `Assist ${e.assist.name}`
        : 'Goal';
      out.push({ minute, type: 'goal', team, player: e.player.name ?? '', detail });
    } else if (e.type === 'Card') {
      const type = e.detail.startsWith('Red') ? 'red' : 'yellow';
      out.push({ minute, type, team, player: e.player.name ?? '', detail: e.comments ?? e.detail });
    } else if (e.type === 'subst') {
      // API: `assist` is the player coming on, `player` the one going off.
      out.push({
        minute,
        type: 'sub',
        team,
        player: e.assist.name ?? e.player.name ?? '',
        detail: e.player.name ? `On for ${e.player.name}` : 'Substitution',
      });
    }
    // 'Var' events are dropped — the app's timeline has no VAR row type.
  }
  return out.sort((a, b) => a.minute - b.minute);
}

type AppLineupSide = { formation: string; xi: { num: string; name: string; pos: string }[]; bench: string[] };

function mapLineupSide(raw: RawLineup): AppLineupSide | null {
  if (!raw.formation || raw.startXI.length !== 11) return null;
  return {
    formation: raw.formation,
    xi: raw.startXI.map(({ player }) => ({
      num: String(player.number ?? ''),
      name: player.name,
      pos: POS[player.pos ?? ''] ?? player.pos ?? '',
    })),
    bench: raw.substitutes.map(({ player }) => (player.pos === 'G' ? `${player.name} (GK)` : player.name)),
  };
}

/** Both sides or nothing — the pitch needs two full XIs. */
export function mapLineups(
  raw: RawLineup[],
  homeCode: string,
): { home: AppLineupSide; away: AppLineupSide } | null {
  if (raw.length < 2) return null;
  const sides = raw.map((l) => ({ code: teamCodeForApi(l.team.id, l.team.name), side: mapLineupSide(l) }));
  const home = sides.find((s) => s.code === homeCode)?.side;
  const away = sides.find((s) => s.code !== homeCode)?.side;
  return home && away ? { home, away } : null;
}

/** API stat label → MatchStats key. */
const STAT_KEYS: Record<string, string> = {
  'Ball Possession': 'possession',
  'Total Shots': 'shots',
  'Shots on Goal': 'onTarget',
  expected_goals: 'xg',
  'Corner Kicks': 'corners',
  Fouls: 'fouls',
  Offsides: 'offsides',
  'Passes %': 'passAcc',
  'Goalkeeper Saves': 'saves',
};

const num = (v: number | string | null): number =>
  v == null ? 0 : typeof v === 'number' ? v : Number(String(v).replace('%', '')) || 0;

export function mapStats(raw: RawTeamStats[], homeCode: string): Record<string, number[]> | null {
  if (raw.length < 2) return null;
  const homeFirst = [...raw].sort((a) =>
    teamCodeForApi(a.team.id, a.team.name) === homeCode ? -1 : 1,
  );
  const pairs: Record<string, number[]> = {
    possession: [0, 0], shots: [0, 0], onTarget: [0, 0], xg: [0, 0], corners: [0, 0],
    fouls: [0, 0], offsides: [0, 0], passAcc: [0, 0], saves: [0, 0],
  };
  homeFirst.forEach((side, i) => {
    for (const s of side.statistics) {
      const key = STAT_KEYS[s.type];
      if (key) pairs[key]![i] = num(s.value);
    }
  });
  return pairs;
}

/** Assemble + validate the full matchDetails doc (sans timestamps). */
export function projectDetail(args: {
  matchId: string;
  homeCode: string;
  events: RawEvent[];
  lineups: RawLineup[];
  stats: RawTeamStats[];
  referee: string | null;
}) {
  return MatchDetailSchema.parse({
    matchId: args.matchId,
    stats: mapStats(args.stats, args.homeCode),
    events: mapEvents(args.events),
    lineups: mapLineups(args.lineups, args.homeCode),
    injuries: [],
    preview: null,
    referee: args.referee,
    attendance: null,
    weather: null,
  });
}
