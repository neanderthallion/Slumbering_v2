import React from 'react';
import { Image } from 'react-native';
import { BadgeId } from '../../../types/domain';
import { BADGE_ART, BADGE_SILHOUETTE } from './badgeArt';

interface Props {
  badgeId: BadgeId;
  earned: boolean;
  size?: number;
}

export function BadgeIconImage({ badgeId, earned, size = 62 }: Props) {
  return (
    <Image source={earned ? BADGE_ART[badgeId] : BADGE_SILHOUETTE} style={{ width: size, height: size, opacity: earned ? 1 : 0.55 }} resizeMode="contain" />
  );
}
