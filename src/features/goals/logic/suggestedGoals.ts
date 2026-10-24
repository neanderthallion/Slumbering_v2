import { SuggestedGoalCategory } from '../../../types/domain';
import { COPY } from '../../../copy';

export const GOAL_CATEGORIES: { key: SuggestedGoalCategory; label: string }[] = [
  { key: 'bedtime', label: COPY.goalCategories.bedtime },
  { key: 'windDown', label: COPY.goalCategories.windDown },
  { key: 'relaxation', label: COPY.goalCategories.relaxation },
];
