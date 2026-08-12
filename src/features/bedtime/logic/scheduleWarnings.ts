import { parseTimeToMinutes, minutesBetween } from '../../../lib/dateMath';

// Mirrors goals/logic/unhealthyBedtime.ts's midnight-4:59am window, applied
// here to an actual settings.bedtime clock value rather than goal label text.
export const LATE_BEDTIME_MAX_HOUR = 5;
export const SHORT_SLEEP_MAX_MINUTES = 6 * 60;

export function isLateBedtime(bedtime: string): boolean {
  const hour = Math.floor(parseTimeToMinutes(bedtime) / 60);
  return hour < LATE_BEDTIME_MAX_HOUR;
}

export function isShortSleepDuration(bedtime: string, wakeTime: string): boolean {
  return minutesBetween(bedtime, wakeTime) < SHORT_SLEEP_MAX_MINUTES;
}

/** Null when the schedule needs no warning -- callers apply the change directly in that case. */
export function getScheduleWarningMessage(bedtime: string, wakeTime: string): string | null {
  const late = isLateBedtime(bedtime);
  const short = isShortSleepDuration(bedtime, wakeTime);
  if (late && short) return 'This is a very late bedtime and leaves you less than 6 hours of sleep. Sleep experts generally recommend an earlier, longer schedule.';
  if (late) return 'This is a very late bedtime. Sleep experts generally recommend an earlier bedtime.';
  if (short) return 'This schedule leaves you less than 6 hours of sleep.';
  return null;
}
