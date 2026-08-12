import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';

interface Props {
  /** 0..1 */
  successRate: number;
  size?: number;
  label?: string;
  trackColor?: string;
  progressColor?: string;
  textColor?: string;
  labelColor?: string;
}

/** Donut progress ring for the all-time success rate (successful nights / nights logged). */
export function SuccessRing({ successRate, size = 100, label = 'All-time', trackColor, progressColor, textColor, labelColor }: Props) {
  const { theme } = useTheme();
  const pct = Math.max(0, Math.min(1, successRate));
  const strokeWidth = 10;
  const r = size / 2 - strokeWidth / 2;
  const c = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor ?? theme.colors.accentSoft} strokeWidth={strokeWidth} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={progressColor ?? theme.colors.moonFull}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 20 * theme.textScale, color: textColor ?? theme.colors.textHi }}>
          {Math.round(pct * 100)}%
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 10.5 * theme.textScale, color: labelColor ?? theme.colors.textLow, marginTop: 1 }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
