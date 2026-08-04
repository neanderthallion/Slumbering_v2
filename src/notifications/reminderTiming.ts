import { parseTimeToMinutes } from '../utils/date';

/** Subtracts `offsetMinutes` from a 'HH:mm' bedtime, wrapping around midnight. */
export function computeWindDownTime(bedtime: string, offsetMinutes: number = 10): string {
  const total = (((parseTimeToMinutes(bedtime) - offsetMinutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
