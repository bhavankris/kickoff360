import { useQuery } from '@tanstack/react-query';
import { fetchFixturesByDate } from '../api/fixtures';

/** Fixtures for a given UTC date. Server state via TanStack Query (works on RN + web). */
export function useFixtures(dateISO: string) {
  return useQuery({
    queryKey: ['fixtures', dateISO],
    queryFn: () => fetchFixturesByDate(dateISO),
    staleTime: 60_000,
  });
}
