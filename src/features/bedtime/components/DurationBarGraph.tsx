import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { SeriesPoint } from '../logic/series';

interface Props {
  series: SeriesPoint[];
  targetMinutes: number;
  averageMinutes: number | null;
  height?: number;
  color: string;
}

function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function DurationBarGraph({ series, targetMinutes, averageMinutes, height = 120, color }: Props) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const values = series.map((p) => p.minutes).filter((v): v is number => v != null);
  const maxValue = Math.max(targetMinutes, ...values, 60);
  const padX = 10;
  const padY = 10;
  const usableWidth = Math.max(width - padX * 2, 1);
  const usableHeight = Math.max(height - padY * 2, 1);
  const gap = 4;
  const barWidth = series.length > 0 ? Math.max((usableWidth - gap * (series.length - 1)) / series.length, 2) : 0;

  function barHeightFor(minutes: number): number {
    return (minutes / maxValue) * usableHeight;
  }

  const targetY = padY + usableHeight - (targetMinutes / maxValue) * usableHeight;

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Line x1={0} y1={targetY} x2={width} y2={targetY} stroke={theme.colors.borderSubtle} strokeWidth={1.5} strokeDasharray="4 5" />
            {series.map((p, i) => {
              if (p.minutes == null) return null;
              const barHeight = barHeightFor(p.minutes);
              const x = padX + i * (barWidth + gap);
              const y = padY + usableHeight - barHeight;
              return <Rect key={p.date} x={x} y={y} width={barWidth} height={barHeight} rx={3} fill={color} opacity={0.85} />;
            })}
          </Svg>
        )}
      </View>
      <View style={styles.footerRow}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow }}>
          {`Target ${formatDuration(targetMinutes)}`}
        </Text>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.textMid }}>
          {averageMinutes != null ? `Average ${formatDuration(averageMinutes)}` : 'No data yet'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
