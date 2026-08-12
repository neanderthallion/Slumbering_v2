import { BadgeId } from '../../../types/domain';

export const BADGE_ART: Record<BadgeId, ReturnType<typeof require>> = {
  firstStep: require('../../../../assets/illustrations/First Step.png'),
  fullWeek: require('../../../../assets/illustrations/Full Week.png'),
  oneMonth: require('../../../../assets/illustrations/One Month.png'),
  welcomeBack: require('../../../../assets/illustrations/Welcome Back.png'),
  goGetter: require('../../../../assets/illustrations/Go-getter.png'),
  fullNight: require('../../../../assets/illustrations/Full Night.png'),
  steadyRhythm: require('../../../../assets/illustrations/Steady Rhythm.png'),
};

export const BADGE_SILHOUETTE = require('../../../../assets/illustrations/Silhouette.png');
