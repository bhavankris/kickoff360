import type { FirestoreDataConverter } from 'firebase/firestore';
import type { FixtureDoc, StandingsDoc, PlayerDoc, UserDoc } from '../types';

/**
 * Firestore converters (Layer 2 of 4). Attach with `.withConverter(...)` so reads
 * and writes are typed. Note: converters run client-side and are bypassable —
 * server enforcement lives in Security Rules (Layer 4).
 */

export const fixtureConverter: FirestoreDataConverter<FixtureDoc> = {
  toFirestore: (f) => f,
  fromFirestore: (snap) => snap.data() as FixtureDoc,
};

export const standingsConverter: FirestoreDataConverter<StandingsDoc> = {
  toFirestore: (s) => s,
  fromFirestore: (snap) => snap.data() as StandingsDoc,
};

export const playerConverter: FirestoreDataConverter<PlayerDoc> = {
  toFirestore: (p) => p,
  fromFirestore: (snap) => snap.data() as PlayerDoc,
};

export const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore: (u) => u,
  fromFirestore: (snap) => snap.data() as UserDoc,
};
