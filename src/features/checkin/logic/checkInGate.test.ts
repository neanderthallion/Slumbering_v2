import { initialSleepStep } from './checkInGate';

describe('initialSleepStep', () => {
  it("offers the ask gate when there's a planned schedule and no existing answer", () => {
    expect(initialSleepStep(true, null)).toBe('ask');
  });

  it('the yes-answer fast path: an existing asPlanned confirmation skips straight to done, no picker step visited', () => {
    expect(initialSleepStep(true, 'asPlanned')).toBe('done');
  });

  it('an existing reportedDifferent confirmation also skips straight to done', () => {
    expect(initialSleepStep(true, 'reportedDifferent')).toBe('done');
  });

  it('skips straight to done when there is no planned schedule at all', () => {
    expect(initialSleepStep(false, null)).toBe('done');
  });
});
