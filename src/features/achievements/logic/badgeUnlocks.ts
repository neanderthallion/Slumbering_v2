import { BadgeId, NightRecord, NightRecordsMap } from '../../../types/domain';
import { daysBetween, normalizeBedtimeMinutes, parseTimeToMinutes } from '../../../lib/dateMath';
import { checkedInRecords } from '../../journey/logic/shared';
import { forwardConsecutiveAchievedLengths } from '../../journey/logic/milestones';
import { sleepDurationMinutes } from '../../journey/logic/duration';
import {
  BADGE_DEFINITIONS,
  FULL_WEEK_STREAK_THRESHOLD,
  ONE_MONTH_NIGHTS_THRESHOLD,
  WELCOME_BACK_GAP_DAYS,
  GO_GETTER_GOALS_THRESHOLD,
  FULL_NIGHT_NIGHTS_THRESHOLD,
  FULL_NIGHT_MINUTES_THRESHOLD,
  STEADY_RHYTHM_WINDOW_DAYS,
  STEADY_RHYTHM_TOLERANCE_MINUTES,
} from '../badges';

export interface BadgeUnlock {
  date: string;
  id: string;
  badgeId: BadgeId;
  text: string;
}

function hasAnyGoalAchieved(record: NightRecord): boolean {
  return record.goals.some((g) => g.achieved === true);
}

/** Mirrors bedtime/logic/series.ts's confirmedBedtime gating -- a night only contributes a bedtime once its sleep time is actually confirmed. */
function bedtimeMinutes(record: NightRecord): number | null {
  const time =
    record.sleepConfirmation === 'reportedDifferent'
      ? record.actualBedtime
      : record.sleepConfirmation === 'asPlanned'
        ? record.plannedBedtime
        : null;
  return time ? normalizeBedtimeMinutes(parseTimeToMinutes(time)) : null;
}

/** First date a run of `STEADY_RHYTHM_WINDOW_DAYS` calendar-consecutive checked-in nights all fall within `STEADY_RHYTHM_TOLERANCE_MINUTES` of that window's own average bedtime. Expects backfilled nights already filtered out by the caller -- a consecutive run requires real-time check-ins. */
function findSteadyRhythmDate(sorted: NightRecord[]): string | null {
  let runStart = 0;
  let prevDate: string | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const isConsecutiveDay = prevDate != null && daysBetween(prevDate, sorted[i].date) === 1;
    if (!isConsecutiveDay) runStart = i;
    prevDate = sorted[i].date;

    const runLength = i - runStart + 1;
    if (runLength < STEADY_RHYTHM_WINDOW_DAYS) continue;

    const windowStart = i - STEADY_RHYTHM_WINDOW_DAYS + 1;
    const window = sorted.slice(windowStart, i + 1);
    const bedtimes = window.map(bedtimeMinutes);
    if (bedtimes.some((m) => m == null)) continue;
    const values = bedtimes as number[];
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const withinTolerance = values.every((v) => Math.abs(v - average) <= STEADY_RHYTHM_TOLERANCE_MINUTES);
    if (withinTolerance) return sorted[i].date;
  }
  return null;
}

/** Each of the 7 fixed badges, awarded once-ever on the date it was first earned. */
export function computeBadgeUnlocks(records: NightRecordsMap): BadgeUnlock[] {
  const sorted = checkedInRecords(records);
  if (sorted.length === 0) return [];
  const unlocks: BadgeUnlock[] = [];

  unlocks.push({ date: sorted[0].date, id: 'badge-firstStep', badgeId: 'firstStep', text: BADGE_DEFINITIONS.firstStep.name });

  const fullWeekStreaks = forwardConsecutiveAchievedLengths(records, hasAnyGoalAchieved);
  const fullWeek = fullWeekStreaks.find((s) => s.length === FULL_WEEK_STREAK_THRESHOLD);
  if (fullWeek) unlocks.push({ date: fullWeek.date, id: 'badge-fullWeek', badgeId: 'fullWeek', text: BADGE_DEFINITIONS.fullWeek.name });

  if (sorted.length >= ONE_MONTH_NIGHTS_THRESHOLD) {
    const oneMonthDate = sorted[ONE_MONTH_NIGHTS_THRESHOLD - 1].date;
    unlocks.push({ date: oneMonthDate, id: 'badge-oneMonth', badgeId: 'oneMonth', text: BADGE_DEFINITIONS.oneMonth.name });
  }

  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1].date, sorted[i].date) >= WELCOME_BACK_GAP_DAYS) {
      unlocks.push({ date: sorted[i].date, id: 'badge-welcomeBack', badgeId: 'welcomeBack', text: BADGE_DEFINITIONS.welcomeBack.name });
      break;
    }
  }

  let goalsAchieved = 0;
  for (const record of sorted) {
    goalsAchieved += record.goals.filter((g) => g.achieved === true).length;
    if (goalsAchieved >= GO_GETTER_GOALS_THRESHOLD) {
      unlocks.push({ date: record.date, id: 'badge-goGetter', badgeId: 'goGetter', text: BADGE_DEFINITIONS.goGetter.name });
      break;
    }
  }

  let fullNightCount = 0;
  for (const record of sorted) {
    const minutes = sleepDurationMinutes(record);
    if (minutes != null && minutes >= FULL_NIGHT_MINUTES_THRESHOLD) {
      fullNightCount += 1;
      if (fullNightCount === FULL_NIGHT_NIGHTS_THRESHOLD) {
        unlocks.push({ date: record.date, id: 'badge-fullNight', badgeId: 'fullNight', text: BADGE_DEFINITIONS.fullNight.name });
        break;
      }
    }
  }

  const steadyRhythmDate = findSteadyRhythmDate(sorted.filter((r) => r.source !== 'backfilled'));
  if (steadyRhythmDate) {
    unlocks.push({ date: steadyRhythmDate, id: 'badge-steadyRhythm', badgeId: 'steadyRhythm', text: BADGE_DEFINITIONS.steadyRhythm.name });
  }

  return unlocks;
}
