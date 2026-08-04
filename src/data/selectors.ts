import { NightRecord, NightRecordsMap, MoonPhase, JourneyEntry, BadgeId } from '../types/models';
import { sortedRecords } from './nightRecords';
import {
  MAJOR_MILESTONES,
  STREAK_BAND_3_TO_6,
  STREAK_BAND_7,
  STREAK_BAND_30,
  isEngagementMilestoneThreshold,
} from '../constants/milestoneThresholds';
import {
  BADGE_DEFINITIONS,
  FULL_WEEK_STREAK_THRESHOLD,
  ONE_MONTH_STREAK_THRESHOLD,
  EARLY_RISER_HOUR_CUTOFF,
  EARLY_RISER_COUNT_THRESHOLD,
  WELCOME_BACK_GAP_DAYS,
} from '../constants/badgeDefinitions';
import {
  COMPANION_POOLS,
  GREETING_POOLS,
  TODAYS_ACTION_POOLS,
  pickFromPool,
  majorMilestoneMessage,
  engagementMilestoneMessage,
} from './companionMessages';
import { addDays, daysBetween, todayKey, toDateKey, getGreetingPeriod } from '../utils/date';

export function getMoonPhase(record: NightRecord | undefined): MoonPhase {
  if (!record || record.goals.length === 0) return 'new';
  const achievedCount = record.goals.filter((g) => g.achieved === true).length;
  if (achievedCount === 0) return 'new';
  if (achievedCount === record.goals.length) return 'full';
  return 'crescent';
}

export function isFullyAchieved(record: NightRecord): boolean {
  return record.goals.length > 0 && record.goals.every((g) => g.achieved === true);
}

function checkedInRecords(records: NightRecordsMap): NightRecord[] {
  return sortedRecords(records).filter((r) => r.checkInCompletedAt != null);
}

export function computeStreak(records: NightRecordsMap): number {
  let streak = 0;
  let cursor = todayKey();
  // If tonight's record isn't checked in yet, start counting from yesterday.
  const todayRecord = records[cursor];
  if (!todayRecord || todayRecord.checkInCompletedAt == null) {
    cursor = addDays(cursor, -1);
  }
  while (true) {
    const record = records[cursor];
    if (record && record.checkInCompletedAt != null && isFullyAchieved(record)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

export function computeMilestones(records: NightRecordsMap): { date: string; id: string; text: string }[] {
  const sorted = checkedInRecords(records);
  const milestones: { date: string; id: string; text: string }[] = [];
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

export function mostRecentMilestone(records: NightRecordsMap): { date: string; id: string; text: string } | undefined {
  const milestones = computeMilestones(records);
  return milestones[milestones.length - 1];
}

/** Cumulative nights with at least one goal achieved (not necessarily fully, not necessarily consecutive). */
export function computeEngagementMilestones(
  records: NightRecordsMap
): { date: string; id: string; threshold: number; text: string }[] {
  const sorted = checkedInRecords(records);
  const milestones: { date: string; id: string; threshold: number; text: string }[] = [];
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
 * current consecutive fully-achieved-nights run as of each date (a calendar
 * gap since the previous checked-in record resets the run, same as
 * `computeStreak`'s semantics). Used to find the first date a streak
 * threshold (e.g. 7 or 30) was crossed, since badges record when they were
 * first earned rather than the live streak.
 */
export function forwardConsecutiveFullyAchievedLengths(records: NightRecordsMap): { date: string; length: number }[] {
  const sorted = checkedInRecords(records);
  const result: { date: string; length: number }[] = [];
  let runLength = 0;
  let prevDate: string | null = null;

  for (const record of sorted) {
    const isConsecutiveDay = prevDate != null && daysBetween(prevDate, record.date) === 1;
    if (isFullyAchieved(record)) {
      runLength = isConsecutiveDay ? runLength + 1 : 1;
    } else {
      runLength = 0;
    }
    result.push({ date: record.date, length: runLength });
    prevDate = record.date;
  }
  return result;
}

export interface BadgeUnlock {
  date: string;
  id: string;
  badgeId: BadgeId;
  text: string;
}

/** Each of the 5 fixed v1 badges, awarded once-ever on the date it was first earned. */
export function computeBadgeUnlocks(records: NightRecordsMap): BadgeUnlock[] {
  const sorted = checkedInRecords(records);
  if (sorted.length === 0) return [];
  const unlocks: BadgeUnlock[] = [];

  unlocks.push({ date: sorted[0].date, id: 'badge-firstStep', badgeId: 'firstStep', text: BADGE_DEFINITIONS.firstStep.name });

  const streaks = forwardConsecutiveFullyAchievedLengths(records);
  const fullWeek = streaks.find((s) => s.length === FULL_WEEK_STREAK_THRESHOLD);
  if (fullWeek) unlocks.push({ date: fullWeek.date, id: 'badge-fullWeek', badgeId: 'fullWeek', text: BADGE_DEFINITIONS.fullWeek.name });
  const oneMonth = streaks.find((s) => s.length === ONE_MONTH_STREAK_THRESHOLD);
  if (oneMonth) unlocks.push({ date: oneMonth.date, id: 'badge-oneMonth', badgeId: 'oneMonth', text: BADGE_DEFINITIONS.oneMonth.name });

  let earlyRiserCount = 0;
  for (const record of sorted) {
    if (!record.checkInCompletedAt) continue;
    if (new Date(record.checkInCompletedAt).getHours() < EARLY_RISER_HOUR_CUTOFF) {
      earlyRiserCount += 1;
      if (earlyRiserCount === EARLY_RISER_COUNT_THRESHOLD) {
        unlocks.push({ date: record.date, id: 'badge-earlyRiser', badgeId: 'earlyRiser', text: BADGE_DEFINITIONS.earlyRiser.name });
        break;
      }
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1].date, sorted[i].date) >= WELCOME_BACK_GAP_DAYS) {
      unlocks.push({ date: sorted[i].date, id: 'badge-welcomeBack', badgeId: 'welcomeBack', text: BADGE_DEFINITIONS.welcomeBack.name });
      break;
    }
  }

  return unlocks;
}

const JOURNEY_EXTRA_ORDER: JourneyEntry['type'][] = ['milestone', 'engagementMilestone', 'badge'];

export function buildJourneyEntries(records: NightRecordsMap): JourneyEntry[] {
  const sorted = checkedInRecords(records);
  const extrasByDate = new Map<string, JourneyEntry[]>();
  function pushExtra(date: string, entry: JourneyEntry) {
    const list = extrasByDate.get(date) ?? [];
    list.push(entry);
    extrasByDate.set(date, list);
  }

  for (const m of computeMilestones(records)) pushExtra(m.date, { type: 'milestone', date: m.date, id: m.id, text: m.text });
  for (const m of computeEngagementMilestones(records)) {
    pushExtra(m.date, { type: 'engagementMilestone', date: m.date, id: m.id, threshold: m.threshold, text: m.text });
  }
  for (const b of computeBadgeUnlocks(records)) {
    pushExtra(b.date, { type: 'badge', date: b.date, id: b.id, badgeId: b.badgeId, text: b.text });
  }

  const entries: JourneyEntry[] = [];
  for (const record of sorted) {
    entries.push({ type: 'night', record });
    const extras = extrasByDate.get(record.date);
    if (extras) {
      extras.sort((a, b) => JOURNEY_EXTRA_ORDER.indexOf(a.type) - JOURNEY_EXTRA_ORDER.indexOf(b.type));
      entries.push(...extras);
    }
  }
  return entries.reverse();
}

export type DailyStage = 'noGoalsSet' | 'checkInDue' | 'bothDone';

export function computeDailyStage(records: NightRecordsMap): DailyStage {
  const today = records[todayKey()];
  if (!today || today.goals.length === 0) return 'noGoalsSet';
  if (today.checkInCompletedAt == null) return 'checkInDue';
  return 'bothDone';
}

export function isFirstTimeUser(records: NightRecordsMap): boolean {
  return checkedInRecords(records).length === 0;
}

/**
 * Last night's goals are only truly "missed" once its window has fully
 * closed. Nights are still winding down between midnight and 2am, so a user
 * up late has until then to pick their own goals before the default night
 * plan silently fills in for them. Returns last night's date key if it needs
 * filling, or null if it's past that window or already has a record.
 */
export function needsDefaultNightPlanFallback(records: NightRecordsMap, now: Date = new Date()): string | null {
  if (now.getHours() >= 2) return null;
  const lastNight = addDays(toDateKey(now), -1);
  return records[lastNight] ? null : lastNight;
}

/** Days since the most recent checked-in night, or null if the user has never checked in. */
export function daysSinceLastCheckIn(records: NightRecordsMap, todayStr: string = todayKey()): number | null {
  const checkedIn = checkedInRecords(records);
  if (checkedIn.length === 0) return null;
  const last = checkedIn[checkedIn.length - 1];
  return daysBetween(last.date, todayStr);
}

/**
 * Priority order per the docx: first-time > returning-after-inactivity (3+
 * days) > major milestone (just reached today) > streak band > goal-status
 * (fallback while goals aren't set yet, reflecting the last check-in's
 * outcome) > default encouragement. `excludeText` lets a caller avoid
 * repeating yesterday's exact message when another option exists.
 */
export function computeCompanionMessage(
  records: NightRecordsMap,
  todayStr: string = todayKey(),
  excludeText?: string
): string {
  const checkedIn = checkedInRecords(records);
  if (checkedIn.length === 0) return pickFromPool(COMPANION_POOLS.firstTime, todayStr, excludeText);

  const lastRecord = checkedIn[checkedIn.length - 1];
  const gapDays = daysBetween(lastRecord.date, todayStr);
  if (gapDays >= 3) return pickFromPool(COMPANION_POOLS.returning, todayStr, excludeText);

  const successfulCount = checkedIn.filter(isFullyAchieved).length;
  const justHitMajorMilestone =
    lastRecord.date === todayStr && isFullyAchieved(lastRecord) && MAJOR_MILESTONES.includes(successfulCount);
  if (justHitMajorMilestone) return majorMilestoneMessage(successfulCount);

  const streak = computeStreak(records);
  if (streak >= STREAK_BAND_30.min) return pickFromPool(COMPANION_POOLS.streak30, todayStr, excludeText);
  if (streak >= STREAK_BAND_7.min) return pickFromPool(COMPANION_POOLS.streak7, todayStr, excludeText);
  if (streak >= STREAK_BAND_3_TO_6.min) return pickFromPool(COMPANION_POOLS.streak3to6, todayStr, excludeText);

  if (computeDailyStage(records) === 'noGoalsSet') {
    if (isFullyAchieved(lastRecord)) return pickFromPool(COMPANION_POOLS.goalStatusAllAchieved, todayStr, excludeText);
    const anyAchieved = lastRecord.goals.some((g) => g.achieved === true);
    if (anyAchieved) return pickFromPool(COMPANION_POOLS.goalStatusPartial, todayStr, excludeText);
    return pickFromPool(COMPANION_POOLS.goalStatusNone, todayStr, excludeText);
  }

  return pickFromPool(COMPANION_POOLS.default, todayStr, excludeText);
}

export function computeGreeting(records: NightRecordsMap, todayStr: string = todayKey()): string {
  const checkedIn = checkedInRecords(records);
  if (checkedIn.length === 0) return GREETING_POOLS.firstTime[0];

  const lastRecord = checkedIn[checkedIn.length - 1];
  if (daysBetween(lastRecord.date, todayStr) >= 3) return GREETING_POOLS.returning[0];

  return GREETING_POOLS[getGreetingPeriod()][0];
}

export type TodaysActionState = 'newUser' | 'beforeGoals' | 'afterGoalsSameDay' | 'beforeCheckInNextDay' | 'bothDone';

export function computeTodaysActionState(
  records: NightRecordsMap,
  dailyStage: DailyStage,
  todayStr: string = todayKey()
): TodaysActionState {
  if (dailyStage === 'noGoalsSet') return isFirstTimeUser(records) ? 'newUser' : 'beforeGoals';
  if (dailyStage === 'checkInDue') {
    const today = records[todayStr];
    const setDate = today?.goalsSetAt ? today.goalsSetAt.slice(0, 10) : todayStr;
    return setDate === todayStr ? 'afterGoalsSameDay' : 'beforeCheckInNextDay';
  }
  return 'bothDone';
}

export function pickTodaysActionText(state: TodaysActionState, todayStr: string = todayKey()): string {
  if (state === 'bothDone') return '';
  return pickFromPool(TODAYS_ACTION_POOLS[state], todayStr);
}

export interface PastNightSummary {
  date: string;
  phase: MoonPhase;
}

/** Past 7 calendar days (including today), oldest first. Days with no record show as 'new'. */
export function lastSevenNights(records: NightRecordsMap): PastNightSummary[] {
  const days: PastNightSummary[] = [];
  let cursor = todayKey();
  for (let i = 0; i < 7; i++) {
    days.unshift({ date: cursor, phase: getMoonPhase(records[cursor]) });
    cursor = addDays(cursor, -1);
  }
  return days;
}
