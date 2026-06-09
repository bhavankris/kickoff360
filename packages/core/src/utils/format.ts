import type { Timestamp } from 'firebase/firestore';

/**
 * Display formatting for kick-off times. Everything renders in the DEVICE's
 * local timezone (a deliberate product decision — fans care about "when for
 * me", not stadium time), with a tz label shown once per screen.
 */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

export const toDate = (t: Timestamp | Date): Date => (t instanceof Date ? t : t.toDate());

/** "3:00 PM" in device-local time. */
export function timeLabel(t: Timestamp | Date): string {
  const d = toDate(t);
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${pad(d.getMinutes())} ${ap}`;
}

/** Local-day bucket key, "YYYY-MM-DD". */
export function dayKey(t: Timestamp | Date): string {
  const d = toDate(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "Sat Jun 20". */
export function dayLabel(t: Timestamp | Date): string {
  const d = toDate(t);
  return `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function dayShort(t: Timestamp | Date): { dow: string; day: number; mon: string } {
  const d = toDate(t);
  return { dow: DAYS[d.getDay()]!, day: d.getDate(), mon: MONTHS[d.getMonth()]! };
}

/** "Today" / "Tomorrow" / "Yesterday" / "Sat Jun 20". */
export function relDay(t: Timestamp | Date, now: Date = new Date()): string {
  const d = toDate(t);
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return dayLabel(d);
}

/** Compact countdown: "2d 4h" / "3h 12m" / "45m", or null once in the past. */
export function countdown(t: Timestamp | Date, now: Date = new Date()): string | null {
  const ms = toDate(t).getTime() - now.getTime();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h >= 1) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Countdown split into display units (days→min, or hrs→sec on the final day). */
export function countdownParts(t: Timestamp | Date, now: Date = new Date()): [number, string][] {
  let ms = toDate(t).getTime() - now.getTime();
  if (ms < 0) ms = 0;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return d > 0 ? [[d, 'DAYS'], [h, 'HRS'], [m, 'MIN']] : [[h, 'HRS'], [m, 'MIN'], [s, 'SEC']];
}

/** Short device-timezone label, e.g. "GMT+5:30" or "PDT". */
export function tzLabel(): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}
