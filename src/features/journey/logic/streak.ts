import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { addDays, daysBetween, todayKey } from '../../../lib/dateMath';
import { checkedInRecords, isFullyAchieved } from './shared';

/** Consecutive fully-achieved, checked-in days counting back from today (or yesterday if today isn't checked in yet, so a still-open today doesn't break an existing streak). A calendar gap, a missing day, a checked-in-but-not-fully-achieved night, or a backfilled night (streak requires real-time check-ins) all break it. */
export function computeStreak(records: NightRecordsMap): number {
  let streak = 0;
  let cursor = todayKey();
  const todayRecord = records[cursor];
  if (!todayRecord || todayRecord.checkInCompletedAt == null) {
    cursor = addDays(cursor, -1);
  }
  while (true) {
    const record = records[cursor];
    if (record && record.checkInCompletedAt != null && record.source !== 'backfilled' && isFullyAchieved(record)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * The longest run of calendar-consecutive, fully-achieved checked-in nights
 * within `records` (date-ascending, as returned by `checkedInRecords`). A
 * calendar gap or a checked-in-but-not-fully-achieved night both end a run.
 * Takes a plain array (rather than the full store map) so callers can scope
 * it to an arbitrary slice -- e.g. Recap's selected week/month window.
 */
export function longestStreakInRecords(records: NightRecord[]): number {
  let longest = 0;
  let current = 0;
  let previousDate: string | null = null;
  for (const record of records) {
    const isConsecutive = previousDate != null && daysBetween(previousDate, record.date) === 1;
    if (isFullyAchieved(record)) {
      current = isConsecutive ? current + 1 : 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
    previousDate = record.date;
  }
  return longest;
}

/** All-time longest streak across the full app history (Journey screen's all-time stats). Backfilled nights are excluded -- a streak requires real-time check-ins and can't be extended retroactively. */
export function computeLongestStreak(records: NightRecordsMap): number {
  return longestStreakInRecords(checkedInRecords(records).filter((r) => r.source !== 'backfilled'));
}
