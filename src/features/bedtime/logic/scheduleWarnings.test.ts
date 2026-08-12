import { isLateBedtime, isShortSleepDuration, getScheduleWarningMessage } from './scheduleWarnings';

describe('isLateBedtime', () => {
  it('flags midnight through 4:59am', () => {
    expect(isLateBedtime('00:00')).toBe(true);
    expect(isLateBedtime('02:30')).toBe(true);
    expect(isLateBedtime('04:59')).toBe(true);
  });

  it('does not flag 5am or a normal evening bedtime', () => {
    expect(isLateBedtime('05:00')).toBe(false);
    expect(isLateBedtime('23:00')).toBe(false);
    expect(isLateBedtime('21:30')).toBe(false);
  });
});

describe('isShortSleepDuration', () => {
  it('flags a window under 6 hours', () => {
    expect(isShortSleepDuration('01:00', '06:00')).toBe(true);
  });

  it('does not flag a window at or over 6 hours', () => {
    expect(isShortSleepDuration('23:00', '07:00')).toBe(false);
    expect(isShortSleepDuration('01:00', '07:00')).toBe(false);
  });

  it('wraps past midnight correctly', () => {
    expect(isShortSleepDuration('23:30', '05:00')).toBe(true); // 5.5h
    expect(isShortSleepDuration('22:00', '07:00')).toBe(false); // 9h
  });
});

describe('getScheduleWarningMessage', () => {
  it('is null for a healthy schedule', () => {
    expect(getScheduleWarningMessage('23:00', '07:00')).toBeNull();
  });

  it('returns a message for a late bedtime alone', () => {
    expect(getScheduleWarningMessage('01:00', '09:00')).not.toBeNull();
  });

  it('returns a message for a short sleep window alone', () => {
    expect(getScheduleWarningMessage('23:00', '04:00')).not.toBeNull();
  });

  it('returns a combined message when both conditions apply', () => {
    const message = getScheduleWarningMessage('02:00', '06:00');
    expect(message).not.toBeNull();
    expect(message).toMatch(/late bedtime/i);
    expect(message).toMatch(/6 hours/i);
  });
});
