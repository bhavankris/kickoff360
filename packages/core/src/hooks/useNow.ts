import { useEffect, useState } from 'react';

/**
 * Current time, re-rendering every `intervalMs` (default 30s — enough for the
 * minute-granularity `countdown()` label). Pass the result as the `now` arg of
 * countdown()/countdownParts()/relDay() so they tick instead of going stale.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
