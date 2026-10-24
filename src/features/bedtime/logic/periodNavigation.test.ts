import { periodView, prevAnchor, nextAnchor } from './periodNavigation';

// 2026-08-08 is a Saturday; its Mon-Sun week is 2026-08-03..2026-08-09.
const TODAY = '2026-08-08';

describe('periodView - week', () => {
  it('describes the calendar week containing the anchor', () => {
    const v = periodView('week', TODAY, TODAY);
    expect(v.rangeStart).toBe('2026-08-03');
    expect(v.rangeEnd).toBe('2026-08-09');
    expect(v.canGoNext).toBe(false);
  });

  it('allows paging forward from an earlier week', () => {
    const v = periodView('week', '2026-07-20', TODAY);
    expect(v.rangeStart).toBe('2026-07-20');
    expect(v.canGoNext).toBe(true);
  });
});

describe('periodView - month', () => {
  it('describes the calendar month containing the anchor', () => {
    const v = periodView('month', TODAY, TODAY);
    expect(v.rangeStart).toBe('2026-08-01');
    expect(v.rangeEnd).toBe('2026-08-31');
    expect(v.canGoNext).toBe(false);
  });

  it('allows paging forward from an earlier month', () => {
    const v = periodView('month', '2026-06-15', TODAY);
    expect(v.rangeStart).toBe('2026-06-01');
    expect(v.rangeEnd).toBe('2026-06-30');
    expect(v.canGoNext).toBe(true);
  });
});

describe('prevAnchor / nextAnchor', () => {
  it('steps a week at a time, snapped to the week start', () => {
    expect(prevAnchor('week', TODAY)).toBe('2026-07-27');
    expect(nextAnchor('week', TODAY)).toBe('2026-08-10');
  });

  it('steps a month at a time, snapped to the month start', () => {
    expect(prevAnchor('month', TODAY)).toBe('2026-07-01');
    expect(nextAnchor('month', TODAY)).toBe('2026-09-01');
  });
});
