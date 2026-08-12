import { computeBadgeUnlocks } from './badgeUnlocks';
import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { addDays, todayKey } from '../../../lib/dateMath';

function record(date: string, overrides: Partial<NightRecord> = {}): NightRecord {
  return {
    date,
    goals: [{ goalId: 'g1', label: 'Sleep early', category: 'bedtime', achieved: true }],
    goalsSetAt: `${date}T20:00:00.000Z`,
    checkInCompletedAt: `${date}T09:00:00.000Z`,
    source: 'normal',
    plannedBedtime: '23:00',
    plannedWakeTime: '07:00',
    sleepConfirmation: 'asPlanned',
    actualBedtime: null,
    actualWakeTime: null,
    ...overrides,
  };
}

function toMap(records: NightRecord[]): NightRecordsMap {
  const map: NightRecordsMap = {};
  for (const r of records) map[r.date] = r;
  return map;
}

/** N consecutive checked-in days ending at `endDate` (inclusive), each with at least one goal achieved by default. */
function consecutiveRun(endDate: string, length: number, overrides: Partial<NightRecord> = {}): NightRecord[] {
  const out: NightRecord[] = [];
  for (let i = length - 1; i >= 0; i--) out.push(record(addDays(endDate, -i), overrides));
  return out;
}

describe('computeBadgeUnlocks', () => {
  it('returns empty for no records', () => {
    expect(computeBadgeUnlocks({})).toEqual([]);
  });

  it('unlocks firstStep on the date of the very first checked-in record, regardless of outcome', () => {
    const day = todayKey();
    const records = toMap([record(day, { goals: [{ goalId: 'g1', label: 'x', category: 'bedtime', achieved: false }] })]);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'firstStep')?.date).toBe(day);
  });

  it('unlocks fullWeek on the exact date the 7th consecutive at-least-one-achieved night lands', () => {
    const end = todayKey();
    const records = toMap(consecutiveRun(end, 7));
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'fullWeek')?.date).toBe(end);
  });

  it('fullWeek counts a partially-achieved night (not just fully-achieved)', () => {
    const end = todayKey();
    const records = toMap(
      consecutiveRun(end, 7, {
        goals: [
          { goalId: 'g1', label: 'a', category: 'bedtime', achieved: true },
          { goalId: 'g2', label: 'b', category: 'relaxation', achieved: false },
        ],
      })
    );
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'fullWeek')?.date).toBe(end);
  });

  it('a broken run followed by a fresh 7-run still fires fullWeek on the fresh run’s 7th night', () => {
    const end = todayKey();
    const staleRun = consecutiveRun(addDays(end, -20), 5);
    const freshRun = consecutiveRun(end, 7);
    const records = toMap([...staleRun, ...freshRun]);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'fullWeek')?.date).toBe(end);
  });

  it('a backfilled night in the middle of a run breaks fullWeek like a calendar gap would', () => {
    const end = todayKey();
    const run = consecutiveRun(end, 7);
    const withOneBackfilled = run.map((r, i) => (i === 3 ? { ...r, source: 'backfilled' as const } : r));
    const records = toMap(withOneBackfilled);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'fullWeek')).toBeUndefined();
  });

  it('unlocks oneMonth on the date of the 30th checked-in record, all-time, no consecutiveness required', () => {
    const end = todayKey();
    // 30 checked-in nights spread out with gaps (every other day).
    const dates = Array.from({ length: 30 }, (_, i) => addDays(end, -(29 - i) * 2));
    const records = toMap(dates.map((d) => record(d)));
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'oneMonth')?.date).toBe(dates[29]);
  });

  it('does not unlock oneMonth with only 29 checked-in nights', () => {
    const end = todayKey();
    const dates = Array.from({ length: 29 }, (_, i) => addDays(end, -(28 - i)));
    const records = toMap(dates.map((d) => record(d)));
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'oneMonth')).toBeUndefined();
  });

  it('unlocks welcomeBack on a >=5-day gap between consecutive checked-in records', () => {
    const first = addDays(todayKey(), -10);
    const second = addDays(first, 5);
    const records = toMap([record(first), record(second)]);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'welcomeBack')?.date).toBe(second);
  });

  it('does not unlock welcomeBack on a 4-day gap (boundary)', () => {
    const first = addDays(todayKey(), -10);
    const second = addDays(first, 4);
    const records = toMap([record(first), record(second)]);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'welcomeBack')).toBeUndefined();
  });

  it('oneMonth counts backfilled nights toward the cumulative 30, unlike consecutive-run badges', () => {
    const end = todayKey();
    const dates = Array.from({ length: 30 }, (_, i) => addDays(end, -(29 - i) * 2));
    const records = toMap(dates.map((d, i) => record(d, i % 2 === 0 ? { source: 'backfilled' } : {})));
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'oneMonth')?.date).toBe(dates[29]);
  });

  it('unlocks goGetter on the night the cumulative achieved-goal count reaches 50', () => {
    const end = todayKey();
    // 10 nights of 5 achieved goals each = 50 total.
    const goals = Array.from({ length: 5 }, (_, i) => ({ goalId: `g${i}`, label: `g${i}`, category: 'bedtime' as const, achieved: true }));
    const records = toMap(consecutiveRun(end, 10, { goals }));
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'goGetter')?.date).toBe(end);
  });

  it('does not unlock goGetter with only 45 goals achieved', () => {
    const end = todayKey();
    const goals = Array.from({ length: 5 }, (_, i) => ({ goalId: `g${i}`, label: `g${i}`, category: 'bedtime' as const, achieved: true }));
    const records = toMap(consecutiveRun(end, 9, { goals }));
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'goGetter')).toBeUndefined();
  });

  it('unlocks fullNight on the 10th night with >=7h of confirmed sleep, accumulated non-consecutively', () => {
    const end = todayKey();
    const dates = Array.from({ length: 10 }, (_, i) => addDays(end, -(9 - i) * 2));
    const records = toMap(
      dates.map((d) => record(d, { sleepConfirmation: 'reportedDifferent', actualBedtime: '23:00', actualWakeTime: '06:30' }))
    );
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'fullNight')?.date).toBe(dates[9]);
  });

  it('does not count a night under 7 hours toward fullNight', () => {
    const end = todayKey();
    const dates = Array.from({ length: 10 }, (_, i) => addDays(end, -(9 - i)));
    const records = toMap(
      dates.map((d) => record(d, { sleepConfirmation: 'reportedDifferent', actualBedtime: '23:00', actualWakeTime: '05:30' })) // 6.5h
    );
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'fullNight')).toBeUndefined();
  });

  it('unlocks steadyRhythm after 14 calendar-consecutive nights with bedtime within 30min of the window average', () => {
    const end = todayKey();
    const records = toMap(consecutiveRun(end, 14, { sleepConfirmation: 'asPlanned', plannedBedtime: '22:30' }));
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'steadyRhythm')?.date).toBe(end);
  });

  it('does not unlock steadyRhythm when a bedtime in the window is more than 30min off the average', () => {
    const end = todayKey();
    const dates = Array.from({ length: 14 }, (_, i) => addDays(end, -(13 - i)));
    const records = toMap(
      dates.map((d, i) => record(d, { sleepConfirmation: 'asPlanned', plannedBedtime: i === 5 ? '00:30' : '22:30' }))
    );
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'steadyRhythm')).toBeUndefined();
  });

  it('does not unlock steadyRhythm with a calendar gap breaking the 14-night run', () => {
    const end = todayKey();
    const firstRun = consecutiveRun(addDays(end, -20), 10, { sleepConfirmation: 'asPlanned', plannedBedtime: '22:30' });
    const secondRun = consecutiveRun(end, 10, { sleepConfirmation: 'asPlanned', plannedBedtime: '22:30' });
    const records = toMap([...firstRun, ...secondRun]);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'steadyRhythm')).toBeUndefined();
  });

  it('a backfilled night in the middle of the 14-night window breaks steadyRhythm like a calendar gap would', () => {
    const end = todayKey();
    const run = consecutiveRun(end, 14, { sleepConfirmation: 'asPlanned', plannedBedtime: '22:30' });
    const withOneBackfilled = run.map((r, i) => (i === 7 ? { ...r, source: 'backfilled' as const } : r));
    const records = toMap(withOneBackfilled);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'steadyRhythm')).toBeUndefined();
  });

  it('ignores a stale plannedBedtime left on an unconfirmed night when computing steadyRhythm (mirrors bedtime/logic/series.ts gating)', () => {
    const end = todayKey();
    const run = consecutiveRun(end, 14, { sleepConfirmation: 'asPlanned', plannedBedtime: '22:30' });
    // Night 8 has no confirmed sleep schedule, but a stale plannedBedtime lingers
    // (e.g. left over from an edit) -- it must not be picked up as if confirmed.
    const withUnconfirmed = run.map((r, i) => (i === 7 ? { ...r, sleepConfirmation: null, plannedBedtime: '22:30' } : r));
    const records = toMap(withUnconfirmed);
    const unlocks = computeBadgeUnlocks(records);
    expect(unlocks.find((u) => u.badgeId === 'steadyRhythm')).toBeUndefined();
  });
});
