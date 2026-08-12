import { NightRecord, GoalCategory } from '../../../types/domain';

/** Category with the highest achieved/total rate among a set of records' goals; ties favor bedtime > windDown > relaxation > custom. Null if no goals were set in the range. */
export function strongestCategoryFor(records: NightRecord[]): GoalCategory | null {
  const totals: Record<GoalCategory, { achieved: number; total: number }> = {
    bedtime: { achieved: 0, total: 0 },
    windDown: { achieved: 0, total: 0 },
    relaxation: { achieved: 0, total: 0 },
    custom: { achieved: 0, total: 0 },
  };
  for (const record of records) {
    for (const goal of record.goals) {
      totals[goal.category].total += 1;
      if (goal.achieved === true) totals[goal.category].achieved += 1;
    }
  }
  let best: GoalCategory | null = null;
  let bestRate = -1;
  (Object.keys(totals) as GoalCategory[]).forEach((category) => {
    const { achieved, total } = totals[category];
    if (total === 0) return;
    const rate = achieved / total;
    if (rate > bestRate) {
      bestRate = rate;
      best = category;
    }
  });
  return best;
}
