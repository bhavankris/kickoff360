import { z } from 'zod';

/**
 * Zod validation (Layer 3) for the match-centre collections. The backend
 * (Cloud Functions / seed script) validates documents against these before
 * writing; timestamps are added server-side and are not part of the schemas.
 */

const Alpha3 = z.string().length(3);

export const MatchStatusSchema = z.enum(['upcoming', 'live', 'final']);

export const MatchSchema = z.object({
  matchId: z.string().min(1),
  group: z.string().length(1),
  matchday: z.number().int().min(1),
  stage: z.string(),
  home: Alpha3,
  away: Alpha3,
  venueId: z.string().min(1),
  status: MatchStatusSchema,
  score: z.object({ home: z.number().int(), away: z.number().int() }).nullable(),
  minute: z.number().int().nullable(),
});

export const MatchEventSchema = z.object({
  minute: z.number().int(),
  type: z.enum(['goal', 'yellow', 'red', 'sub']),
  team: Alpha3,
  player: z.string(),
  detail: z.string(),
});

const Pair = z.array(z.number()).length(2);

export const MatchStatsSchema = z.object({
  possession: Pair,
  shots: Pair,
  onTarget: Pair,
  xg: Pair,
  corners: Pair,
  fouls: Pair,
  offsides: Pair,
  passAcc: Pair,
  saves: Pair,
});

export const LineupSideSchema = z.object({
  formation: z.string(),
  xi: z.array(z.object({ num: z.string(), name: z.string(), pos: z.string() })).length(11),
  bench: z.array(z.string()),
});

export const MatchDetailSchema = z.object({
  matchId: z.string().min(1),
  stats: MatchStatsSchema.nullable(),
  events: z.array(MatchEventSchema),
  lineups: z.object({ home: LineupSideSchema, away: LineupSideSchema }).nullable(),
  injuries: z.array(
    z.object({ team: Alpha3, player: z.string(), pos: z.string(), status: z.string(), note: z.string() }),
  ),
  preview: z.string().nullable(),
  referee: z.string().nullable(),
  attendance: z.string().nullable(),
  weather: z.string().nullable(),
});

export const ScorerSchema = z.object({
  player: z.string(),
  team: Alpha3,
  goals: z.number().int(),
  assists: z.number().int(),
  mins: z.number().int(),
  shots: z.number().int(),
  pos: z.string(),
});
