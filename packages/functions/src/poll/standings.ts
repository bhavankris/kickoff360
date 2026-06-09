import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { StandingRowSchema } from '@repo/core/schemas';
import type { StandingRow } from '@repo/core/types';
import { admin, db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

interface RawStandingsResponse {
  league: { standings: RawRow[][] };
}
interface RawRow {
  rank: number;
  team: { id: number; name: string };
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  points: number;
  group: string;
}

function mapRow(r: RawRow): StandingRow {
  return StandingRowSchema.parse({
    rank: r.rank,
    teamId: r.team.id,
    teamName: r.team.name,
    played: r.all.played,
    win: r.all.win,
    draw: r.all.draw,
    lose: r.all.lose,
    goalsFor: r.all.goals.for,
    goalsAgainst: r.all.goals.against,
    points: r.points,
  });
}

/** Hourly: refresh standings grouped by group/league. ~24 calls/day. */
export const pollStandings = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    memory: '256MiB',
    secrets: [API_SPORTS_KEY],
    retryCount: 1,
  },
  async () => {
    const res = await apiSports<RawStandingsResponse[]>(API_SPORTS_KEY.value(), '/standings', {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    });

    const groups = res[0]?.league.standings ?? [];
    const batch = db.batch();
    for (const group of groups) {
      const rows: StandingRow[] = [];
      for (const raw of group) {
        try {
          rows.push(mapRow(raw));
        } catch (e) {
          console.warn('pollStandings: skipped invalid row', e);
        }
      }
      const groupName = group[0]?.group ?? 'overall';
      batch.set(
        db.doc(`standings/${groupName.replace(/[^a-zA-Z0-9]/g, '_')}`),
        {
          groupOrLeague: groupName,
          rows,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    await batch.commit();
    console.log(`pollStandings: wrote ${groups.length} group(s)`);
  },
);
