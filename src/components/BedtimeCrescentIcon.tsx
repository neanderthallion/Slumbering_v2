import React from 'react';
import { Image } from 'react-native';

interface Props {
  size?: number;
}

export function BedtimeCrescentIcon({ size = 38 }: Props) {
  return (
    <Image
      source={require('../../assets/illustrations/Moon.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
