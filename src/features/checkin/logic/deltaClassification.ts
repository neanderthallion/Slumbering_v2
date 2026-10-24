import { pickFromPool } from '../../../lib/dateSeed';
import { signedMinutesDelta } from '../../../lib/dateMath';
import { SleepConfirmation } from '../../../types/domain';
import { COPY } from '../../../copy';

export type SleepTimeComparison = 'onPlan' | 'shorterThanPlanned' | 'longerThanPlanned';

export const SLEEP_TIME_TOLERANCE_MINUTES = 15;

export function classifySleepDuration(
  plannedMinutes: number,
  actualMinutes: number,
  toleranceMinutes: number = SLEEP_TIME_TOLERANCE_MINUTES
): SleepTimeComparison {
  const diff = actualMinutes - plannedMinutes;
  if (Math.abs(diff) <= toleranceMinutes) return 'onPlan';
  return diff < 0 ? 'shorterThanPlanned' : 'longerThanPlanned';
}

/**
 * Classifies reported actual bedtime/wake time against plan by clock-time
 * deviation (wrap-safe around midnight via signedMinutesDelta), not derived
 * duration -- a bedtime and wake time that both shift by the same amount
 * still deviated from plan even though total sleep duration is unchanged.
 */
export function classifySleepSchedule(
  plannedBedtime: string,
  plannedWakeTime: string,
  actualBedtime: string,
  actualWakeTime: string,
  toleranceMinutes: number = SLEEP_TIME_TOLERANCE_MINUTES
): SleepTimeComparison {
  const bedtimeDelta = signedMinutesDelta(plannedBedtime, actualBedtime);
  const wakeDelta = signedMinutesDelta(plannedWakeTime, actualWakeTime);
  if (Math.abs(bedtimeDelta) <= toleranceMinutes && Math.abs(wakeDelta) <= toleranceMinutes) return 'onPlan';

  const durationDelta = wakeDelta - bedtimeDelta;
  if (durationDelta !== 0) return durationDelta < 0 ? 'shorterThanPlanned' : 'longerThanPlanned';
  // Duration unchanged but the schedule still shifted (e.g. both times 2h later) -- a later
  // bedtime is treated as the "worse" direction, consistent with the app's earlier-bedtime framing.
  return bedtimeDelta > 0 ? 'shorterThanPlanned' : 'longerThanPlanned';
}

const SLEEP_TIME_FEEDBACK_POOLS: Record<SleepTimeComparison, readonly string[]> = COPY.checkIn.sleepFeedback;

export function pickSleepTimeFeedback(comparison: SleepTimeComparison, seed: string): string {
  return pickFromPool(SLEEP_TIME_FEEDBACK_POOLS[comparison], seed);
}

/** Since the picker panel is always pre-filled from the plan, "asPlanned" now means the user left both fields untouched rather than an explicit yes answer. */
export function deriveSleepConfirmation(
  plannedBedtime: string,
  plannedWakeTime: string,
  actualBedtime: string,
  actualWakeTime: string
): SleepConfirmation {
  return actualBedtime === plannedBedtime && actualWakeTime === plannedWakeTime ? 'asPlanned' : 'reportedDifferent';
}
