import { strongestCategoryFor } from './strongestCategory';
import { NightRecord } from '../../../types/domain';

function recordWith(goals: NightRecord['goals']): NightRecord {
  return {
    date: '2026-08-01',
    goals,
    goalsSetAt: null,
    checkInCompletedAt: '2026-08-01T08:00:00.000Z',
    source: 'normal',
    plannedBedtime: null,
    plannedWakeTime: null,
    sleepConfirmation: null,
    actualBedtime: null,
    actualWakeTime: null,
  };
}

describe('strongestCategoryFor', () => {
  it('returns null when there are no goals', () => {
    expect(strongestCategoryFor([recordWith([])])).toBeNull();
  });

  it('picks the category with the highest achieved rate', () => {
    const records = [
      recordWith([
        { goalId: 'a', label: 'a', category: 'bedtime', achieved: true },
        { goalId: 'b', label: 'b', category: 'relaxation', achieved: false },
      ]),
    ];
    expect(strongestCategoryFor(records)).toBe('bedtime');
  });

  it('breaks ties by bedtime > windDown > relaxation > custom', () => {
    const records = [
      recordWith([
        { goalId: 'a', label: 'a', category: 'relaxation', achieved: true },
        { goalId: 'b', label: 'b', category: 'windDown', achieved: true },
        { goalId: 'c', label: 'c', category: 'bedtime', achieved: true },
      ]),
    ];
    expect(strongestCategoryFor(records)).toBe('bedtime');
  });
});
