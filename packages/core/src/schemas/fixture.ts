import { z } from 'zod';

/**
 * Zod validation (Layer 3 of 4). Cloud Functions validate raw API-Sports payloads
 * against these schemas before writing to Firestore. Derive TS types from the
 * schema so there is a single source of truth.
 */

export const TeamRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
});

export const FixtureSchema = z.object({
  fixtureId: z.number().int(),
  status: z.object({
    short: z.string(),
    elapsed: z.number().nullable(),
  }),
  teams: z.object({
    home: TeamRefSchema,
    away: TeamRefSchema,
  }),
  goals: z.object({
    home: z.number().nullable(),
    away: z.number().nullable(),
  }),
  league: z.object({
    id: z.number(),
    season: z.number(),
    round: z.string(),
  }),
  /** API venue ids are often null for WC2026 — match venues by name. */
  venue: z
    .object({
      id: z.number().nullable(),
      name: z.string().nullable(),
      city: z.string().nullable(),
    })
    .nullable(),
  referee: z.string().nullable(),
});

export type Fixture = z.infer<typeof FixtureSchema>;

export const StandingRowSchema = z.object({
  rank: z.number().int(),
  teamId: z.number().int(),
  teamName: z.string(),
  played: z.number().int(),
  win: z.number().int(),
  draw: z.number().int(),
  lose: z.number().int(),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
  points: z.number().int(),
});

// NB: the row TYPE is owned by ../types (StandingRow). We only export the schema
// here to avoid a duplicate `StandingRow` export from the package root barrel.

export const PlayerSchema = z.object({
  playerId: z.number().int(),
  name: z.string(),
  photo: z.string(),
  teamId: z.number().int(),
  teamName: z.string(),
  goals: z.number().int(),
  assists: z.number().int(),
});

export type Player = z.infer<typeof PlayerSchema>;
