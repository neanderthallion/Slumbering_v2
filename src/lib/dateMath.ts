export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toDateKey(dt);
}

/** Monday-based start of the calendar week containing `dateKey`. */
export function startOfWeek(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const mondayIndex = (dt.getDay() + 6) % 7; // Mon=0 ... Sun=6
  dt.setDate(dt.getDate() - mondayIndex);
  return toDateKey(dt);
}

/** First day of the calendar month containing `dateKey`. */
export function startOfMonth(dateKey: string): string {
  const [y, m] = dateKey.split('-').map(Number);
  return toDateKey(new Date(y, m - 1, 1));
}

/** Last day of the calendar month containing `dateKey`. */
export function endOfMonth(dateKey: string): string {
  const [y, m] = dateKey.split('-').map(Number);
  return toDateKey(new Date(y, m, 0));
}

/** First day of the month `delta` calendar months away from `dateKey`'s month. */
export function addMonths(dateKey: string, delta: number): string {
  const [y, m] = dateKey.split('-').map(Number);
  return toDateKey(new Date(y, m - 1 + delta, 1));
}

/** Inclusive list of 'YYYY-MM-DD' keys from `startKey` to `endKey`, oldest first. */
export function datesInRange(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  let cursor = startKey;
  while (cursor <= endKey) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** Whole calendar days between two 'YYYY-MM-DD' keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const dateA = Date.UTC(ay, am - 1, ad);
  const dateB = Date.UTC(by, bm - 1, bd);
  return Math.round((dateB - dateA) / (1000 * 60 * 60 * 24));
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' (day-first, the Vietnamese convention). */
export function formatFriendlyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-');
  return `${d}/${m}/${y}`;
}

/** Splits a 'YYYY-MM-DD' key into dd/mm/yy string parts for manual date entry fields. */
export function toDDMMYY(dateKey: string): { dd: string; mm: string; yy: string } {
  const [y, m, d] = dateKey.split('-');
  return { dd: d, mm: m, yy: y.slice(2) };
}

/**
 * Parses manually-typed dd/mm/yy fields into a 'YYYY-MM-DD' key. Two-digit
 * years are assumed to be 2000+yy. Returns null if the fields don't form a
 * real calendar date.
 */
export function parseDDMMYY(dd: string, mm: string, yy: string): string | null {
  if (!/^\d{1,2}$/.test(dd) || !/^\d{1,2}$/.test(mm) || !/^\d{1,4}$/.test(yy)) return null;
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = yy.length <= 2 ? 2000 + parseInt(yy, 10) : parseInt(yy, 10);
  if (m < 1 || m > 12) return null;
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d < 1 || d > daysInMonth) return null;
  return toDateKey(new Date(y, m - 1, d));
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Display a 'HH:mm' time value as a 24-hour clock string (Vietnamese convention). */
export function formatClockTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getGreetingPeriod(date: Date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/** Hour of day (local, 24h) before which check-in stays locked even on the day after goals were set -- gives the night a chance to actually happen before asking "how'd it go?" */
export const CHECKIN_UNLOCK_HOUR = 3;

export function isPastCheckInUnlockHour(now: Date = new Date()): boolean {
  return now.getHours() >= CHECKIN_UNLOCK_HOUR;
}

export function minutesBetween(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return end >= start ? end - start : 24 * 60 - start + end;
}

/**
 * Signed difference in minutes from `fromTime` to `toTime`, wrapped to the
 * shortest direction around midnight (range (-720, 720]). Positive means
 * `toTime` is later than `fromTime`.
 */
export function signedMinutesDelta(fromTime: string, toTime: string): number {
  const diff = parseTimeToMinutes(toTime) - parseTimeToMinutes(fromTime);
  if (diff > 720) return diff - 1440;
  if (diff <= -720) return diff + 1440;
  return diff;
}

/**
 * Bedtimes cluster late at night and can wrap past midnight, which breaks
 * plain minutes-since-midnight averaging/variance (23:30 vs 00:15 look
 * numerically far apart when they're 45 minutes apart). Pushing any
 * clock-hour before noon into "the next day" (adding 24h) makes a night's
 * worth of bedtimes one contiguous, comparable range -- convert back to a
 * real clock time with normalizedMinutesToTime for display.
 */
const NOON_MINUTES = 12 * 60;
export function normalizeBedtimeMinutes(rawMinutes: number): number {
  return rawMinutes < NOON_MINUTES ? rawMinutes + 24 * 60 : rawMinutes;
}

export function normalizedMinutesToTime(minutes: number): string {
  const wrapped = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
