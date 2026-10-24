import { detectNewlyUnlocked } from './celebrationGating';
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

describe('detectNewlyUnlocked', () => {
  it('includes an unlock dated today that is not yet in celebratedIds', () => {
    const today = todayKey();
    const records = toMap([record(today)]);
    const unlocks = detectNewlyUnlocked(records, [], today);
    expect(unlocks.some((u) => u.id === 'badge-firstStep')).toBe(true);
  });

  it('excludes an unlock dated today that is already in celebratedIds', () => {
    const today = todayKey();
    const records = toMap([record(today)]);
    const unlocks = detectNewlyUnlocked(records, ['badge-firstStep'], today);
    expect(unlocks.some((u) => u.id === 'badge-firstStep')).toBe(false);
  });

  it('excludes any unlock dated in the past, even if not in celebratedIds (backdate gating)', () => {
    const today = todayKey();
    const past = addDays(today, -30);
    const records = toMap([record(past)]);
    const unlocks = detectNewlyUnlocked(records, [], today);
    expect(unlocks.some((u) => u.id === 'badge-firstStep')).toBe(false);
  });
});
