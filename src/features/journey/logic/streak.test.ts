import { computeStreak, computeLongestStreak } from './streak';
import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { addDays, todayKey } from '../../../lib/dateMath';

function record(date: string, overrides: Partial<NightRecord> = {}): NightRecord {
  return {
    date,
    goals: [{ goalId: 'g1', label: 'Sleep early', category: 'bedtime', achieved: true }],
    goalsSetAt: `${date}T20:00:00.000Z`,
    checkInCompletedAt: `${date}T22:00:00.000Z`,
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

describe('computeStreak', () => {
  it('returns 0 for empty records', () => {
    expect(computeStreak({})).toBe(0);
  });

  it('counts consecutive fully-achieved checked-in nights ending yesterday when today has no record', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const twoAgo = addDays(today, -2);
    const records = toMap([record(yesterday), record(twoAgo)]);
    expect(computeStreak(records)).toBe(2);
  });

  it("a still-open today (not yet checked in) doesn't break an existing streak", () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([
      record(today, { checkInCompletedAt: null, goals: [{ goalId: 'g1', label: 'x', category: 'bedtime', achieved: null }] }),
      record(yesterday),
    ]);
    expect(computeStreak(records)).toBe(1);
  });

  it('a calendar gap breaks the streak', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const threeAgo = addDays(today, -3); // gap at twoAgo
    const records = toMap([record(yesterday), record(threeAgo)]);
    expect(computeStreak(records)).toBe(1);
  });

  it('a checked-in but not-fully-achieved night breaks the streak', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const twoAgo = addDays(today, -2);
    const records = toMap([
      record(yesterday, { goals: [{ goalId: 'g1', label: 'x', category: 'bedtime', achieved: false }] }),
      record(twoAgo),
    ]);
    expect(computeStreak(records)).toBe(0);
  });

  it('a backfilled night does not count toward the streak and breaks it', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const twoAgo = addDays(today, -2);
    const records = toMap([
      record(yesterday, { source: 'backfilled', checkInCompletedAt: null }),
      record(twoAgo),
    ]);
    expect(computeStreak(records)).toBe(0);
  });

  it('a manually-added past record does not count toward the streak even with checkInCompletedAt set -- a streak requires real-time check-ins', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([record(yesterday, { source: 'backfilled', checkInCompletedAt: `${yesterday}T09:00:00.000Z` })]);
    expect(computeStreak(records)).toBe(0);
  });

  it('a backfilled night in the middle of an otherwise-live run breaks the run like a calendar gap would', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const twoAgo = addDays(today, -2);
    const threeAgo = addDays(today, -3);
    const records = toMap([
      record(yesterday),
      record(twoAgo, { source: 'backfilled', checkInCompletedAt: `${twoAgo}T09:00:00.000Z` }),
      record(threeAgo),
    ]);
    expect(computeStreak(records)).toBe(1);
  });
});

describe('computeLongestStreak', () => {
  it('returns 0 for empty records', () => {
    expect(computeLongestStreak({})).toBe(0);
  });

  it('finds the longest run even if it is not the most recent one', () => {
    const today = todayKey();
    const dates = [-1, -2, -3, -10, -11].map((d) => addDays(today, d));
    const records = toMap(dates.map((d) => record(d)));
    // three-night run (today-3..today-1) is longer than the two-night run (today-11..today-10)
    expect(computeLongestStreak(records)).toBe(3);
  });

  it('a checked-in but not-fully-achieved night breaks the run', () => {
    const today = todayKey();
    const dates = [-1, -2, -3].map((d) => addDays(today, d));
    const records = toMap(dates.map((d, i) => (i === 1 ? record(d, { goals: [{ goalId: 'g1', label: 'x', category: 'bedtime', achieved: false }] }) : record(d))));
    expect(computeLongestStreak(records)).toBe(1);
  });

  it('a calendar gap breaks the run', () => {
    const today = todayKey();
    const records = toMap([record(addDays(today, -1)), record(addDays(today, -3))]);
    expect(computeLongestStreak(records)).toBe(1);
  });

  it('a backfilled night is excluded and breaks the run like a calendar gap would', () => {
    const today = todayKey();
    const dates = [-1, -2, -3].map((d) => addDays(today, d));
    const records = toMap(dates.map((d, i) => record(d, i === 1 ? { source: 'backfilled' } : {})));
    expect(computeLongestStreak(records)).toBe(1);
  });
});
