import { shouldShowSleepPickers } from './checkInGate';

describe('shouldShowSleepPickers', () => {
  it('shows pickers when there is a planned schedule and no existing answer', () => {
    expect(shouldShowSleepPickers(true, null)).toBe(true);
  });

  it('hides pickers when an asPlanned confirmation already exists', () => {
    expect(shouldShowSleepPickers(true, 'asPlanned')).toBe(false);
  });

  it('hides pickers when a reportedDifferent confirmation already exists', () => {
    expect(shouldShowSleepPickers(true, 'reportedDifferent')).toBe(false);
  });

  it('hides pickers when there is no planned schedule at all', () => {
    expect(shouldShowSleepPickers(false, null)).toBe(false);
  });
});
