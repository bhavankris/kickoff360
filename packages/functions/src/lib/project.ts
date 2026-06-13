import { MatchSchema, type Fixture, type Match } from '@repo/core/schemas';
import { teamCodeForApi, teamFor, venueSlugForApi } from '@repo/core/data';

/**
 * Layer 1 → Layer 2 projection: raw API-shaped fixtures become the
 * screen-shaped `matches/{id}` docs the app renders. Tournament-agnostic —
 * everything WC2026-specific lives in @repo/core/data (teams, id bridge).
 */

export type ProjectedMatch = Match;

/**
 * API-Sports status.short → app status. Postponed/cancelled map to
 * 'upcoming' (they render as scheduled; score stays null), awarded/walkover
 * to 'final' (the API carries the awarded score).
 */
const STATUS: Record<string, 'upcoming' | 'live' | 'final'> = {
  TBD: 'upcoming', NS: 'upcoming', PST: 'upcoming', CANC: 'upcoming',
  '1H': 'live', HT: 'live', '2H': 'live', ET: 'live', BT: 'live',
  P: 'live', LIVE: 'live', INT: 'live', SUSP: 'live',
  FT: 'final', AET: 'final', PEN: 'final', ABD: 'final', AWD: 'final', WO: 'final',
};

const GROUP_ROUND = /^Group Stage - (\d+)$/;

/**
 * Project a validated raw fixture into the match shape, or null when a team
 * can't be resolved yet (knockout placeholders like "Winner Match 74" stay
 * unprojected until the pairing is known).
 */
export function projectFixture(f: Fixture): ProjectedMatch | null {
  const home = teamCodeForApi(f.teams.home.id, f.teams.home.name);
  const away = teamCodeForApi(f.teams.away.id, f.teams.away.name);
  if (!home || !away) return null;

  const status = STATUS[f.status.short] ?? 'upcoming';
  const groupRound = GROUP_ROUND.exec(f.league.round);
  // Group letter comes from the (static) draw, not the round string — the
  // API's round is "Group Stage - N" with no letter.
  const group = groupRound ? (teamFor(home)?.group ?? null) : null;
  const matchday = groupRound?.[1] ? Number(groupRound[1]) : null;
  const stage = group ? `Group ${group}` : groupRound ? 'Group Stage' : f.league.round;

  const score =
    status !== 'upcoming' && f.goals.home != null && f.goals.away != null
      ? { home: f.goals.home, away: f.goals.away }
      : null;

  return MatchSchema.parse({
    matchId: String(f.fixtureId),
    group,
    matchday,
    stage,
    home,
    away,
    venueId: venueSlugForApi(f.venue?.name) ?? null,
    status,
    score,
    minute: status === 'live' ? f.status.elapsed : null,
  });
}
