import { startOfWeek, startOfMonth, endOfMonth, addMonths, datesInRange } from './dateMath';

describe('startOfWeek (Monday-based)', () => {
  it('returns Monday for any day of the week', () => {
    expect(startOfWeek('2026-08-08')).toBe('2026-08-03'); // Saturday
    expect(startOfWeek('2026-08-03')).toBe('2026-08-03'); // Monday itself
    expect(startOfWeek('2026-08-09')).toBe('2026-08-03'); // Sunday
    expect(startOfWeek('2026-08-10')).toBe('2026-08-10'); // next Monday
  });

  it('crosses a month boundary', () => {
    expect(startOfWeek('2026-09-01')).toBe('2026-08-31'); // Tuesday
  });
});

describe('startOfMonth / endOfMonth', () => {
  it('bounds the calendar month', () => {
    expect(startOfMonth('2026-08-08')).toBe('2026-08-01');
    expect(endOfMonth('2026-08-08')).toBe('2026-08-31');
    expect(endOfMonth('2026-02-15')).toBe('2026-02-28');
    expect(endOfMonth('2024-02-15')).toBe('2024-02-29'); // leap year
  });
});

describe('addMonths', () => {
  it('snaps to the first of the target month', () => {
    expect(addMonths('2026-08-08', -1)).toBe('2026-07-01');
    expect(addMonths('2026-08-08', 1)).toBe('2026-09-01');
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-01');
  });
});

describe('datesInRange', () => {
  it('is inclusive of both ends, oldest first', () => {
    expect(datesInRange('2026-08-03', '2026-08-05')).toEqual(['2026-08-03', '2026-08-04', '2026-08-05']);
  });

  it('returns a single day when start === end', () => {
    expect(datesInRange('2026-08-03', '2026-08-03')).toEqual(['2026-08-03']);
  });
});
