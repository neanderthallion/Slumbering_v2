import { SleepConfirmation } from '../../../types/domain';

export type SleepStep = 'ask' | 'reportTimes' | 'done';

/**
 * The check-in flow only offers the yes/no "did you sleep as planned?" gate
 * when there's a planned bedtime/wake time AND it hasn't been answered yet
 * this check-in -- otherwise it skips straight to the goal-confirm step.
 */
export function initialSleepStep(hasPlannedSchedule: boolean, existingConfirmation: SleepConfirmation | null): SleepStep {
  return hasPlannedSchedule && existingConfirmation == null ? 'ask' : 'done';
}
