import { createNightRecord } from './nightGoals';

describe('createNightRecord backfill shape', () => {
  it('marks a backfilled record with source backfilled and no check-in timestamp, so it does not count toward the streak', () => {
    const record = createNightRecord('2026-08-05', [], 'backfilled', { bedtime: '23:00', wakeTime: '07:00' });
    expect(record.source).toBe('backfilled');
    expect(record.checkInCompletedAt).toBeNull();
  });
});
