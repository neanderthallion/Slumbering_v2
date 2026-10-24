import React from 'react';
import { Image } from 'react-native';

interface Props {
  size?: number;
}

export function BedtimeCrescentIcon({ size = 38 }: Props) {
  return (
    <Image
      source={require('../../assets/images/moon.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
