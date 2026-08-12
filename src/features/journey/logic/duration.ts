import { NightRecord } from '../../../types/domain';
import { minutesBetween } from '../../../lib/dateMath';

/**
 * Minutes asleep for a night, derived from the confirmed schedule: actual
 * bedtime/wake time when the user reported something different than planned,
 * otherwise the planned schedule when they confirmed it went as planned.
 * Null when unconfirmed or a required time is missing.
 */
export function sleepDurationMinutes(record: NightRecord): number | null {
  if (record.sleepConfirmation === 'reportedDifferent' && record.actualBedtime && record.actualWakeTime) {
    return minutesBetween(record.actualBedtime, record.actualWakeTime);
  }
  if (record.sleepConfirmation === 'asPlanned' && record.plannedBedtime && record.plannedWakeTime) {
    return minutesBetween(record.plannedBedtime, record.plannedWakeTime);
  }
  return null;
}
