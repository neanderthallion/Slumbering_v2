import { parseTimeToMinutes, minutesBetween } from '../../../lib/dateMath';
import { COPY } from '../../../copy';

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
  if (late && short) return COPY.bedtime.scheduleWarnings.lateAndShort;
  if (late) return COPY.bedtime.scheduleWarnings.late;
  if (short) return COPY.bedtime.scheduleWarnings.short;
  return null;
}
