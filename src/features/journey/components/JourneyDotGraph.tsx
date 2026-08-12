import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PastNightSummary } from '../logic/journeyEntries';
import { useTheme } from '../../../theme/ThemeProvider';

interface Props {
  nights: PastNightSummary[];
  height?: number;
}

/** Deterministic per-date jitter so the same night always wobbles the same amount (not random on every render). */
function jitter(seed: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return ((hash % 1000) / 1000 - 0.5) * 2 * range;
}

const TIER_FRACTION: Record<PastNightSummary['phase'], number> = {
  full: 0.16,
  crescent: 0.55,
  new: 0.85,
};

/** A connected dot graph ("constellation") for recent nights -- full/partial/empty phases plotted with a wobble derived from each night's outcome, connected by a dashed line. */
export function JourneyDotGraph({ nights, height = 80 }: Props) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const pad = 16;
  const usableWidth = Math.max(width - pad * 2, 1);
  const usableHeight = height - pad;
  const step = nights.length > 1 ? usableWidth / (nights.length - 1) : 0;

  const points = nights.map((n, i) => ({
    ...n,
    x: pad + step * i,
    y: pad / 2 + TIER_FRACTION[n.phase] * usableHeight + jitter(n.date, 6),
  }));

  const path = points.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path d={path} fill="none" stroke={theme.colors.borderSubtle} strokeWidth={1.5} strokeDasharray="1 7" strokeLinecap="round" />
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
