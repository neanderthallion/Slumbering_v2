import React from 'react';
import { Image } from 'react-native';

interface Props {
  size?: number;
}

export function WakeupSunIcon({ size = 38 }: Props) {
  return (
    <Image
      source={require('../../assets/illustrations/Sun.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
