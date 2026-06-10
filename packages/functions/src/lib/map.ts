import { FixtureSchema, type Fixture } from '@repo/core/schemas';

/** Raw API-Sports fixture shape (the fields we consume). */
export interface RawFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: { id: number; season: number; round: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

/** Validate + map a raw fixture into the Firestore shape (sans timestamps). */
export function mapFixture(r: RawFixture): { fixture: Fixture; kickoff: Date } {
  const fixture = FixtureSchema.parse({
    fixtureId: r.fixture.id,
    status: { short: r.fixture.status.short, elapsed: r.fixture.status.elapsed },
    teams: { home: r.teams.home, away: r.teams.away },
    goals: r.goals,
    league: { id: r.league.id, season: r.league.season, round: r.league.round },
  });
  const kickoff = new Date(r.fixture.date);
  if (Number.isNaN(kickoff.getTime())) {
    throw new Error(`mapFixture: invalid date "${r.fixture.date}" for fixture ${r.fixture.id}`);
  }
  return { fixture, kickoff };
}
