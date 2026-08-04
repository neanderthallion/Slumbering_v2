/** "Major milestone" thresholds are successful (fully-achieved) nights, per the message-priority spec. */
export const MAJOR_MILESTONES = [5, 10, 30, 50, 100, 365];

/** Streak bands for the weekly/streak companion-message priority. */
export const STREAK_BAND_3_TO_6 = { min: 3, max: 6 };
export const STREAK_BAND_7 = { min: 7, max: 29 };
export const STREAK_BAND_30 = { min: 30, max: Infinity };

/**
 * "Engagement milestone" thresholds — cumulative nights with at least one
 * goal achieved (not necessarily fully, not necessarily consecutive).
 * Frequent early, then every 50 nights afterward.
 */
export const ENGAGEMENT_MILESTONES_FIXED = [1, 5, 10, 20, 30, 40, 50];
export const ENGAGEMENT_MILESTONE_STEP_AFTER = 50;

export function isEngagementMilestoneThreshold(n: number): boolean {
  if ((ENGAGEMENT_MILESTONES_FIXED as number[]).includes(n)) return true;
  return n > ENGAGEMENT_MILESTONE_STEP_AFTER && n % ENGAGEMENT_MILESTONE_STEP_AFTER === 0;
}
