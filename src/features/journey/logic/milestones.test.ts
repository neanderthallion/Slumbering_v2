import { nearestMilestoneProgress, milestoneProgressText } from './milestones';
import { BADGE_DEFINITIONS } from '../../achievements/badges';
import { COPY, fmt } from '../../../copy';
import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { addDays, todayKey } from '../../../lib/dateMath';

function record(date: string, achieved: boolean): NightRecord {
  return {
    date,
    goals: [{ goalId: 'g1', label: 'Sleep early', category: 'bedtime', achieved }],
    goalsSetAt: `${date}T20:00:00.000Z`,
    checkInCompletedAt: `${date}T09:00:00.000Z`,
    source: 'normal',
    plannedBedtime: '23:00',
    plannedWakeTime: '07:00',
    sleepConfirmation: 'asPlanned',
    actualBedtime: null,
    actualWakeTime: null,
  };
}

function toMap(records: NightRecord[]): NightRecordsMap {
  const map: NightRecordsMap = {};
  for (const r of records) map[r.date] = r;
  return map;
}

/** N consecutive fully-achieved-or-not checked-in nights ending at `endDate` (inclusive). */
function nights(endDate: string, count: number, achieved: boolean): NightRecord[] {
  const out: NightRecord[] = [];
  for (let i = count - 1; i >= 0; i--) out.push(record(addDays(endDate, -i), achieved));
  return out;
}

describe('nearestMilestoneProgress', () => {
  it('targets First Step before any check-in has ever happened', () => {
    expect(nearestMilestoneProgress({})).toEqual({ label: BADGE_DEFINITIONS.firstStep.name, remaining: 1 });
  });

  it('moves on to milestone tracking as soon as a single check-in has happened, regardless of outcome', () => {
    const records = toMap(nights(todayKey(), 1, false));
    expect(nearestMilestoneProgress(records)).toEqual({ label: '5', remaining: 5 });
  });

  it('targets 5 once checked in but not yet fully-achieved any night', () => {
    const records = toMap(nights(todayKey(), 3, false));
    expect(nearestMilestoneProgress(records)).toEqual({ label: '5', remaining: 5 });
  });

  it('counts cumulative fully-achieved nights toward the next threshold', () => {
    const records = toMap(nights(todayKey(), 3, true));
    expect(nearestMilestoneProgress(records)).toEqual({ label: '5', remaining: 2 });
  });

  it('advances to the next threshold once the current one is passed', () => {
    const records = toMap(nights(todayKey(), 6, true));
    expect(nearestMilestoneProgress(records)).toEqual({ label: '10', remaining: 4 });
  });

  it('returns null once the highest milestone (365) has been reached', () => {
    const records = toMap(nights(todayKey(), 365, true));
    expect(nearestMilestoneProgress(records)).toBeNull();
  });
});

describe('milestoneProgressText', () => {
  // Vietnamese has no plural inflection, so the template carries one form and
  // just interpolates the count and target label.
  it('fills the count and target label into the template', () => {
    expect(milestoneProgressText({ label: '5', remaining: 3 })).toBe(
      fmt(COPY.journey.milestoneProgress, { count: 3, label: '5' })
    );
  });

  it('interpolates a badge-name target', () => {
    expect(milestoneProgressText({ label: BADGE_DEFINITIONS.firstStep.name, remaining: 1 })).toBe(
      fmt(COPY.journey.milestoneProgress, { count: 1, label: BADGE_DEFINITIONS.firstStep.name })
    );
  });
});
