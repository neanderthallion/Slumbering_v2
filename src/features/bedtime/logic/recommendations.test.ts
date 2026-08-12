import { pickRecommendation } from './recommendations';
import { RECOMMENDATION_POOLS } from '../pools/recommendationPools';
import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { addDays } from '../../../lib/dateMath';

const TODAY = '2026-08-08';
const TARGET_BEDTIME = '22:30';
const TARGET_WAKE = '06:30';

function record(date: string, overrides: Partial<NightRecord>): NightRecord {
  return {
    date,
    goals: [],
    goalsSetAt: null,
    checkInCompletedAt: `${date}T08:00:00.000Z`,
    source: 'normal',
    plannedBedtime: null,
    plannedWakeTime: null,
    sleepConfirmation: null,
    actualBedtime: null,
    actualWakeTime: null,
    ...overrides,
  };
}

function weekOfRecords(build: (date: string, i: number) => Partial<NightRecord>): NightRecordsMap {
  const map: NightRecordsMap = {};
  for (let i = 0; i < 7; i++) {
    const date = addDays(TODAY, -i);
    map[date] = record(date, build(date, i));
  }
  return map;
}

describe('pickRecommendation', () => {
  it('prioritizes duration when average sleep is short', () => {
    const records = weekOfRecords(() => ({
      sleepConfirmation: 'reportedDifferent',
      actualBedtime: '23:00',
      actualWakeTime: '05:00', // 6h, under the 8h threshold
    }));
    const result = pickRecommendation(records, 'week', TARGET_BEDTIME, TARGET_WAKE, TODAY);
    expect(result.category).toBe('duration');
    expect(RECOMMENDATION_POOLS.duration).toContain(result.text);
  });

  it('falls through to regularity when duration is fine but bedtime is irregular', () => {
    const varyingBedtimes = ['21:00', '00:30', '22:00', '23:30', '21:30', '00:00', '22:30'];
    const records = weekOfRecords((_date, i) => ({
      sleepConfirmation: 'reportedDifferent',
      actualBedtime: varyingBedtimes[i],
      actualWakeTime: '07:30', // ~9h, above duration threshold
    }));
    const result = pickRecommendation(records, 'week', TARGET_BEDTIME, TARGET_WAKE, TODAY);
    expect(result.category).toBe('regularity');
  });

  it('falls back to tips when everything is on target', () => {
    const records = weekOfRecords(() => ({
      sleepConfirmation: 'asPlanned',
      plannedBedtime: TARGET_BEDTIME,
      plannedWakeTime: TARGET_WAKE,
    }));
    const result = pickRecommendation(records, 'week', TARGET_BEDTIME, TARGET_WAKE, TODAY);
    expect(result.category).toBe('tips');
  });

  it('is deterministic for the same inputs', () => {
    const records = weekOfRecords(() => ({ sleepConfirmation: 'asPlanned', plannedBedtime: TARGET_BEDTIME, plannedWakeTime: TARGET_WAKE }));
    const a = pickRecommendation(records, 'week', TARGET_BEDTIME, TARGET_WAKE, TODAY);
    const b = pickRecommendation(records, 'week', TARGET_BEDTIME, TARGET_WAKE, TODAY);
    expect(a).toEqual(b);
  });
});
