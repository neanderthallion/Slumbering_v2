import { MoonPhase } from '../../../types/domain';
import { pickFromPool } from '../../../lib/dateSeed';
import { COPY } from '../../../copy';

type AchievementTier = 'full' | 'partial' | 'none';

const CHECKIN_TOAST_POOLS: Record<AchievementTier, readonly string[]> = COPY.checkIn.toast;

function tierFromPhase(phase: MoonPhase): AchievementTier {
  if (phase === 'full') return 'full';
  if (phase === 'crescent') return 'partial';
  return 'none';
}

export function pickCheckInToast(phase: MoonPhase, seed: string): string {
  return pickFromPool(CHECKIN_TOAST_POOLS[tierFromPhase(phase)], seed);
}

/** A fully-achieved night gets a celebratory, manually-dismissible toast. */
export function isFullNightPhase(phase: MoonPhase): boolean {
  return phase === 'full';
}
