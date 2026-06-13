import type { MatchDoc } from '../types';
import { GROUPS, KEEPERS } from '../data/teams';
import { dayKey, relDay, toDate } from './format';

/**
 * Pure derivations over the `matches` collection. Standings, form and the
 * Golden Glove board are all computed client-side from match results, so the
 * backend only has to keep one collection fresh.
 */

const ms = (m: MatchDoc) => toDate(m.kickoff).getTime();

export interface StandingsEntry {
  code: string;
  P: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  GD: number;
  Pts: number;
  /** True when the row includes a provisional in-play result. */
  live: boolean;
  form: ('W' | 'D' | 'L')[];
}

/** Group table from finals (+ live as provisional when includeLive). */
export function standingsFor(matches: MatchDoc[], group: string, includeLive = true): StandingsEntry[] {
  const codes = GROUPS[group] ?? [];
  const rows: Record<string, StandingsEntry> = {};
  for (const c of codes) rows[c] = { code: c, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0, live: false, form: [] };

  matches
    .filter((m) => m.group === group && m.score && (m.status === 'final' || (includeLive && m.status === 'live')))
    .sort((a, b) => ms(a) - ms(b))
    .forEach((m) => {
      const H = rows[m.home];
      const A = rows[m.away];
      if (!H || !A || !m.score) return;
      const { home: h, away: a } = m.score;
      H.P++; A.P++; H.GF += h; H.GA += a; A.GF += a; A.GA += h;
      if (m.status === 'live') { H.live = true; A.live = true; }
      if (h > a) { H.W++; A.L++; H.Pts += 3; H.form.push('W'); A.form.push('L'); }
      else if (h < a) { A.W++; H.L++; A.Pts += 3; A.form.push('W'); H.form.push('L'); }
      else { H.D++; A.D++; H.Pts++; A.Pts++; H.form.push('D'); A.form.push('D'); }
    });

  return Object.values(rows)
    .map((r) => ({ ...r, GD: r.GF - r.GA }))
    .sort((x, y) => y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF || x.code.localeCompare(y.code));
}

export const isTeamMatch = (m: MatchDoc, code: string) => m.home === code || m.away === code;

/** A team's most relevant match: live > next upcoming > last final. */
export function favMatch(matches: MatchDoc[], code: string): MatchDoc | undefined {
  const mine = matches.filter((m) => isTeamMatch(m, code));
  return (
    mine.find((m) => m.status === 'live') ??
    mine.filter((m) => m.status === 'upcoming').sort((a, b) => ms(a) - ms(b))[0] ??
    mine.filter((m) => m.status === 'final').sort((a, b) => ms(b) - ms(a))[0]
  );
}

/** A team's next upcoming fixture. */
export function nextMatch(matches: MatchDoc[], code: string): MatchDoc | undefined {
  return matches
    .filter((m) => isTeamMatch(m, code) && m.status === 'upcoming')
    .sort((a, b) => ms(a) - ms(b))[0];
}

export interface FormResult {
  r: 'W' | 'D' | 'L';
  gf: number;
  ga: number;
  opp: string;
}

/** Results AT THIS World Cup only, completed before `before` (for "no fake history" form). */
export function wcForm(matches: MatchDoc[], code: string, before?: Date): FormResult[] {
  const cutoff = before ? before.getTime() : Date.now();
  return matches
    .filter((m) => isTeamMatch(m, code) && m.status === 'final' && m.score && ms(m) < cutoff)
    .sort((a, b) => ms(a) - ms(b))
    .map((m) => {
      const gf = m.home === code ? m.score!.home : m.score!.away;
      const ga = m.home === code ? m.score!.away : m.score!.home;
      return { r: gf > ga ? 'W' : gf < ga ? 'L' : 'D', gf, ga, opp: m.home === code ? m.away : m.home };
    });
}

export interface DayGroup {
  key: string;
  label: string;
  matches: MatchDoc[];
}

/** Bucket a list by local day, days ascending and matches by kick-off. */
export function matchesByDay(list: MatchDoc[], now: Date = new Date()): DayGroup[] {
  const map: Record<string, MatchDoc[]> = {};
  for (const m of list) (map[dayKey(m.kickoff)] = map[dayKey(m.kickoff)] ?? []).push(m);
  return Object.keys(map)
    .sort()
    .map((key) => ({
      key,
      label: relDay(map[key]![0]!.kickoff, now),
      matches: map[key]!.sort((a, b) => ms(a) - ms(b)),
    }));
}

export interface CleanSheetEntry {
  team: string;
  player: string;
  pos: 'GK';
  cs: number;
  played: number;
  ga: number;
}

/** Derived goalkeeper clean-sheet leaderboard (Golden Glove) from completed matches. */
export function cleanSheets(matches: MatchDoc[]): CleanSheetEntry[] {
  const agg: Record<string, { team: string; cs: number; played: number; ga: number }> = {};
  const bump = (code: string) => (agg[code] = agg[code] ?? { team: code, cs: 0, played: 0, ga: 0 });
  for (const m of matches) {
    if (m.status !== 'final' || !m.score) continue;
    const H = bump(m.home);
    const A = bump(m.away);
    H.played++; A.played++; H.ga += m.score.away; A.ga += m.score.home;
    if (m.score.away === 0) H.cs++;
    if (m.score.home === 0) A.cs++;
  }
  return Object.values(agg)
    .filter((r) => KEEPERS[r.team])
    .map((r) => ({ ...r, player: KEEPERS[r.team]!, pos: 'GK' as const }))
    .sort((x, y) => y.cs - x.cs || x.ga - y.ga || y.played - x.played || x.team.localeCompare(y.team));
}
