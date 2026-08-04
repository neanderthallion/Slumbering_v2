import React from 'react';
import Svg, { Circle, ClipPath, G, Defs } from 'react-native-svg';
import { MoonPhase } from '../types/models';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  phase: MoonPhase;
  size?: number;
  maskColor?: string;
}

const OFFSET_FRACTION: Record<MoonPhase, number> = {
  new: 0,
  crescent: 0.42,
  full: 1.2,
};

export function MoonIcon({ phase, size = 24, maskColor }: Props) {
  const { theme } = useTheme();
  const r = size / 2;
  const cy = r;
  const cx = r;
  const maskCx = cx + OFFSET_FRACTION[phase] * size;
  const resolvedMask = maskColor ?? theme.colors.bgBase;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size}${size}`}>
      <Defs>
        <ClipPath id="moonClip">
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#moonClip)">
        <Circle cx={cx} cy={cy} r={r} fill={theme.colors.moonLight} />
        <Circle cx={maskCx} cy={cy} r={r} fill={resolvedMask} />
      </G>
    </Svg>
  );
}