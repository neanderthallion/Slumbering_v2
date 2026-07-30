/** "Major milestone" thresholds are successful (fully-achieved) nights, per the message-priority spec. */
export const MAJOR_MILESTONES = [5, 10, 30, 50, 100, 365];

/** Streak bands for the weekly/streak companion-message priority. */
export const STREAK_BAND_3_TO_6 = { min: 3, max: 6 };
export const STREAK_BAND_7 = { min: 7, max: 29 };
export const STREAK_BAND_30 = { min: 30, max: Infinity };
