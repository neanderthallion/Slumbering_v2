import { sleepDurationMinutes } from './duration';
import { NightRecord } from '../../../types/domain';

function baseRecord(overrides: Partial<NightRecord>): NightRecord {
  return {
    date: '2026-08-01',
    goals: [],
    goalsSetAt: null,
    checkInCompletedAt: '2026-08-01T08:00:00.000Z',
    source: 'normal',
    plannedBedtime: null,
    plannedWakeTime: null,
    sleepConfirmation: null,
    actualBedtime: null,
    actualWakeTime: null,
    ...overrides,
  };
}

describe('sleepDurationMinutes', () => {
  it('uses actual times when reported different from plan', () => {
    const record = baseRecord({
      sleepConfirmation: 'reportedDifferent',
      actualBedtime: '23:30',
      actualWakeTime: '07:00',
      plannedBedtime: '22:00',
      plannedWakeTime: '06:00',
    });
    expect(sleepDurationMinutes(record)).toBe(450);
  });

  it('falls back to planned times when confirmed as planned', () => {
    const record = baseRecord({
      sleepConfirmation: 'asPlanned',
      plannedBedtime: '22:00',
      plannedWakeTime: '06:00',
    });
    expect(sleepDurationMinutes(record)).toBe(480);
  });

  it('wraps past midnight', () => {
    const record = baseRecord({
      sleepConfirmation: 'reportedDifferent',
      actualBedtime: '23:00',
      actualWakeTime: '06:30',
    });
    expect(sleepDurationMinutes(record)).toBe(450);
  });

  it('is null when unconfirmed', () => {
    const record = baseRecord({ sleepConfirmation: null, plannedBedtime: '22:00', plannedWakeTime: '06:00' });
    expect(sleepDurationMinutes(record)).toBeNull();
  });

  it('is null when reported different but an actual time is missing', () => {
    const record = baseRecord({ sleepConfirmation: 'reportedDifferent', actualBedtime: '23:00', actualWakeTime: null });
    expect(sleepDurationMinutes(record)).toBeNull();
  });

  it('is null when as-planned but a planned time is missing', () => {
    const record = baseRecord({ sleepConfirmation: 'asPlanned', plannedBedtime: null, plannedWakeTime: '06:00' });
    expect(sleepDurationMinutes(record)).toBeNull();
  });
});
