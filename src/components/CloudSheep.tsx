import React from 'react';
import { Image } from 'react-native';

interface Props {
  width?: number;
  height?: number;
}

/** The little cloud-sheep divider between bedtime and wake-up on the schedule panel. */
export function CloudSheep({ width = 56, height = 40 }: Props) {
  return (
    <Image
      source={require('../../assets/images/cloud-sheep.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}
