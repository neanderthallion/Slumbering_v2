import React from 'react';
import { Image } from 'react-native';

interface Props {
  size?: number;
}

/** Luna, the app's sleepy crescent-moon companion and brand mark. */
export function MoonMascot({ size = 72 }: Props) {
  return (
    <Image
      source={require('../../assets/illustrations/Mascot.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
