import { NightRecordsMap } from '../../../types/domain';
import { daysBetween } from '../../../lib/dateMath';
import { checkedInRecords, isFullyAchieved } from './shared';
import { majorMilestoneMessage, engagementMilestoneMessage } from '../../companion-messages/logic/majorMilestoneMessage';

/** "Major milestone" thresholds are successful (fully-achieved) nights. Used for companion messages/Journey timeline only -- deliberately not part of the celebration system. */
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

export interface MilestoneHit {
  date: string;
  id: string;
  text: string;
}

export function computeMilestones(records: NightRecordsMap): MilestoneHit[] {
  const sorted = checkedInRecords(records);
  const milestones: MilestoneHit[] = [];
  let successfulNights = 0;
  const hit = new Set<number>();

  for (const record of sorted) {
    if (isFullyAchieved(record)) successfulNights += 1;
    for (const threshold of MAJOR_MILESTONES) {
      if (successfulNights === threshold && !hit.has(threshold)) {
        hit.add(threshold);
        milestones.push({ date: record.date, id: `major-${threshold}`, text: majorMilestoneMessage(threshold) });
      }
    }
  }
  return milestones;
}

export function mostRecentMilestone(records: NightRecordsMap): MilestoneHit | undefined {
  const milestones = computeMilestones(records);
  return milestones[milestones.length - 1];
}

export interface EngagementMilestoneHit {
  date: string;
  id: string;
  threshold: number;
  text: string;
}

/** Cumulative nights with at least one goal achieved (not necessarily fully, not necessarily consecutive). */
export function computeEngagementMilestones(records: NightRecordsMap): EngagementMilestoneHit[] {
  const sorted = checkedInRecords(records);
  const milestones: EngagementMilestoneHit[] = [];
  let engagedNights = 0;
  const hit = new Set<number>();

  for (const record of sorted) {
    const anyAchieved = record.goals.some((g) => g.achieved === true);
    if (anyAchieved) engagedNights += 1;
    if (isEngagementMilestoneThreshold(engagedNights) && !hit.has(engagedNights)) {
      hit.add(engagedNights);
      milestones.push({
        date: record.date,
        id: `engagement-${engagedNights}`,
        threshold: engagedNights,
        text: engagementMilestoneMessage(engagedNights),
      });
    }
  }
  return milestones;
}

/**
 * Walks checked-in records chronologically, tracking the length of the
 * current consecutive-nights run (per `matches`) as of each date (a calendar
 * gap since the previous checked-in record resets the run, same as
 * `computeStreak`'s semantics). Backfilled nights are excluded entirely --
 * same as `computeStreak`, a consecutive-nights run requires real-time
 * check-ins, so a backfilled night can't extend one and its absence from
 * the sequence acts like a gap. Used to find the first date a streak
 * threshold (e.g. 7) was crossed, since badges record when they were first
 * earned rather than the live streak. Defaults to fully-achieved nights;
 * pass a different predicate (e.g. "at least one goal achieved") to track a
 * looser streak.
 */
export function forwardConsecutiveAchievedLengths(
  records: NightRecordsMap,
  matches: (record: NightRecordsMap[string]) => boolean = isFullyAchieved
): { date: string; length: number }[] {
  const sorted = checkedInRecords(records).filter((r) => r.source !== 'backfilled');
  const result: { date: string; length: number }[] = [];
  let runLength = 0;
  let prevDate: string | null = null;

  for (const record of sorted) {
    const isConsecutiveDay = prevDate != null && daysBetween(prevDate, record.date) === 1;
    if (matches(record)) {
      runLength = isConsecutiveDay ? runLength + 1 : 1;
    } else {
      runLength = 0;
    }
    result.push({ date: record.date, length: runLength });
    prevDate = record.date;
  }
  return result;
}
