import { GoalCategory } from '../types/models';

export const GOAL_CATEGORIES: { key: GoalCategory; label: string }[] = [
  { key: 'bedtime', label: 'Bedtime' },
  { key: 'windDown', label: 'Wind-down' },
  { key: 'relaxation', label: 'Relaxation' },
];

/**
 * Seed defaults only. The live, user-editable list lives in
 * AppSettings.suggestedGoals (editing a suggestion in the picker permanently
 * updates that list) -- read from there, not from this constant, anywhere
 * user-facing.
 */
export const DEFAULT_SUGGESTED_GOALS: Record<Exclude<GoalCategory, 'custom'>, string[]> = {
  bedtime: ['Sleep before 11:00 PM', 'Be in bed by 10:45 PM', 'Wake up at 6:30 AM'],
  windDown: ['Put away all digital devices 30 minutes before bed', 'Avoid caffeine after 5:00 PM'],
  relaxation: ['Read 10 pages before bed', 'Practice breathing or meditation for 5 minutes before bed'],
};

const RISKY_HOUR_PATTERN = /\b(12|1|2|3|4)(:\d{2})?\s*am\b/i;

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
