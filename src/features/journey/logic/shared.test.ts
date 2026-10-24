import { findOpenRecord } from './shared';
import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { addDays, todayKey } from '../../../lib/dateMath';

function record(date: string, overrides: Partial<NightRecord> = {}): NightRecord {
  return {
    date,
    goals: [{ goalId: 'g1', label: 'Sleep early', category: 'bedtime', achieved: null }],
    goalsSetAt: `${date}T20:00:00.000Z`,
    checkInCompletedAt: null,
    source: 'normal',
    plannedBedtime: '23:00',
    plannedWakeTime: '07:00',
    sleepConfirmation: null,
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

describe('findOpenRecord', () => {
  it('returns undefined when there is no record at all', () => {
    expect(findOpenRecord({}, todayKey())).toBeUndefined();
  });

  it("returns today's record when it has open goals", () => {
    const today = todayKey();
    const records = toMap([record(today)]);
    expect(findOpenRecord(records, today)?.date).toBe(today);
  });

  it("falls back to yesterday's still-open record after the calendar date rolls over", () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([record(yesterday)]);
    expect(findOpenRecord(records, today)?.date).toBe(yesterday);
  });

  it('prefers a checked-in yesterday record over nothing -- returns undefined once checked in', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([record(yesterday, { checkInCompletedAt: `${yesterday}T09:00:00.000Z` })]);
    expect(findOpenRecord(records, today)).toBeUndefined();
  });

  it('does not look back further than one day', () => {
    const today = todayKey();
    const twoDaysAgo = addDays(today, -2);
    const records = toMap([record(twoDaysAgo)]);
    expect(findOpenRecord(records, today)).toBeUndefined();
  });

  it('ignores a record with no goals set yet', () => {
    const today = todayKey();
    const records = toMap([record(today, { goals: [] })]);
    expect(findOpenRecord(records, today)).toBeUndefined();
  });
});
