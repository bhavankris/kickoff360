import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { PlayerSchema, type Player } from '@repo/core/schemas';
import { admin, db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

interface RawTopScorer {
  player: { id: number; name: string; photo: string };
  statistics: { team: { id: number; name: string }; goals: { total: number | null; assists: number | null } }[];
}

function mapPlayer(r: RawTopScorer): Player {
  const stat = r.statistics[0];
  return PlayerSchema.parse({
    playerId: r.player.id,
    name: r.player.name,
    photo: r.player.photo,
    teamId: stat?.team.id ?? 0,
    teamName: stat?.team.name ?? '',
    goals: stat?.goals.total ?? 0,
    assists: stat?.goals.assists ?? 0,
  });
}

/** Twice a day: refresh top scorers. ~2 calls/day. */
export const pollTopPlayers = onSchedule(
  {
    schedule: 'every 12 hours',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    memory: '256MiB',
    secrets: [API_SPORTS_KEY],
    retryCount: 1,
  },
  async () => {
    const raw = await apiSports<RawTopScorer[]>(API_SPORTS_KEY.value(), '/players/topscorers', {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    });

    const batch = db.batch();
    let written = 0;
    for (const r of raw) {
      try {
        const p = mapPlayer(r);
        batch.set(
          db.doc(`players/${p.playerId}`),
          { ...p, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true },
        );
        written += 1;
      } catch (e) {
        console.warn('pollTopPlayers: skipped invalid player', e);
      }
    }
    await batch.commit();
    console.log(`pollTopPlayers: wrote ${written}/${raw.length} players`);
  },
);
