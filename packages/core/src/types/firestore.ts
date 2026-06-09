import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore document shapes — the TypeScript source of truth (Layer 1 of 4).
 * Mobile, web, and Cloud Functions all import these. Keep in sync with the Zod
 * schemas in ../schemas and the Security Rules in firestore.rules.
 */

/** `users/{uid}` — written by the client during onboarding. */
export interface UserDoc {
  email: string;
  nameFromGoogle: string;
  displayName: string;
  /** ISO 3166-1 alpha-3, e.g. "BRA". */
  countryCode: string;
  onboardingComplete: boolean;
  createdAt: Timestamp;
}

export interface TeamRef {
  id: number;
  name: string;
  logo: string;
}

/** `fixtures/{fixtureId}` — written only by Cloud Functions polling API-Sports. */
export interface FixtureDoc {
  fixtureId: number;
  status: { short: string; elapsed: number | null };
  teams: { home: TeamRef; away: TeamRef };
  goals: { home: number | null; away: number | null };
  league: { id: number; season: number; round: string };
  utcKickoff: Timestamp;
  updatedAt: Timestamp;
}

export interface StandingRow {
  rank: number;
  teamId: number;
  teamName: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

/** `standings/{groupOrLeague}` — written only by Cloud Functions. */
export interface StandingsDoc {
  groupOrLeague: string;
  rows: StandingRow[];
  updatedAt: Timestamp;
}

/** `players/{playerId}` — top players, written only by Cloud Functions. */
export interface PlayerDoc {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  goals: number;
  assists: number;
  updatedAt: Timestamp;
}

/** `config/runtime` — flips live polling on match days (functions read/write). */
export interface RuntimeConfigDoc {
  liveActive: boolean;
  season: number;
  leagueId: number;
}
