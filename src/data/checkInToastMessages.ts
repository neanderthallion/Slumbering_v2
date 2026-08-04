import { MoonPhase } from '../types/models';
import { pickFromPool } from './companionMessages';

type AchievementTier = 'full' | 'partial' | 'none';

const CHECKIN_TOAST_POOLS: Record<AchievementTier, readonly string[]> = {
  full: ['Nice work tonight!', 'You kept your promise to yourself.', 'Great job completing your goals.'],
  partial: ['Good effort tonight.', 'Every bit of progress counts.', 'Nice work on part of your goals.'],
  none: ['Check-in saved.', 'Thanks for checking in.', 'Tomorrow is a fresh start.'],
} as const;

function tierFromPhase(phase: MoonPhase): AchievementTier {
  if (phase === 'full') return 'full';
  if (phase === 'crescent') return 'partial';
  return 'none';
}

export function pickCheckInToast(phase: MoonPhase, seed: string): string {
  return pickFromPool(CHECKIN_TOAST_POOLS[tierFromPhase(phase)], seed);
}
