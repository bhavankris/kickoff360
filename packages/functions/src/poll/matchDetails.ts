import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { db, FieldValue, Timestamp } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';
import {
  projectDetail,
  type RawEvent,
  type RawLineup,
  type RawTeamStats,
} from '../lib/projectDetail.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

/** Lineups publish ~40–60 min before kick-off. */
const LOOKAHEAD_MS = 75 * 60 * 1000;
/** Covers a full match in play plus one final sweep after FT. */
const LOOKBACK_MS = 3 * 60 * 60 * 1000;

/**
 * Every minute on match days (same liveActive gate as pollLiveScores):
 * refresh the match-centre payload for matches near kick-off.
 *   upcoming → lineups only (1 call)
 *   live     → events + lineups + statistics (3 calls)
 *   final    → one last full fetch, then marked `final` and never re-polled
 * Worst case (2 live + 2 imminent): ~8 calls/min inside live windows only.
 */
export const pollMatchDetails = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    memory: '256MiB',
    secrets: [API_SPORTS_KEY],
    retryCount: 1,
  },
  async () => {
    const cfg = await db.doc('config/runtime').get();
    if (!cfg.exists || !cfg.get('liveActive')) return;

    const now = Date.now();
    const snap = await db
      .collection('matches')
      .where('kickoff', '>=', Timestamp.fromMillis(now - LOOKBACK_MS))
      .where('kickoff', '<=', Timestamp.fromMillis(now + LOOKAHEAD_MS))
      .get();
    if (snap.empty) return;

    const [details, fixtures] = await Promise.all([
      db.getAll(...snap.docs.map((d) => db.doc(`matchDetails/${d.id}`))),
      db.getAll(...snap.docs.map((d) => db.doc(`fixtures/${d.id}`))),
    ]);
    const detailById = new Map(details.map((d) => [d.id, d]));
    const fixtureById = new Map(fixtures.map((d) => [d.id, d]));

    const key = API_SPORTS_KEY.value();
    const batch = db.batch();
    let written = 0;

    for (const doc of snap.docs) {
      const m = doc.data();
      const existing = detailById.get(doc.id);
      if (m.status === 'final' && existing?.exists && existing.get('final') === true) continue;

      try {
        const params = { fixture: doc.id };
        const lineups = await apiSports<RawLineup[]>(key, '/fixtures/lineups', params);
        const [events, stats] =
          m.status === 'upcoming'
            ? [[] as RawEvent[], [] as RawTeamStats[]]
            : await Promise.all([
                apiSports<RawEvent[]>(key, '/fixtures/events', params),
                apiSports<RawTeamStats[]>(key, '/fixtures/statistics', params),
              ]);

        const detail = projectDetail({
          matchId: doc.id,
          homeCode: m.home as string,
          events,
          lineups,
          stats,
          referee: (fixtureById.get(doc.id)?.get('referee') as string | undefined) ?? null,
        });

        batch.set(db.doc(`matchDetails/${doc.id}`), {
          ...detail,
          // internal flag (not part of the schema): stop re-polling finished matches
          ...(m.status === 'final' ? { final: true } : {}),
          updatedAt: FieldValue.serverTimestamp(),
        });
        written += 1;

        // Back-fill the scorer's name on the goal-toast payload once the
        // events feed has it (pollLiveScores stamps lastGoal with player: '').
        const lastGoal = m.lastGoal as { team: string; player: string } | null;
        if (lastGoal && !lastGoal.player) {
          const goal = [...detail.events]
            .reverse()
            .find((e) => e.type === 'goal' && e.team === lastGoal.team);
          if (goal) batch.update(doc.ref, { 'lastGoal.player': goal.player });
        }
      } catch (e) {
        console.warn(`pollMatchDetails: skipped ${doc.id}`, e);
      }
    }

    await batch.commit();
    console.log(`pollMatchDetails: refreshed ${written}/${snap.size} candidate(s)`);
  },
);
