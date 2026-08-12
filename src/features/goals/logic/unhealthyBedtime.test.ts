import { looksLikeUnhealthyBedtime } from './unhealthyBedtime';

describe('looksLikeUnhealthyBedtime', () => {
  it('flags a bedtime goal naming midnight', () => {
    expect(looksLikeUnhealthyBedtime('bedtime', 'Lights out at 12am')).toBe(true);
  });

  it('flags a bedtime goal naming an hour inside 12am-4:59am', () => {
    expect(looksLikeUnhealthyBedtime('bedtime', 'Asleep by 3:45am')).toBe(true);
  });

  it('does not flag a normal evening bedtime', () => {
    expect(looksLikeUnhealthyBedtime('bedtime', 'Lights out at 10pm')).toBe(false);
  });

  it('does not flag a category other than bedtime/custom', () => {
    expect(looksLikeUnhealthyBedtime('windDown', 'Read until 2am')).toBe(false);
  });

  it('does not false-positive when minutes look like a risky hour', () => {
    expect(looksLikeUnhealthyBedtime('custom', 'Wake up at 11:12am')).toBe(false);
  });

  it('does not false-positive on other minute values matching an hour digit', () => {
    expect(looksLikeUnhealthyBedtime('custom', 'Leave for class at 9:12am')).toBe(false);
  });

  it('never blocks -- always returns a boolean, never throws', () => {
    expect(() => looksLikeUnhealthyBedtime('custom', '')).not.toThrow();
  });
});
