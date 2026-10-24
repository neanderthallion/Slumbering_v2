import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';
import { PastNightSummary } from '../logic/journeyEntries';
import { useTheme } from '../../../theme/ThemeProvider';

interface Props {
  nights: PastNightSummary[];
  height?: number;
}

const AXIS_LABELS = [
  { fraction: 1, text: '100%' },
  { fraction: 0.5, text: '50%' },
  { fraction: 0, text: '0%' },
];

const AXIS_LABEL_WIDTH = 33;

function sharpPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

/** A connected dot graph plotting each night's actual completion percentage against a 0/50/100% axis, joined by a sharp dashed trend line -- full/partial/empty phases still drive dot styling (color/fill), completion drives vertical position. */
export function JourneyDotGraph({ nights, height = 96 }: Props) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const padTop = 16;
  const padRight = 10;
  const chartX = AXIS_LABEL_WIDTH;
  const usableWidth = Math.max(width - chartX - padRight, 1);
  const usableHeight = Math.max(height - padTop * 2, 1);
  const step = nights.length > 1 ? usableWidth / (nights.length - 1) : 0;

  function yForCompletion(completion: number | null): number {
    const fraction = completion ?? 0;
    return padTop + (1 - fraction) * usableHeight;
  }

  const points = nights.map((n, i) => ({
    ...n,
    x: chartX + step * i,
    y: yForCompletion(n.completion),
  }));

  const trendPath = sharpPath(points.map((p) => ({ x: p.x, y: p.y })));

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {AXIS_LABELS.map(({ fraction, text }) => {
            const y = yForCompletion(fraction);
            return (
              <React.Fragment key={text}>
                <Line x1={chartX} y1={y} x2={width} y2={y} stroke={theme.colors.borderSubtle} strokeWidth={1} opacity={0.4} />
                <SvgText
                  x={chartX - 9}
                  y={y + 3}
                  fontSize={9}
                  fill={theme.colors.textLow}
                  textAnchor="end"
                >
                  {text}
                </SvgText>
              </React.Fragment>
            );
          })}

          <Path d={trendPath} fill="none" stroke={theme.colors.moonPartial} strokeWidth={1.5} strokeDasharray="1 7" strokeLinecap="round" />

          {points.map((p) => {
            if (p.phase === 'full') {
              return (
                <React.Fragment key={p.date}>
                  <Circle cx={p.x} cy={p.y} r={13} fill={theme.colors.moonFull} opacity={0.28} />
                  <Circle cx={p.x} cy={p.y} r={8} fill={theme.colors.moonFull} />
                </React.Fragment>
              );
            }
            if (p.phase === 'crescent') {
              return (
                <React.Fragment key={p.date}>
                  <Circle cx={p.x} cy={p.y} r={10.5} fill={theme.colors.moonPartial} opacity={0.25} />
                  <Circle cx={p.x} cy={p.y} r={6.5} fill={theme.colors.moonPartial} />
                </React.Fragment>
              );
            }
            return <Circle key={p.date} cx={p.x} cy={p.y} r={5} fill="none" stroke={theme.colors.moonEmpty} strokeWidth={1.5} opacity={0.5} />;
          })}
        </Svg>
      )}
    </View>
  );
}
