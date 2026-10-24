import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { SeriesPoint } from '../logic/series';
import { COPY, fmt } from '../../../copy';

interface Props {
  series: SeriesPoint[];
  targetMinutes: number;
  averageMinutes: number | null;
  height?: number;
  color: string;
}

// Wide enough for the longest label this axis renders ("10h 30m", 7 chars at 9px is ~35px)
// plus the 6px gap before the axis line. Matches LineGraph so the two stacked Bedtime cards
// share a left gutter; duration strings are the longer of the two axes, so this width drives it.
const AXIS_LABEL_WIDTH = 42;

function formatDuration(minutes: number): string {
  return fmt(COPY.bedtime.graph.duration, { hours: Math.floor(minutes / 60), minutes: minutes % 60 });
}

export function DurationBarGraph({ series, targetMinutes, averageMinutes, height = 120, color }: Props) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const values = series.map((p) => p.minutes).filter((v): v is number => v != null);
  const maxValue = values.length > 0 ? Math.max(...values, 60) : Math.max(targetMinutes, 60);
  const padY = 10;
  const chartX = AXIS_LABEL_WIDTH;
  const padRight = 10;
  const usableWidth = Math.max(width - chartX - padRight, 1);
  const usableHeight = Math.max(height - padY * 2, 1);
  const gap = 4;
  const barWidth = series.length > 0 ? Math.max((usableWidth - gap * (series.length - 1)) / series.length, 2) : 0;

  function yFor(minutes: number): number {
    return padY + usableHeight - (minutes / maxValue) * usableHeight;
  }

  const averageY = averageMinutes != null ? yFor(averageMinutes) : null;
  const axisTicks = [maxValue, maxValue / 2, 0];

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {axisTicks.map((value, i) => {
              const y = yFor(value);
              return (
                <React.Fragment key={i}>
                  <Line x1={chartX} y1={y} x2={width} y2={y} stroke={theme.colors.borderSubtle} strokeWidth={1} opacity={0.35} />
                  <SvgText x={chartX - 6} y={y + 3} fontSize={9} fill={theme.colors.textLow} textAnchor="end">
                    {formatDuration(value)}
                  </SvgText>
                </React.Fragment>
              );
            })}
            {averageY != null && (
              <Line x1={chartX} y1={averageY} x2={width} y2={averageY} stroke={theme.colors.borderSubtle} strokeWidth={1.5} strokeDasharray="4 5" />
            )}
            {series.map((p, i) => {
              if (p.minutes == null) return null;
              const barHeight = usableHeight - (yFor(p.minutes) - padY);
              const x = chartX + i * (barWidth + gap);
              const y = yFor(p.minutes);
              return <Rect key={p.date} x={x} y={y} width={barWidth} height={barHeight} rx={3} fill={color} opacity={0.85} />;
            })}
          </Svg>
        )}
      </View>
      <View style={styles.footerRow}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow }}>
          {fmt(COPY.bedtime.graph.target, { value: formatDuration(targetMinutes) })}
        </Text>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.textMid }}>
          {averageMinutes != null ? fmt(COPY.bedtime.graph.average, { value: formatDuration(averageMinutes) }) : COPY.bedtime.graph.noData}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
