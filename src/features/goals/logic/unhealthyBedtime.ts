import { GoalCategory } from '../../../types/domain';

// Negative lookbehind keeps a minutes segment like the "12" in "11:12am" from
// being mistaken for the hour "12am" -- only match when the hour isn't itself
// preceded by a colon (which would mean it's actually someone's minutes).
const RISKY_HOUR_PATTERN = /(?<!:)\b(12|1|2|3|4)(:\d{2})?\s*am\b/i;

/**
 * Deliberately simple: only flags bedtime-style goals that look like they name a
 * very-late-night hour (midnight-4:59am). Never blocks — callers always let the
 * user continue, per the "user always retains control" principle.
 */
export function looksLikeUnhealthyBedtime(category: GoalCategory, text: string): boolean {
  if (category !== 'bedtime' && category !== 'custom') return false;
  const lower = text.toLowerCase();
  if (!lower.includes('am')) return false;
  return RISKY_HOUR_PATTERN.test(lower);
}
