import { BadgeId } from '../../../types/domain';

export const BADGE_ART: Record<BadgeId, ReturnType<typeof require>> = {
  firstStep: require('../../../../assets/badges/first-step.png'),
  fullWeek: require('../../../../assets/badges/full-week.png'),
  oneMonth: require('../../../../assets/badges/one-month.png'),
  welcomeBack: require('../../../../assets/badges/welcome-back.png'),
  goGetter: require('../../../../assets/badges/go-getter.png'),
  fullNight: require('../../../../assets/badges/full-night.png'),
  steadyRhythm: require('../../../../assets/badges/steady-rhythm.png'),
};

export const BADGE_SILHOUETTE = require('../../../../assets/badges/silhouette.png');
