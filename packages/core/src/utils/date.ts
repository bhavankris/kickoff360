/** Pure date helpers — no platform import. */

/** Today's date as a `YYYY-MM-DD` string in UTC. */
export function todayISO(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Offset a `YYYY-MM-DD` string by N days (UTC), returning a new `YYYY-MM-DD`. */
export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
