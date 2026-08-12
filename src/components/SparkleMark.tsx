import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/** The brand's firefly/sparkle glyph -- used in place of a wordmark logo, and as an ambient accent. */
export function SparkleMark({ size = 22, color = '#fce2a6' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Path
        d="M30 6 C33 20 40 27 54 30 C40 33 33 40 30 54 C27 40 20 33 6 30 C20 27 27 20 30 6 Z"
        fill={color}
      />
    </Svg>
  );
}
