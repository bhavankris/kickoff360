import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type FirestoreDataConverter,
  type Query,
  type DocumentReference,
} from 'firebase/firestore';
import { getDb } from '../firebase';
import type { MatchDoc, MatchDetailDoc, ScorerDoc } from '../types';

export const matchConverter: FirestoreDataConverter<MatchDoc> = {
  toFirestore: (m) => m,
  fromFirestore: (snap) => snap.data() as MatchDoc,
};

export const matchDetailConverter: FirestoreDataConverter<MatchDetailDoc> = {
  toFirestore: (d) => d,
  fromFirestore: (snap) => snap.data() as MatchDetailDoc,
};

export const scorerConverter: FirestoreDataConverter<ScorerDoc> = {
  toFirestore: (s) => s,
  fromFirestore: (snap) => snap.data() as ScorerDoc,
};

/** All tournament matches, kick-off ascending (104 docs — fine to hold client-side). */
export function matchesQuery(): Query<MatchDoc> {
  return query(collection(getDb(), 'matches').withConverter(matchConverter), orderBy('kickoff', 'asc'));
}

export async function fetchMatches(): Promise<MatchDoc[]> {
  const snap = await getDocs(matchesQuery());
  return snap.docs.map((d) => d.data());
}

export function matchDetailRef(matchId: string): DocumentReference<MatchDetailDoc> {
  return doc(getDb(), 'matchDetails', matchId).withConverter(matchDetailConverter);
}

export async function fetchMatchDetail(matchId: string): Promise<MatchDetailDoc | null> {
  const snap = await getDoc(matchDetailRef(matchId));
  return snap.exists() ? snap.data() : null;
}

/** Golden Boot pool, best scorer first. */
export function scorersQuery(): Query<ScorerDoc> {
  return query(
    collection(getDb(), 'scorers').withConverter(scorerConverter),
    orderBy('goals', 'desc'),
    orderBy('assists', 'desc'),
  );
}

export async function fetchScorers(): Promise<ScorerDoc[]> {
  const snap = await getDocs(scorersQuery());
  return snap.docs.map((d) => d.data());
}
