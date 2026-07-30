import { NightRecord, NightRecordsMap, MoonPhase, JourneyEntry } from '../types/models';
import { sortedRecords } from './nightRecords';
import { MAJOR_MILESTONES, STREAK_BAND_3_TO_6, STREAK_BAND_7, STREAK_BAND_30 } from '../constants/milestoneThresholds';
import { COMPANION_POOLS, GREETING_POOLS, TODAYS_ACTION_POOLS, pickFromPool, majorMilestoneMessage } from './companionMessages';
import { addDays, daysBetween, todayKey, getGreetingPeriod } from '../utils/date';

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

export function computeMilestones(records: NightRecordsMap): { date: string; text: string }[] {
  const sorted = checkedInRecords(records);
  const milestones: { date: string; text: string }[] = [];
  let successfulNights = 0;
  const hit = new Set<number>();

  for (const record of sorted) {
    if (isFullyAchieved(record)) successfulNights += 1;
    for (const threshold of MAJOR_MILESTONES) {
      if (successfulNights === threshold && !hit.has(threshold)) {
        hit.add(threshold);
        milestones.push({ date: record.date, text: majorMilestoneMessage(threshold) });
      }
    }
  }
  return milestones;
}

export function mostRecentMilestone(records: NightRecordsMap): { date: string; text: string } | undefined {
  const milestones = computeMilestones(records);
  return milestones[milestones.length - 1];
}

export function buildJourneyEntries(records: NightRecordsMap): JourneyEntry[] {
  const sorted = checkedInRecords(records);
  const milestones = computeMilestones(records);
  const milestonesByDate = new Map<string, string[]>();
  for (const m of milestones) {
    const list = milestonesByDate.get(m.date) ?? [];
    list.push(m.text);
    milestonesByDate.set(m.date, list);
  }

  const entries: JourneyEntry[] = [];
  for (const record of sorted) {
    entries.push({ type: 'night', record });
    const texts = milestonesByDate.get(record.date);
    if (texts) {
      for (const text of texts) {
        entries.push({ type: 'milestone', date: record.date, text });
      }
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
