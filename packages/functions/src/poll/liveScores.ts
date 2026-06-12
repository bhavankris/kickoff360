import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON, FieldValue, Timestamp } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';
import { mapFixture, type RawFixture } from '../lib/map.js';
import { projectFixture } from '../lib/project.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

/**
 * Every minute, but ONLY on match days: a separate daily function flips
 * config/runtime.liveActive so this no-ops off-days. Worst-case match day < ~2,000 calls.
 * Use the onSchedule OBJECT form — the string-only form mis-wires the Scheduler URL
 * (firebase/firebase-functions#1734).
 */
export const pollLiveScores = onSchedule(
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

    const raw = await apiSports<RawFixture[]>(API_SPORTS_KEY.value(), '/fixtures', {
      live: 'all',
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    });

    // Previous projected scores, so a score change can stamp lastGoal
    // (drives the goal-toast / score-flash UI). The detail poller will
    // back-fill the scorer's name from the events feed later.
    const prevSnaps = raw.length
      ? await db.getAll(...raw.map((r) => db.doc(`matches/${r.fixture.id}`)))
      : [];
    const prevScores = new Map(
      prevSnaps.filter((s) => s.exists).map((s) => [s.id, s.get('score') as { home: number; away: number } | null]),
    );

    const batch = db.batch();
    for (const r of raw) {
      try {
        const { fixture, kickoff } = mapFixture(r);
        batch.set(
          db.doc(`fixtures/${fixture.fixtureId}`),
          {
            ...fixture,
            utcKickoff: Timestamp.fromDate(kickoff),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        const match = projectFixture(fixture);
        if (!match) continue;

        const prev = prevScores.get(match.matchId);
        const scoredSide =
          match.score && prev && match.score.home > prev.home ? 'home'
          : match.score && prev && match.score.away > prev.away ? 'away'
          : null;

        batch.set(
          db.doc(`matches/${match.matchId}`),
          {
            ...match,
            kickoff: Timestamp.fromDate(kickoff),
            ...(scoredSide
              ? {
                  lastGoal: {
                    team: match[scoredSide],
                    player: '',
                    minute: match.minute ?? 0,
                    at: Timestamp.now(),
                  },
                }
              : {}),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } catch (e) {
        console.warn('pollLiveScores: skipped invalid fixture', e);
      }
    }
    await batch.commit();
    console.log(`pollLiveScores: updated ${raw.length} live fixtures`);
  },
);
