import { computeCompanionMessage, computeTodaysActionState, isCheckInReady } from './pickMessage';
import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { addDays, todayKey } from '../../../lib/dateMath';
import { HOME_MESSAGE_POOLS } from '../pools/messagePools';
import { majorMilestoneMessage } from './majorMilestoneMessage';

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

describe('computeCompanionMessage priority order', () => {
  it('picks from the firstTime pool when there are no checked-in records', () => {
    const today = todayKey();
    const message = computeCompanionMessage({}, today);
    expect(HOME_MESSAGE_POOLS.firstTime as readonly string[]).toContain(message);
  });

  it('picks from the returning pool after a 3+ day gap', () => {
    const today = todayKey();
    const records = toMap([record(addDays(today, -5))]);
    const message = computeCompanionMessage(records, today);
    expect(HOME_MESSAGE_POOLS.returning as readonly string[]).toContain(message);
  });

  it('picks the major-milestone message when the 5th successful night was just logged today', () => {
    const today = todayKey();
    const records = toMap([
      record(addDays(today, -4), { checkInCompletedAt: `${addDays(today, -4)}T09:00:00.000Z` }),
      record(addDays(today, -3)),
      record(addDays(today, -2)),
      record(addDays(today, -1)),
      record(today),
    ]);
    const message = computeCompanionMessage(records, today);
    expect(message).toBe(majorMilestoneMessage(5));
  });

  it('picks from the streak3to6 pool for a 4-night streak', () => {
    const today = todayKey();
    const records = toMap([
      record(addDays(today, -4)),
      record(addDays(today, -3)),
      record(addDays(today, -2)),
      record(addDays(today, -1)),
    ]);
    const message = computeCompanionMessage(records, today);
    expect(HOME_MESSAGE_POOLS.streak3to6 as readonly string[]).toContain(message);
  });

  it("falls back to the goal-status pool (partial) while today's goals aren't set yet", () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([
      record(yesterday, {
        goals: [
          { goalId: 'g1', label: 'a', category: 'bedtime', achieved: true },
          { goalId: 'g2', label: 'b', category: 'windDown', achieved: false },
        ],
      }),
    ]);
    const message = computeCompanionMessage(records, today);
    expect(HOME_MESSAGE_POOLS.goalStatusPartial as readonly string[]).toContain(message);
  });

  it("falls back to the default pool once today's goals are already set (checkInDue)", () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([record(yesterday), record(today, { checkInCompletedAt: null })]);
    const message = computeCompanionMessage(records, today);
    expect(HOME_MESSAGE_POOLS.default as readonly string[]).toContain(message);
  });

  it('same records + same date called twice returns the identical message (determinism)', () => {
    const today = todayKey();
    const records = toMap([record(addDays(today, -1))]);
    expect(computeCompanionMessage(records, today)).toBe(computeCompanionMessage(records, today));
  });

  it('excludeText steers the pick away from yesterday’s message when the pool allows it', () => {
    const today = todayKey();
    const records: NightRecordsMap = {};
    const withoutExclude = computeCompanionMessage(records, today);
    const withExclude = computeCompanionMessage(records, today, withoutExclude);
    // firstTime pool has 2 entries, so excluding the only other candidate must flip the pick.
    expect(withExclude).not.toBe(withoutExclude);
  });

  it('picks the major-milestone message when the 5th successful night was checked in after midnight (record still dated yesterday, checkInCompletedAt is today)', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([
      record(addDays(today, -5)),
      record(addDays(today, -4)),
      record(addDays(today, -3)),
      record(addDays(today, -2)),
      record(yesterday, { checkInCompletedAt: new Date().toISOString() }),
    ]);
    const message = computeCompanionMessage(records, today);
    expect(message).toBe(majorMilestoneMessage(5));
  });
});

// Builds a local-evening ISO timestamp for `dateKey` -- a hardcoded 'T20:00:00.000Z'
// suffix would be 8pm UTC, which can round-trip to a *different* local calendar date
// depending on the runner's timezone (see the UTC/local test below). Constructing via
// local Date components keeps goalsSetAt's local calendar date pinned to `dateKey`.
function localEveningISO(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 20, 0, 0).toISOString();
}

describe('isCheckInReady', () => {
  it('is not ready when goals were set today, regardless of hour', () => {
    const today = todayKey();
    const records = toMap([record(today, { checkInCompletedAt: null, goalsSetAt: localEveningISO(today) })]);
    const lateNow = new Date();
    lateNow.setHours(4, 0, 0, 0);
    expect(isCheckInReady(records, today, lateNow)).toBe(false);
  });

  it('is not ready the next day before 3am local time', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([record(yesterday, { checkInCompletedAt: null, goalsSetAt: localEveningISO(yesterday) })]);
    const earlyNow = new Date();
    earlyNow.setHours(2, 30, 0, 0);
    expect(isCheckInReady(records, today, earlyNow)).toBe(false);
  });

  it('is ready the next day once past 3am local time', () => {
    const today = todayKey();
    const yesterday = addDays(today, -1);
    const records = toMap([record(yesterday, { checkInCompletedAt: null, goalsSetAt: localEveningISO(yesterday) })]);
    const readyNow = new Date();
    readyNow.setHours(3, 0, 0, 0);
    expect(isCheckInReady(records, today, readyNow)).toBe(true);
  });

  it('is not ready when there is no open record at all', () => {
    const today = todayKey();
    expect(isCheckInReady({}, today, new Date())).toBe(false);
  });
});

describe('computeTodaysActionState UTC/local date handling', () => {
  it('classifies goals set locally as afterGoalsSameDay even when their UTC timestamp falls on a different calendar date', () => {
    const today = '2026-08-12';
    const [y, m, d] = today.split('-').map(Number);
    // 1am local time on `today`, expressed via the runtime's real timezone offset so this
    // reproduces the UTC-slice-vs-local-date mismatch regardless of which machine runs it.
    const localOneAM = new Date(y, m - 1, d, 1, 0, 0);
    const records = toMap([record(today, { checkInCompletedAt: null, goalsSetAt: localOneAM.toISOString() })]);
    const state = computeTodaysActionState(records, 'checkInDue', today);
    expect(state).toBe('afterGoalsSameDay');
  });
});
