import type { Timestamp } from 'firebase/firestore';

/**
 * World-Cup match model — the shapes the kickoff360 screens render.
 * Cloud Functions map the raw API-Sports feed into these documents
 * (the seed script writes the same shapes for local/demo use).
 * Teams are referenced by ISO 3166-1 alpha-3 codes; static team/venue
 * reference data lives in `../data/teams`.
 */

export type MatchStatus = 'upcoming' | 'live' | 'final';

/** `matches/{matchId}` — one doc per fixture, written only by the backend. */
export interface MatchDoc {
  matchId: string;
  /** Group letter A–L; null for knockout rounds. */
  group: string | null;
  /** Group-stage matchday 1–3; null for knockout rounds. */
  matchday: number | null;
  /** Display stage, e.g. "Group D" or "Round of 32". */
  stage: string;
  /** Alpha-3 codes. */
  home: string;
  away: string;
  /** Key into VENUES; null when the venue is unknown/TBD. */
  venueId: string | null;
  kickoff: Timestamp;
  status: MatchStatus;
  /** Null until kick-off. */
  score: { home: number; away: number } | null;
  /** Match minute while live, else null. */
  minute: number | null;
  /** Most recent goal — drives score-flash UI on live cards. */
  lastGoal: { team: string; player: string; minute: number; at: Timestamp } | null;
  updatedAt: Timestamp;
}

export type MatchEventType = 'goal' | 'yellow' | 'red' | 'sub';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  /** Alpha-3 of the team the event belongs to. */
  team: string;
  player: string;
  detail: string;
}

/** Paired home/away values, home first. */
export type StatPair = number[];

export interface MatchStats {
  possession: StatPair;
  shots: StatPair;
  onTarget: StatPair;
  xg: StatPair;
  corners: StatPair;
  fouls: StatPair;
  offsides: StatPair;
  passAcc: StatPair;
  saves: StatPair;
}

export interface LineupPlayer {
  num: string;
  name: string;
  pos: string;
}

export interface LineupSide {
  formation: string;
  xi: LineupPlayer[];
  bench: string[];
}

export interface InjuryNote {
  team: string;
  player: string;
  pos: string;
  /** e.g. "Out — calf", "Doubt — hamstring", "Fit". */
  status: string;
  note: string;
}

/** `matchDetails/{matchId}` — rich match-centre payload, backend-written. */
export interface MatchDetailDoc {
  matchId: string;
  stats: MatchStats | null;
  events: MatchEvent[];
  lineups: { home: LineupSide; away: LineupSide } | null;
  injuries: InjuryNote[];
  preview: string | null;
  referee: string | null;
  attendance: string | null;
  weather: string | null;
  updatedAt: Timestamp;
}

/** `scorers/{id}` — Golden Boot pool (top scorers + assist leaders). */
export interface ScorerDoc {
  player: string;
  /** Alpha-3. */
  team: string;
  goals: number;
  assists: number;
  mins: number;
  shots: number;
  pos: string;
  updatedAt: Timestamp;
}
