import { useQuery } from '@tanstack/react-query';
import {
  fetchMatches,
  fetchMatchDetail,
  fetchScorers,
  matchesQuery,
  matchDetailRef,
  scorersQuery,
} from '../api/matches';
import { useFirestoreSubscription, useFirestoreDocSubscription } from './useFirestoreSubscription';
import type { MatchDoc, MatchDetailDoc, ScorerDoc } from '../types';

/**
 * Match-centre hooks: an initial fetch via TanStack Query plus a shared
 * onSnapshot listener that keeps the same cache entry live — so scores,
 * minutes and events update in real time everywhere they are rendered.
 */

export function useMatches() {
  useFirestoreSubscription<MatchDoc>(['matches'], matchesQuery());
  return useQuery<MatchDoc[]>({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    staleTime: Infinity, // the snapshot listener owns freshness
  });
}

export function useMatchDetail(matchId: string) {
  useFirestoreDocSubscription<MatchDetailDoc>(['matchDetail', matchId], matchDetailRef(matchId));
  return useQuery<MatchDetailDoc | null>({
    queryKey: ['matchDetail', matchId],
    queryFn: () => fetchMatchDetail(matchId),
    staleTime: Infinity,
  });
}

export function useScorers() {
  useFirestoreSubscription<ScorerDoc>(['scorers'], scorersQuery());
  return useQuery<ScorerDoc[]>({
    queryKey: ['scorers'],
    queryFn: fetchScorers,
    staleTime: Infinity,
  });
}
