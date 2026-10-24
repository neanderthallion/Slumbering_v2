import React, { useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { SeriesPoint } from '../logic/series';
import { formatFriendlyDate } from '../../../lib/dateMath';
import { COPY, fmt } from '../../../copy';

interface Props {
  series: SeriesPoint[];
  targetMinutes: number;
  averageMinutes: number | null;
  formatMinutes: (minutes: number) => string;
  height?: number;
  color: string;
}

const AXIS_LABEL_WIDTH = 42;
const TOOLTIP_WIDTH = 118;

/** A hand-drawn SVG line graph (points + connecting segments, broken at gaps in the data) with a dashed target line, a 3-tick value axis, and a tap-to-reveal tooltip per point -- matching the app's existing hand-rolled SVG chart pattern (JourneyDotGraph, SuccessRing). */
export function LineGraph({ series, targetMinutes, averageMinutes, formatMinutes, height = 120, color }: Props) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const values = series.map((p) => p.minutes).filter((v): v is number => v != null);
  const known = values.length > 0 ? values : [targetMinutes - 60, targetMinutes + 60];
  const minValue = Math.min(...known);
  const maxValue = Math.max(...known);
  const domainPad = Math.max((maxValue - minValue) * 0.2, 15);
  const domainMin = minValue - domainPad;
  const domainMax = maxValue + domainPad;

  const padY = 10;
  const chartX = AXIS_LABEL_WIDTH;
  const padRight = 10;
  const usableWidth = Math.max(width - chartX - padRight, 1);
  const usableHeight = Math.max(height - padY * 2, 1);
  const step = series.length > 1 ? usableWidth / (series.length - 1) : 0;

  function yFor(minutes: number): number {
    const ratio = (minutes - domainMin) / (domainMax - domainMin);
    return padY + (1 - ratio) * usableHeight;
  }

  const points = series.map((p, i) => ({ ...p, x: chartX + step * i, y: p.minutes != null ? yFor(p.minutes) : null }));

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

  const averageY = averageMinutes != null ? yFor(averageMinutes) : null;
  const axisTicks = [domainMax, (domainMin + domainMax) / 2, domainMin];

  const selected = selectedIndex != null ? points[selectedIndex] : null;
  const tooltipLeft = selected ? Math.min(Math.max(selected.x - TOOLTIP_WIDTH / 2, 0), Math.max(width - TOOLTIP_WIDTH, 0)) : 0;
  const tooltipTop = selected && selected.y != null ? Math.max(selected.y - 46, 0) : 0;

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <>
            <Svg width={width} height={height}>
              {axisTicks.map((value, i) => {
                const y = yFor(value);
                return (
                  <React.Fragment key={i}>
                    <Line x1={chartX} y1={y} x2={width} y2={y} stroke={theme.colors.borderSubtle} strokeWidth={1} opacity={0.35} />
                    <SvgText x={chartX - 6} y={y + 3} fontSize={9} fill={theme.colors.textLow} textAnchor="end">
                      {formatMinutes(value)}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              {averageY != null && (
                <Line
                  x1={chartX}
                  y1={averageY}
                  x2={width}
                  y2={averageY}
                  stroke={theme.colors.borderSubtle}
                  strokeWidth={1.5}
                  strokeDasharray="4 5"
                />
              )}
              {segments.map((d, i) => (
                <Path key={i} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {points.map((p) =>
                p.y != null ? (
                  <Circle
                    key={p.date}
                    cx={p.x}
                    cy={p.y}
                    r={p.date === selected?.date ? 5 : 3.5}
                    fill={color}
                    opacity={selected && p.date !== selected.date ? 0.5 : 1}
                  />
                ) : null
              )}
            </Svg>

            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {selected && <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedIndex(null)} />}
              {points.map((p, i) =>
                p.y != null ? (
                  <Pressable
                    key={p.date}
                    hitSlop={6}
                    onPress={() => setSelectedIndex((prev) => (prev === i ? null : i))}
                    style={{ position: 'absolute', left: p.x - 12, top: (p.y as number) - 12, width: 24, height: 24 }}
                  />
                ) : null
              )}
            </View>

            {selected && selected.y != null && selected.minutes != null && (
              <View
                style={[
                  styles.tooltip,
                  { left: tooltipLeft, top: tooltipTop, width: TOOLTIP_WIDTH, backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline },
                ]}
              >
                <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 10.5 * theme.textScale, color: theme.colors.textLow }}>
                  {formatFriendlyDate(selected.date)}
                </Text>
                <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12.5 * theme.textScale, color: theme.colors.textHi, marginTop: 1 }}>
                  {formatMinutes(selected.minutes)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.footerRow}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow }}>
          {fmt(COPY.bedtime.graph.target, { value: formatMinutes(targetMinutes) })}
        </Text>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.textMid }}>
          {averageMinutes != null ? fmt(COPY.bedtime.graph.average, { value: formatMinutes(averageMinutes) }) : COPY.bedtime.graph.noData}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  tooltip: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
