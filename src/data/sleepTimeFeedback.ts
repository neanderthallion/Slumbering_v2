import { pickFromPool } from './companionMessages';

export type SleepTimeComparison = 'onPlan' | 'shorterThanPlanned' | 'longerThanPlanned';

const TOLERANCE_MINUTES = 15;

export function classifySleepDuration(
  plannedMinutes: number,
  actualMinutes: number,
  toleranceMinutes: number = TOLERANCE_MINUTES
): SleepTimeComparison {
  const diff = actualMinutes - plannedMinutes;
  if (Math.abs(diff) <= toleranceMinutes) return 'onPlan';
  return diff < 0 ? 'shorterThanPlanned' : 'longerThanPlanned';
}

const SLEEP_TIME_FEEDBACK_POOLS: Record<SleepTimeComparison, readonly string[]> = {
  onPlan: ['Right on track with your plan.', 'That matches what you had in mind.'],
  shorterThanPlanned: [
    'A shorter night than planned. Be gentle with yourself today.',
    'Less rest than hoped for. Tonight is a fresh chance.',
  ],
  longerThanPlanned: [
    'A longer night than planned. Hope it left you well-rested.',
    'More rest than expected. Hope you are feeling good.',
  ],
} as const;

export function pickSleepTimeFeedback(comparison: SleepTimeComparison, seed: string): string {
  return pickFromPool(SLEEP_TIME_FEEDBACK_POOLS[comparison], seed);
}
