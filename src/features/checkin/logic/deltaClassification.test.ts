import { classifySleepDuration, classifySleepSchedule, SLEEP_TIME_TOLERANCE_MINUTES } from './deltaClassification';

describe('classifySleepDuration', () => {
  it('classifies an exact match as onPlan', () => {
    expect(classifySleepDuration(480, 480)).toBe('onPlan');
  });

  it('classifies a diff within tolerance as onPlan', () => {
    expect(classifySleepDuration(480, 480 + 10)).toBe('onPlan');
  });

  it('classifies a diff at exactly +tolerance as onPlan (inclusive boundary)', () => {
    expect(classifySleepDuration(480, 480 + SLEEP_TIME_TOLERANCE_MINUTES)).toBe('onPlan');
  });

  it('classifies a diff at exactly -tolerance as onPlan (inclusive boundary)', () => {
    expect(classifySleepDuration(480, 480 - SLEEP_TIME_TOLERANCE_MINUTES)).toBe('onPlan');
  });

  it('classifies a diff one minute past +tolerance as longerThanPlanned, correctly signed', () => {
    expect(classifySleepDuration(480, 480 + SLEEP_TIME_TOLERANCE_MINUTES + 1)).toBe('longerThanPlanned');
  });

  it('classifies a diff one minute past -tolerance as shorterThanPlanned, correctly signed', () => {
    expect(classifySleepDuration(480, 480 - SLEEP_TIME_TOLERANCE_MINUTES - 1)).toBe('shorterThanPlanned');
  });
});

describe('classifySleepSchedule', () => {
  it('classifies matching times as onPlan', () => {
    expect(classifySleepSchedule('23:00', '07:00', '23:00', '07:00')).toBe('onPlan');
  });

  it('classifies both times shifted within tolerance as onPlan', () => {
    expect(classifySleepSchedule('23:00', '07:00', '23:10', '07:05')).toBe('onPlan');
  });

  it('does not classify as onPlan when bedtime and wake time both shift 2h later, even though duration is unchanged', () => {
    // Regression: a naive duration-only comparison sees 8h planned vs 8h actual and reports onPlan,
    // missing that the whole schedule shifted 2h off plan.
    expect(classifySleepSchedule('23:00', '07:00', '01:00', '09:00')).not.toBe('onPlan');
  });

  it('classifies a later bedtime with unchanged wake time as shorterThanPlanned', () => {
    expect(classifySleepSchedule('23:00', '07:00', '00:00', '07:00')).toBe('shorterThanPlanned');
  });

  it('classifies a later wake time with unchanged bedtime as longerThanPlanned', () => {
    expect(classifySleepSchedule('23:00', '07:00', '23:00', '08:00')).toBe('longerThanPlanned');
  });

  it('handles a bedtime shift wrapping past midnight without misreading the wrap as a large deviation', () => {
    // 23:45 planned -> 00:05 actual is a 20 minute deviation, not a ~23h40m one.
    expect(classifySleepSchedule('23:45', '07:00', '00:05', '07:00')).toBe('shorterThanPlanned');
  });
});
