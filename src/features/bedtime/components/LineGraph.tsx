import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { SeriesPoint } from '../logic/series';

interface Props {
  series: SeriesPoint[];
  targetMinutes: number;
  averageMinutes: number | null;
  formatMinutes: (minutes: number) => string;
  height?: number;
  color: string;
}

/** A hand-drawn SVG line graph (points + connecting segments, broken at gaps in the data) with a dashed target line, matching the app's existing hand-rolled SVG chart pattern (JourneyDotGraph, SuccessRing). */
export function LineGraph({ series, targetMinutes, averageMinutes, formatMinutes, height = 120, color }: Props) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const values = series.map((p) => p.minutes).filter((v): v is number => v != null);
  const known = values.length > 0 ? values.concat(targetMinutes) : [targetMinutes];
  const minValue = Math.min(...known);
  const maxValue = Math.max(...known);
  const domainPad = Math.max((maxValue - minValue) * 0.2, 15);
  const domainMin = minValue - domainPad;
  const domainMax = maxValue + domainPad;

  const padX = 10;
  const padY = 10;
  const usableWidth = Math.max(width - padX * 2, 1);
  const usableHeight = Math.max(height - padY * 2, 1);
  const step = series.length > 1 ? usableWidth / (series.length - 1) : 0;

  function yFor(minutes: number): number {
    const ratio = (minutes - domainMin) / (domainMax - domainMin);
    return padY + (1 - ratio) * usableHeight;
  }

  const points = series.map((p, i) => ({ ...p, x: padX + step * i, y: p.minutes != null ? yFor(p.minutes) : null }));

  const segments: string[] = [];
  let current = '';
  points.forEach((p) => {
    if (p.y == null) {
      if (current) segments.push(current);
      current = '';
      return;
    }
    current += current ? ` L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`;
  });
  if (current) segments.push(current);

  const targetY = yFor(targetMinutes);

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Line
              x1={0}
              y1={targetY}
              x2={width}
              y2={targetY}
              stroke={theme.colors.borderSubtle}
              strokeWidth={1.5}
              strokeDasharray="4 5"
            />
            {segments.map((d, i) => (
              <Path key={i} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {points.map((p) =>
              p.y != null ? <Circle key={p.date} cx={p.x} cy={p.y} r={3.5} fill={color} /> : null
            )}
          </Svg>
        )}
      </View>
      <View style={styles.footerRow}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow }}>
          {`Target ${formatMinutes(targetMinutes)}`}
        </Text>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.textMid }}>
          {averageMinutes != null ? `Average ${formatMinutes(averageMinutes)}` : 'No data yet'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
