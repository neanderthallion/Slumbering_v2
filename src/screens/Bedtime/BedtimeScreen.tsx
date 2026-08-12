import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { BackRow } from '../../components/BackRow';
import { Card } from '../../components/Card';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { formatTime12h, parseTimeToMinutes, minutesBetween } from '../../lib/dateMath';
import {
  BedtimePeriod,
  buildBedtimeSeries,
  buildWakeSeries,
  buildDurationSeries,
  averageMinutes,
  normalizeBedtimeMinutes,
  normalizedMinutesToTime,
} from '../../features/bedtime/logic/series';
import { computeRegularity } from '../../features/bedtime/logic/regularity';
import { pickRecommendation } from '../../features/bedtime/logic/recommendations';
import { LineGraph } from '../../features/bedtime/components/LineGraph';
import { DurationBarGraph } from '../../features/bedtime/components/DurationBarGraph';
import { RecommendationCard } from '../../features/bedtime/components/RecommendationCard';

const PERIOD_TABS = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

function formatClockMinutes(minutes: number): string {
  return formatTime12h(normalizedMinutesToTime(minutes));
}

export function BedtimeScreen() {
  const { theme } = useTheme();
  const records = useRecordsStore((s) => s.records);
  const bedtime = useSettingsStore((s) => s.bedtime);
  const wakeTime = useSettingsStore((s) => s.wakeTime);
  const [period, setPeriod] = useState<BedtimePeriod>('week');

  const targetBedtimeMinutes = normalizeBedtimeMinutes(parseTimeToMinutes(bedtime));
  const targetWakeMinutes = parseTimeToMinutes(wakeTime);
  const targetDurationMinutes = minutesBetween(bedtime, wakeTime);

  const bedtimeSeries = useMemo(() => buildBedtimeSeries(records, period), [records, period]);
  const wakeSeries = useMemo(() => buildWakeSeries(records, period), [records, period]);
  const durationSeries = useMemo(() => buildDurationSeries(records, period), [records, period]);

  const bedtimeRegularity = useMemo(() => computeRegularity(bedtimeSeries), [bedtimeSeries]);
  const wakeRegularity = useMemo(() => computeRegularity(wakeSeries), [wakeSeries]);
  const recommendation = useMemo(
    () => pickRecommendation(records, period, bedtime, wakeTime),
    [records, period, bedtime, wakeTime]
  );

  return (
    <ScreenContainer>
      <BackRow />
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 18 }}>
        Bedtime
      </Text>

      <SegmentedTabs tabs={PERIOD_TABS} activeKey={period} onChange={(key) => setPeriod(key as BedtimePeriod)} />

      <Card>
        <View style={styles.headerRow}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11 * theme.textScale, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.colors.textLow }}>
            Bedtime
          </Text>
          {bedtimeRegularity.label && (
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.accent }}>
              {bedtimeRegularity.label}
            </Text>
          )}
        </View>
        <LineGraph
          series={bedtimeSeries}
          targetMinutes={targetBedtimeMinutes}
          averageMinutes={averageMinutes(bedtimeSeries)}
          formatMinutes={formatClockMinutes}
          color={theme.colors.moonPartial}
        />
      </Card>

      <Card>
        <View style={styles.headerRow}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11 * theme.textScale, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.colors.textLow }}>
            Wakeup
          </Text>
          {wakeRegularity.label && (
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color: theme.colors.accent }}>
              {wakeRegularity.label}
            </Text>
          )}
        </View>
        <LineGraph
          series={wakeSeries}
          targetMinutes={targetWakeMinutes}
          averageMinutes={averageMinutes(wakeSeries)}
          formatMinutes={formatClockMinutes}
          color={theme.colors.amber}
        />
      </Card>

      <Card>
        <Text
          style={{
            fontFamily: theme.fonts.bodyBold,
            fontSize: 11 * theme.textScale,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.textLow,
            marginBottom: 12,
          }}
        >
          Duration
        </Text>
        <DurationBarGraph
          series={durationSeries}
          targetMinutes={targetDurationMinutes}
          averageMinutes={averageMinutes(durationSeries)}
          color={theme.colors.sage}
        />
      </Card>

      <RecommendationCard recommendation={recommendation} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
});
