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

/**
 * Parses free-typed digits (optionally followed by 'a'/'am'/'p'/'pm') into a
 * 'HH:mm' time, e.g. "1130p" -> 23:30, "930" -> 09:30, "7a" -> 07:00. A bare
 * 1-2 digit hour with no meridiem keeps the AM/PM period `time` is currently
 * in. Returns null if the input can't be parsed into a valid time.
 */
export function parseTypedTime(raw: string, time: string): string | null {
  const match = raw.trim().toLowerCase().match(/^(\d{1,4})\s*([ap]m?)?$/);
  if (!match) return null;
  const digits = match[1];
  const meridiem = match[2];

  let hour: number;
  let minute: number;
  if (digits.length <= 2) {
    hour = parseInt(digits, 10);
    minute = 0;
  } else if (digits.length === 3) {
    hour = parseInt(digits.slice(0, 1), 10);
    minute = parseInt(digits.slice(1), 10);
  } else {
    hour = parseInt(digits.slice(0, 2), 10);
    minute = parseInt(digits.slice(2), 10);
  }
  if (minute > 59) return null;

  let hour24: number;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    hour24 = hour % 12;
    if (meridiem[0] === 'p') hour24 += 12;
  } else if (hour === 0 || (hour >= 13 && hour <= 23)) {
    hour24 = hour;
  } else if (hour >= 1 && hour <= 12) {
    const currentlyPM = parseTimeToMinutes(time) >= 12 * 60;
    hour24 = hour % 12;
    if (currentlyPM) hour24 += 12;
  } else {
    return null;
  }

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function minutesBetween(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return end >= start ? end - start : 24 * 60 - start + end;
}

