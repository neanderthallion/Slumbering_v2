import { NightRecordsMap } from '../../../types/domain';
import { daysBetween, todayKey, toDateKey, getGreetingPeriod, isPastCheckInUnlockHour } from '../../../lib/dateMath';
import { pickFromPool } from '../../../lib/dateSeed';
import { checkedInRecords, isFullyAchieved, findOpenRecord } from '../../journey/logic/shared';
import { computeStreak } from '../../journey/logic/streak';
import { MAJOR_MILESTONES, STREAK_BAND_3_TO_6, STREAK_BAND_7, STREAK_BAND_30 } from '../../journey/logic/milestones';
import { majorMilestoneMessage } from './majorMilestoneMessage';
import { HOME_MESSAGE_POOLS } from '../pools/messagePools';
import { TODAYS_ACTION_POOLS } from '../pools/todaysActionPools';
import { COPY } from '../../../copy';

// The companion message/greeting pools switch to "returning" copy after this
// many days away. Deliberately separate from achievements' WELCOME_BACK_GAP_DAYS
// (badges.ts) -- that's a once-ever celebration threshold, this is a daily
// message-pool threshold, and CLAUDE.md §5 says not to unify them.
const RETURNING_GAP_DAYS = 3;

export type DailyStage = 'noGoalsSet' | 'checkInDue';

/** Once today's goals are checked in, there's nothing left to review -- the stage returns to 'noGoalsSet' so the Home CTA immediately offers to plan the next night rather than dead-ending on a "come back tomorrow" filler card. Stays 'checkInDue' into the next morning via findOpenRecord if last night's goals weren't checked in yet. */
export function computeDailyStage(records: NightRecordsMap, todayStr: string = todayKey()): DailyStage {
  return findOpenRecord(records, todayStr) ? 'checkInDue' : 'noGoalsSet';
}

export function isFirstTimeUser(records: NightRecordsMap): boolean {
  return checkedInRecords(records).length === 0;
}

/** Days since the most recent checked-in night, or null if the user has never checked in. */
export function daysSinceLastCheckIn(records: NightRecordsMap, todayStr: string = todayKey()): number | null {
  const checkedIn = checkedInRecords(records);
  if (checkedIn.length === 0) return null;
  const last = checkedIn[checkedIn.length - 1];
  return daysBetween(last.date, todayStr);
}

/**
 * Priority order: first-time > returning-after-inactivity (3+ days) > major
 * milestone (just reached today) > streak band > goal-status (fallback while
 * goals aren't set yet, reflecting the last check-in's outcome) > default
 * encouragement. `excludeText` lets a caller avoid repeating yesterday's
 * exact message when another option exists.
 */
export function computeCompanionMessage(records: NightRecordsMap, todayStr: string = todayKey(), excludeText?: string): string {
  const checkedIn = checkedInRecords(records);
  if (checkedIn.length === 0) return pickFromPool(HOME_MESSAGE_POOLS.firstTime, todayStr, excludeText);

  const lastRecord = checkedIn[checkedIn.length - 1];
  const gapDays = daysBetween(lastRecord.date, todayStr);
  if (gapDays >= RETURNING_GAP_DAYS) return pickFromPool(HOME_MESSAGE_POOLS.returning, todayStr, excludeText);

  const successfulCount = checkedIn.filter(isFullyAchieved).length;
  const checkedInToday = toDateKey(new Date(lastRecord.checkInCompletedAt!)) === todayStr;
  const justHitMajorMilestone = checkedInToday && isFullyAchieved(lastRecord) && MAJOR_MILESTONES.includes(successfulCount);
  if (justHitMajorMilestone) return majorMilestoneMessage(successfulCount);

  const streak = computeStreak(records);
  if (streak >= STREAK_BAND_30.min) return pickFromPool(HOME_MESSAGE_POOLS.streak30, todayStr, excludeText);
  if (streak >= STREAK_BAND_7.min) return pickFromPool(HOME_MESSAGE_POOLS.streak7, todayStr, excludeText);
  if (streak >= STREAK_BAND_3_TO_6.min) return pickFromPool(HOME_MESSAGE_POOLS.streak3to6, todayStr, excludeText);

  if (computeDailyStage(records) === 'noGoalsSet') {
    if (isFullyAchieved(lastRecord)) return pickFromPool(HOME_MESSAGE_POOLS.goalStatusAllAchieved, todayStr, excludeText);
    const anyAchieved = lastRecord.goals.some((g) => g.achieved === true);
    if (anyAchieved) return pickFromPool(HOME_MESSAGE_POOLS.goalStatusPartial, todayStr, excludeText);
    return pickFromPool(HOME_MESSAGE_POOLS.goalStatusNone, todayStr, excludeText);
  }

  return pickFromPool(HOME_MESSAGE_POOLS.default, todayStr, excludeText);
}

const GREETING_FIRST_TIME = COPY.greeting.firstTime;
const GREETING_RETURNING = COPY.greeting.returning;
const GREETING_BY_PERIOD = {
  morning: COPY.greeting.morning,
  afternoon: COPY.greeting.afternoon,
  evening: COPY.greeting.evening,
};

export function computeGreeting(records: NightRecordsMap, todayStr: string = todayKey()): string {
  const checkedIn = checkedInRecords(records);
  if (checkedIn.length === 0) return GREETING_FIRST_TIME;

  const lastRecord = checkedIn[checkedIn.length - 1];
  if (daysBetween(lastRecord.date, todayStr) >= RETURNING_GAP_DAYS) return GREETING_RETURNING;

  return GREETING_BY_PERIOD[getGreetingPeriod()];
}

export type TodaysActionState = 'newUser' | 'beforeGoals' | 'afterGoalsSameDay' | 'beforeCheckInNextDay';

export function computeTodaysActionState(records: NightRecordsMap, dailyStage: DailyStage, todayStr: string = todayKey()): TodaysActionState {
  if (dailyStage === 'noGoalsSet') return isFirstTimeUser(records) ? 'newUser' : 'beforeGoals';
  const open = findOpenRecord(records, todayStr);
  const setDate = open?.goalsSetAt ? toDateKey(new Date(open.goalsSetAt)) : todayStr;
  return setDate === todayStr ? 'afterGoalsSameDay' : 'beforeCheckInNextDay';
}

export function pickTodaysActionText(state: TodaysActionState, todayStr: string = todayKey()): string {
  return pickFromPool(TODAYS_ACTION_POOLS[state], todayStr);
}

/**
 * Check-in only becomes available once the goal-setting evening has fully
 * passed: a different calendar day than when goals were set, AND past
 * CHECKIN_UNLOCK_HOUR local time (findOpenRecord only ever looks one day
 * back, so "different calendar day" here always means "yesterday" -- no
 * multi-day drift to account for). Gates the Home CTA only -- doesn't
 * change which date a record/streak belongs to.
 */
export function isCheckInReady(records: NightRecordsMap, todayStr: string = todayKey(), now: Date = new Date()): boolean {
  const open = findOpenRecord(records, todayStr);
  if (!open) return false;
  const setDate = open.goalsSetAt ? toDateKey(new Date(open.goalsSetAt)) : todayStr;
  return setDate !== todayStr && isPastCheckInUnlockHour(now);
}