import {
  addDays,
  addMonths,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  todayKey,
} from '../../../lib/dateMath';
import { COPY } from '../../../copy';
import { BedtimePeriod } from './series';

export interface PeriodView {
  /** Inclusive date-key bounds of the visible calendar week / month. */
  rangeStart: string;
  rangeEnd: string;
  /** Human label for the range, e.g. "03/08 – 09/08/2026" or "Month 8, 2026". */
  label: string;
  /** False once the range already contains today -- there is no future to page into. */
  canGoNext: boolean;
}

function dd(dateKey: string): string {
  return dateKey.slice(8, 10);
}
function mm(dateKey: string): string {
  return dateKey.slice(5, 7);
}
function yyyy(dateKey: string): string {
  return dateKey.slice(0, 4);
}

function weekLabel(start: string, end: string): string {
  return `${dd(start)}/${mm(start)} – ${dd(end)}/${mm(end)}/${yyyy(end)}`;
}

function monthLabel(anchor: string): string {
  return `${COPY.bedtime.monthWord} ${Number(mm(anchor))}, ${yyyy(anchor)}`;
}

/** The calendar week/month range and label for `anchor` under the given period. */
export function periodView(period: BedtimePeriod, anchor: string, today: string = todayKey()): PeriodView {
  if (period === 'week') {
    const rangeStart = startOfWeek(anchor);
    const rangeEnd = addDays(rangeStart, 6);
    return {
      rangeStart,
      rangeEnd,
      label: weekLabel(rangeStart, rangeEnd),
      canGoNext: rangeStart < startOfWeek(today),
    };
  }
  const rangeStart = startOfMonth(anchor);
  return {
    rangeStart,
    rangeEnd: endOfMonth(anchor),
    label: monthLabel(anchor),
    canGoNext: rangeStart < startOfMonth(today),
  };
}

/** Anchor date for the previous week / month. */
export function prevAnchor(period: BedtimePeriod, anchor: string): string {
  return period === 'week' ? addDays(startOfWeek(anchor), -7) : addMonths(anchor, -1);
}

/** Anchor date for the next week / month. */
export function nextAnchor(period: BedtimePeriod, anchor: string): string {
  return period === 'week' ? addDays(startOfWeek(anchor), 7) : addMonths(anchor, 1);
}
