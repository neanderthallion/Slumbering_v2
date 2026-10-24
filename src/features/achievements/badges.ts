import { BadgeId } from '../../types/domain';
import { COPY } from '../../copy';

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
}

export const BADGE_DEFINITIONS: Record<BadgeId, BadgeDefinition> = {
  firstStep: { id: 'firstStep', ...COPY.achievements.badges.firstStep },
  fullWeek: { id: 'fullWeek', ...COPY.achievements.badges.fullWeek },
  oneMonth: { id: 'oneMonth', ...COPY.achievements.badges.oneMonth },
  welcomeBack: { id: 'welcomeBack', ...COPY.achievements.badges.welcomeBack },
  goGetter: { id: 'goGetter', ...COPY.achievements.badges.goGetter },
  fullNight: { id: 'fullNight', ...COPY.achievements.badges.fullNight },
  steadyRhythm: { id: 'steadyRhythm', ...COPY.achievements.badges.steadyRhythm },
};

export const FULL_WEEK_STREAK_THRESHOLD = 7;
export const ONE_MONTH_NIGHTS_THRESHOLD = 30;
export const WELCOME_BACK_GAP_DAYS = 5;
export const GO_GETTER_GOALS_THRESHOLD = 50;
export const FULL_NIGHT_NIGHTS_THRESHOLD = 10;
export const FULL_NIGHT_MINUTES_THRESHOLD = 480; // 8 hours
export const STEADY_RHYTHM_WINDOW_DAYS = 14;
export const STEADY_RHYTHM_TOLERANCE_MINUTES = 30;
