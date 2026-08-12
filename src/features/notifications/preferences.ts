import { parseTimeToMinutes } from '../../lib/dateMath';

/**
 * Subtracts `offsetMinutes` from a 'HH:mm' bedtime, wrapping around midnight.
 * Not stored anywhere (wind-down reminder time is always derived, never
 * user-set, per CLAUDE.md §4) -- used by features/notifications/logic/sync.ts
 * to compute the wind-down reminder's actual scheduled time.
 */
export function computeWindDownTime(bedtime: string, offsetMinutes: number = 10): string {
  const total = (((parseTimeToMinutes(bedtime) - offsetMinutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
