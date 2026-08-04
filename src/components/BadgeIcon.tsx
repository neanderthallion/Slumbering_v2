import React from 'react';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  size?: number;
  color?: string;
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(' ');
}

/** One shared glyph across all badges for v1, keeping with the app's minimal, hand-rolled-SVG icon language (see MoonIcon). */
export function BadgeIcon({ size = 28, color }: Props) {
  const { theme } = useTheme();
  const fill = color ?? theme.colors.amber;
  const r = size / 2;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={r} cy={r} r={r} fill={fill} opacity={0.16} />
      <Polygon points={starPoints(r, r, r * 0.62, r * 0.28)} fill={fill} />
    </Svg>
  );
}
