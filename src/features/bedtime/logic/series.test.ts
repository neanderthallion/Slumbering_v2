import { buildBedtimeSeries, buildWakeSeries, buildDurationSeries, averageMinutes, normalizeBedtimeMinutes, normalizedMinutesToTime, windowDates } from './series';
import { NightRecord, NightRecordsMap } from '../../../types/domain';

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

const TODAY = '2026-08-08';

describe('normalizeBedtimeMinutes / normalizedMinutesToTime', () => {
  it('pushes pre-noon clock times into the next day range', () => {
    expect(normalizeBedtimeMinutes(30)).toBe(24 * 60 + 30); // 00:30 -> 24:30
    expect(normalizeBedtimeMinutes(23 * 60)).toBe(23 * 60); // 23:00 stays put
  });

  it('round-trips back to a wall-clock time', () => {
    expect(normalizedMinutesToTime(24 * 60 + 30)).toBe('00:30');
    expect(normalizedMinutesToTime(23 * 60)).toBe('23:00');
  });
});

describe('windowDates', () => {
  it('returns the trailing N days ending today, oldest first', () => {
    const dates = windowDates('week', TODAY);
    expect(dates).toHaveLength(7);
    expect(dates[dates.length - 1]).toBe(TODAY);
    expect(dates[0]).toBe('2026-08-02');
  });
});

describe('buildBedtimeSeries / buildWakeSeries / buildDurationSeries', () => {
  const records: NightRecordsMap = {
    [TODAY]: record(TODAY, { sleepConfirmation: 'reportedDifferent', actualBedtime: '23:30', actualWakeTime: '07:00' }),
    '2026-08-07': record('2026-08-07', { sleepConfirmation: 'asPlanned', plannedBedtime: '22:45', plannedWakeTime: '06:30' }),
    '2026-08-06': record('2026-08-06', { sleepConfirmation: null }), // unconfirmed -> excluded
  };

  it('gates on confirmation and picks actual vs planned accordingly', () => {
    const bedtimes = buildBedtimeSeries(records, 'week', TODAY);
    const today = bedtimes.find((p) => p.date === TODAY)!;
    expect(today.minutes).toBe(normalizeBedtimeMinutes(23 * 60 + 30));

    const planned = bedtimes.find((p) => p.date === '2026-08-07')!;
    expect(planned.minutes).toBe(normalizeBedtimeMinutes(22 * 60 + 45));

    const unconfirmed = bedtimes.find((p) => p.date === '2026-08-06')!;
    expect(unconfirmed.minutes).toBeNull();

    const noRecord = bedtimes.find((p) => p.date === '2026-08-05')!;
    expect(noRecord.minutes).toBeNull();
  });

  it('builds wake series from confirmed wake times', () => {
    const wakes = buildWakeSeries(records, 'week', TODAY);
    expect(wakes.find((p) => p.date === TODAY)!.minutes).toBe(7 * 60);
    expect(wakes.find((p) => p.date === '2026-08-07')!.minutes).toBe(6 * 60 + 30);
  });

  it('builds duration series via sleepDurationMinutes', () => {
    const durations = buildDurationSeries(records, 'week', TODAY);
    expect(durations.find((p) => p.date === TODAY)!.minutes).toBe(450);
    expect(durations.find((p) => p.date === '2026-08-06')!.minutes).toBeNull();
  });
});

describe('averageMinutes', () => {
  it('averages only non-null points', () => {
    expect(averageMinutes([{ date: 'a', minutes: 10 }, { date: 'b', minutes: null }, { date: 'c', minutes: 20 }])).toBe(15);
  });

  it('is null when nothing is confirmed', () => {
    expect(averageMinutes([{ date: 'a', minutes: null }])).toBeNull();
  });
});
