import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from '../firebase';
import { fixtureConverter } from './converters';
import type { FixtureDoc } from '../types';

/** Start/end-of-day UTC bounds for a `YYYY-MM-DD` date string. */
function dayBoundsUTC(dateISO: string): { start: Timestamp; end: Timestamp } {
  const start = new Date(`${dateISO}T00:00:00.000Z`);
  const end = new Date(`${dateISO}T23:59:59.999Z`);
  return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
}

/** Fixtures kicking off on a given UTC date, ordered by kickoff time. */
export async function fetchFixturesByDate(dateISO: string): Promise<FixtureDoc[]> {
  const { start, end } = dayBoundsUTC(dateISO);
  const q = query(
    collection(getDb(), 'fixtures').withConverter(fixtureConverter),
    where('utcKickoff', '>=', start),
    where('utcKickoff', '<=', end),
    orderBy('utcKickoff', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
