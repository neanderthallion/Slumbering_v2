import { BadgeId } from '../types/models';

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
}

export const BADGE_DEFINITIONS: Record<BadgeId, BadgeDefinition> = {
  firstStep: {
    id: 'firstStep',
    name: 'First Step',
    description: 'Completed your first check-in.',
  },
  fullWeek: {
    id: 'fullWeek',
    name: 'Full Week',
    description: '7 consecutive nights, all goals achieved.',
  },
  oneMonth: {
    id: 'oneMonth',
    name: 'One Month',
    description: '30 consecutive nights, all goals achieved.',
  },
  earlyRiser: {
    id: 'earlyRiser',
    name: 'Early Riser',
    description: 'Checked in before 8:00 AM on 5 different days.',
  },
  welcomeBack: {
    id: 'welcomeBack',
    name: 'Welcome Back',
    description: 'Returned and checked in after a few days away.',
  },
};

export const FULL_WEEK_STREAK_THRESHOLD = 7;
export const ONE_MONTH_STREAK_THRESHOLD = 30;
export const EARLY_RISER_HOUR_CUTOFF = 8;
export const EARLY_RISER_COUNT_THRESHOLD = 5;
export const WELCOME_BACK_GAP_DAYS = 5;
