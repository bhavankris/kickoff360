import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { PlayerSchema, ScorerSchema, type Player } from '@repo/core/schemas';
import { teamCodeForApi } from '@repo/core/data';
import { db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON, FieldValue } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

interface RawTopPlayer {
  player: { id: number; name: string; photo: string };
  statistics: {
    team: { id: number; name: string };
    games: { minutes: number | null; position: string | null };
    shots: { total: number | null };
    goals: { total: number | null; assists: number | null };
  }[];
}

function mapPlayer(r: RawTopPlayer): Player {
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

const POS: Record<string, string> = {
  Goalkeeper: 'GK',
  Defender: 'DF',
  Midfielder: 'MF',
  Attacker: 'FW',
};

/** Layer-2 projection: the Golden Boot pool the Players screen renders. */
function mapScorer(r: RawTopPlayer) {
  const stat = r.statistics[0];
  const team = teamCodeForApi(stat?.team.id, stat?.team.name);
  if (!team) return null;
  return ScorerSchema.parse({
    player: r.player.name,
    team,
    goals: stat?.goals.total ?? 0,
    assists: stat?.goals.assists ?? 0,
    mins: stat?.games.minutes ?? 0,
    shots: stat?.shots.total ?? 0,
    pos: POS[stat?.games.position ?? ''] ?? '',
  });
}

/** Twice a day: refresh top scorers + assist leaders. ~4 calls/day. */
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
    const params = { league: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON };
    const [scorers, assisters] = await Promise.all([
      apiSports<RawTopPlayer[]>(API_SPORTS_KEY.value(), '/players/topscorers', params),
      apiSports<RawTopPlayer[]>(API_SPORTS_KEY.value(), '/players/topassists', params),
    ]);

    // Merge the two pools by player id — many appear in both lists.
    const pool = new Map<number, RawTopPlayer>();
    for (const r of [...scorers, ...assisters]) pool.set(r.player.id, r);

    const batch = db.batch();
    let written = 0;
    for (const r of pool.values()) {
      try {
        const p = mapPlayer(r);
        batch.set(
          db.doc(`players/${p.playerId}`),
          { ...p, updatedAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
        const s = mapScorer(r);
        if (s) {
          batch.set(
            db.doc(`scorers/${r.player.id}`),
            { ...s, updatedAt: FieldValue.serverTimestamp() },
            { merge: true },
          );
        }
        written += 1;
      } catch (e) {
        console.warn('pollTopPlayers: skipped invalid player', e);
      }
    }
    await batch.commit();
    console.log(`pollTopPlayers: wrote ${written}/${pool.size} players (+scorers)`);
  },
);
