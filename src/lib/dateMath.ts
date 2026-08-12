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

/** Whole calendar days between two 'YYYY-MM-DD' keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const dateA = Date.UTC(ay, am - 1, ad);
  const dateB = Date.UTC(by, bm - 1, bd);
  return Math.round((dateB - dateA) / (1000 * 60 * 60 * 24));
}

export function formatFriendlyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function getGreetingPeriod(date: Date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
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
