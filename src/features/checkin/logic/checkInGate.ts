import { SleepConfirmation } from '../../../types/domain';

/**
 * The sleep time pickers only show when there's a planned bedtime/wake time
 * AND it hasn't already been answered for this check-in -- otherwise
 * check-in is goal review only. There's no separate yes/no gate: when a
 * planned schedule exists, the pickers are shown pre-filled and the user
 * either confirms as-is or edits them before confirming.
 */
export function shouldShowSleepPickers(hasPlannedSchedule: boolean, existingConfirmation: SleepConfirmation | null): boolean {
  return hasPlannedSchedule && existingConfirmation == null;
}
