import { NightRecordsMap, NightRecord } from '../../../types/domain';
import { addDays, todayKey, parseTimeToMinutes, normalizeBedtimeMinutes } from '../../../lib/dateMath';
import { checkedInRecords } from '../../journey/logic/shared';
import { sleepDurationMinutes } from '../../journey/logic/duration';

export type BedtimePeriod = 'week' | 'month';

export const BEDTIME_PERIOD_DAYS: Record<BedtimePeriod, number> = { week: 7, month: 30 };

export { normalizeBedtimeMinutes, normalizedMinutesToTime } from '../../../lib/dateMath';

export interface SeriesPoint {
  date: string;
  minutes: number | null;
}

function recordsByDate(records: NightRecordsMap): Map<string, NightRecord> {
  const map = new Map<string, NightRecord>();
  for (const r of checkedInRecords(records)) map.set(r.date, r);
  return map;
}

/** Oldest-first list of calendar-date keys for the trailing week/month window ending today. */
export function windowDates(period: BedtimePeriod, todayStr: string = todayKey()): string[] {
  const span = BEDTIME_PERIOD_DAYS[period];
  const dates: string[] = [];
  let cursor = addDays(todayStr, -(span - 1));
  for (let i = 0; i < span; i++) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/** A night only contributes a bedtime/wake point once its sleep time is confirmed -- actual times when reported different, planned times when confirmed as-planned, excluded entirely if unconfirmed. Mirrors journey/logic/duration.ts's gating. */
function confirmedBedtime(record: NightRecord | undefined): string | null {
  if (!record) return null;
  if (record.sleepConfirmation === 'reportedDifferent') return record.actualBedtime;
  if (record.sleepConfirmation === 'asPlanned') return record.plannedBedtime;
  return null;
}

function confirmedWakeTime(record: NightRecord | undefined): string | null {
  if (!record) return null;
  if (record.sleepConfirmation === 'reportedDifferent') return record.actualWakeTime;
  if (record.sleepConfirmation === 'asPlanned') return record.plannedWakeTime;
  return null;
}

export function buildBedtimeSeries(records: NightRecordsMap, period: BedtimePeriod, todayStr: string = todayKey()): SeriesPoint[] {
  const byDate = recordsByDate(records);
  return windowDates(period, todayStr).map((date) => {
    const time = confirmedBedtime(byDate.get(date));
    return { date, minutes: time ? normalizeBedtimeMinutes(parseTimeToMinutes(time)) : null };
  });
}

export function buildWakeSeries(records: NightRecordsMap, period: BedtimePeriod, todayStr: string = todayKey()): SeriesPoint[] {
  const byDate = recordsByDate(records);
  return windowDates(period, todayStr).map((date) => {
    const time = confirmedWakeTime(byDate.get(date));
    return { date, minutes: time ? parseTimeToMinutes(time) : null };
  });
}

export function buildDurationSeries(records: NightRecordsMap, period: BedtimePeriod, todayStr: string = todayKey()): SeriesPoint[] {
  const byDate = recordsByDate(records);
  return windowDates(period, todayStr).map((date) => {
    const record = byDate.get(date);
    return { date, minutes: record ? sleepDurationMinutes(record) : null };
  });
}

export function averageMinutes(series: SeriesPoint[]): number | null {
  const values = series.map((p) => p.minutes).filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
