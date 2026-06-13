#!/usr/bin/env node
/**
 * Real-time goal-update simulation, the Firebase way: advances the two live
 * demo matches one match-minute per tick and writes the scripted goals, cards
 * and subs to Firestore — every open app updates instantly via onSnapshot
 * (scores pop, the timeline grows, the Golden Boot re-ranks, and at full time
 * the home screen reflows).
 *
 * Usage: pnpm --filter @repo/functions simulate [--speed 2.5] (seconds per match-minute)
 * Run seed-demo.mjs first; re-running this resets the matches and replays the drama.
 */
import admin from 'firebase-admin';
import { DETAILS, FT_MINUTE, MATCHES, SCORERS, SIM_SCRIPT, scorerId } from './demo-data.mjs';

const speedArg = process.argv.indexOf('--speed');
const tickSeconds = speedArg > -1 ? Number(process.argv[speedArg + 1]) || 2.5 : 2.5;
const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? 'demo-kickoff360';

admin.initializeApp({ projectId });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const liveIds = Object.keys(SIM_SCRIPT);

/** In-memory live state, initialised from the seeded snapshot. */
const state = {};
for (const id of liveIds) {
  const seed = MATCHES.find((m) => m[0] === id);
  state[id] = {
    home: seed[3],
    away: seed[4],
    score: { home: seed[8], away: seed[9] },
    minute: seed[10],
    events: DETAILS[id].events.map((e) => ({ ...e })),
    stats: JSON.parse(JSON.stringify(DETAILS[id].stats)),
    done: false,
  };
}

async function reset() {
  const batch = db.batch();
  for (const id of liveIds) {
    const s = state[id];
    batch.update(db.doc(`matches/${id}`), {
      status: 'live',
      score: s.score,
      minute: s.minute,
      lastGoal: null,
      updatedAt: FieldValue.serverTimestamp(),
    });
    batch.update(db.doc(`matchDetails/${id}`), {
      events: s.events,
      stats: s.stats,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  for (const sc of SCORERS) {
    batch.set(db.doc(`scorers/${scorerId(sc)}`), { ...sc, updatedAt: FieldValue.serverTimestamp() });
  }
  await batch.commit();
  console.log(`Reset ${liveIds.join(', ')} to the seeded live state.`);
}

async function bumpScorer(player, team) {
  const known = SCORERS.find((s) => s.player === player && s.team === team);
  const ref = db.doc(`scorers/${scorerId({ player, team })}`);
  await ref.set(
    {
      player,
      team,
      pos: known?.pos ?? 'FW',
      mins: known?.mins ?? 90,
      shots: FieldValue.increment(1),
      assists: known ? known.assists : 0,
      goals: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function tick() {
  for (const id of liveIds) {
    const s = state[id];
    if (s.done) continue;
    s.minute += 1;

    const batch = db.batch();
    const event = (SIM_SCRIPT[id] ?? []).find((e) => e.minute === s.minute);
    if (event) {
      s.events.push(event);
      if (event.type === 'goal') {
        const side = event.team === s.home ? 'home' : 'away';
        const i = side === 'home' ? 0 : 1;
        s.score = { ...s.score, [side]: s.score[side] + 1 };
        s.stats.shots[i] += 1;
        s.stats.onTarget[i] += 1;
        s.stats.xg[i] = Math.round((s.stats.xg[i] + 0.5) * 10) / 10;
        await bumpScorer(event.player, event.team);
        console.log(`  ⚽ ${s.minute}' GOAL ${event.team} — ${event.player} (${id}: ${s.score.home}-${s.score.away})`);
      }
      batch.update(db.doc(`matchDetails/${id}`), {
        events: s.events,
        stats: s.stats,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const finished = s.minute >= FT_MINUTE[id];
    batch.update(db.doc(`matches/${id}`), {
      minute: finished ? null : s.minute,
      score: s.score,
      status: finished ? 'final' : 'live',
      ...(event?.type === 'goal'
        ? { lastGoal: { team: event.team, player: event.player, minute: event.minute, at: admin.firestore.Timestamp.now() } }
        : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    if (finished) {
      s.done = true;
      console.log(`  🏁 FT ${id}: ${s.home} ${s.score.home}-${s.score.away} ${s.away}`);
    }
  }

  if (liveIds.every((id) => state[id].done)) {
    console.log('Both matches finished — simulation complete.');
    process.exit(0);
  }
}

console.log(`Simulating ${liveIds.length} live matches at ${tickSeconds}s per match-minute…`);
await reset();
setInterval(() => {
  tick().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}, tickSeconds * 1000);
