import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON, FieldValue, Timestamp } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';
import { mapFixture, type RawFixture } from '../lib/map.js';
import { projectFixture } from '../lib/project.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

/** Hourly: refresh the full fixtures schedule for the season. ~24 calls/day. */
export const pollSchedule = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    memory: '256MiB',
    secrets: [API_SPORTS_KEY],
    retryCount: 1,
  },
  async () => {
    const raw = await apiSports<RawFixture[]>(API_SPORTS_KEY.value(), '/fixtures', {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    });

    const batch = db.batch();
    let written = 0;
    let projected = 0;
    const kickoffs: Date[] = [];
    for (const r of raw) {
      try {
        const { fixture, kickoff } = mapFixture(r);
        kickoffs.push(kickoff);
        batch.set(
          db.doc(`fixtures/${fixture.fixtureId}`),
          {
            ...fixture,
            utcKickoff: Timestamp.fromDate(kickoff),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        written += 1;

        // Layer 2 projection in the same batch. merge:true keeps fields the
        // live poller owns (lastGoal) intact across hourly refreshes.
        const match = projectFixture(fixture);
        if (match) {
          batch.set(
            db.doc(`matches/${match.matchId}`),
            {
              ...match,
              kickoff: Timestamp.fromDate(kickoff),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
          projected += 1;
        }
      } catch (e) {
        console.warn('pollSchedule: skipped invalid fixture', e);
      }
    }
    // Recompute the live-poller gate from the fixtures just fetched (no extra
    // API call). flipLiveActive alone is daily, so a fresh deploy or schedule
    // change could otherwise strand liveActive=false for up to 24h. The -3h
    // lower bound keeps matches already in progress inside the window.
    const nowMs = Date.now();
    const liveActive = kickoffs.some((k) => {
      const t = k.getTime();
      return t >= nowMs - 3 * 60 * 60 * 1000 && t <= nowMs + 24 * 60 * 60 * 1000;
    });
    batch.set(
      db.doc('config/runtime'),
      { liveActive, leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON },
      { merge: true },
    );

    await batch.commit();
    console.log(`pollSchedule: wrote ${written}/${raw.length} fixtures, projected ${projected} matches, liveActive=${liveActive}`);
  },
);
