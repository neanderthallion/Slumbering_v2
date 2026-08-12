import { BadgeId } from '../../types/domain';

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
    description: '7 consecutive nights, at least one goal achieved.',
  },
  oneMonth: {
    id: 'oneMonth',
    name: 'One Month',
    description: '30 days of slumber, all time.',
  },
  welcomeBack: {
    id: 'welcomeBack',
    name: 'Welcome Back',
    description: 'Returned and checked in after a few days away.',
  },
  goGetter: {
    id: 'goGetter',
    name: 'Go-getter',
    description: '50 goals achieved.',
  },
  fullNight: {
    id: 'fullNight',
    name: 'Full Night',
    description: '10 nights of healthy sleep duration.',
  },
  steadyRhythm: {
    id: 'steadyRhythm',
    name: 'Steady Rhythm',
    description: 'A steady bedtime across two weeks.',
  },
};

export const FULL_WEEK_STREAK_THRESHOLD = 7;
export const ONE_MONTH_NIGHTS_THRESHOLD = 30;
export const WELCOME_BACK_GAP_DAYS = 5;
export const GO_GETTER_GOALS_THRESHOLD = 50;
export const FULL_NIGHT_NIGHTS_THRESHOLD = 10;
export const FULL_NIGHT_MINUTES_THRESHOLD = 420; // 7 hours
export const STEADY_RHYTHM_WINDOW_DAYS = 14;
export const STEADY_RHYTHM_TOLERANCE_MINUTES = 30;
