import React, { useMemo, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { BottomTabBar } from '../../components/BottomTabBar';
import { Card } from '../../components/Card';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { COPY } from '../../copy';
import { formatClockTime, parseTimeToMinutes, minutesBetween, todayKey } from '../../lib/dateMath';
import {
  BedtimePeriod,
  buildBedtimeSeries,
  buildWakeSeries,
  buildDurationSeries,
  averageMinutes,
  normalizeBedtimeMinutes,
  normalizedMinutesToTime,
} from '../../features/bedtime/logic/series';
import { computeRegularity, RegularityBand } from '../../features/bedtime/logic/regularity';
import { periodView, prevAnchor, nextAnchor } from '../../features/bedtime/logic/periodNavigation';
import { pickRecommendation } from '../../features/bedtime/logic/recommendations';
import { LineGraph } from '../../features/bedtime/components/LineGraph';
import { DurationBarGraph } from '../../features/bedtime/components/DurationBarGraph';
import { RecommendationCard } from '../../features/bedtime/components/RecommendationCard';

const PERIOD_TABS = [
  { key: 'week', label: COPY.bedtime.tabs.week },
  { key: 'month', label: COPY.bedtime.tabs.month },
];

function formatClockMinutes(minutes: number): string {
  return formatClockTime(normalizedMinutesToTime(minutes));
}

const REGULARITY_TONE: Record<RegularityBand, 'steady' | 'variable'> = {
  verySteady: 'steady',
  fairlySteady: 'steady',
  aBitVariable: 'variable',
  quiteVariable: 'variable',
};

function RegularityPill({ band }: { band: RegularityBand }) {
  const { theme } = useTheme();
  const tone = REGULARITY_TONE[band];
  const color = tone === 'steady' ? theme.colors.sage : theme.colors.blush;
  return (
    <View style={{ backgroundColor: `${color}26`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radii.pill }}>
      <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11.5 * theme.textScale, color }}>
        {COPY.bedtime.regularity[band]}
      </Text>
    </View>
  );
}

const CARD_HEADER = {
  fontSize: 11,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
};

export function BedtimeScreen() {
  const { theme } = useTheme();
  const records = useRecordsStore((s) => s.records);
  const bedtime = useSettingsStore((s) => s.bedtime);
  const wakeTime = useSettingsStore((s) => s.wakeTime);
  const [period, setPeriod] = useState<BedtimePeriod>('week');
  const [anchor, setAnchor] = useState(() => todayKey());

  const view = useMemo(() => periodView(period, anchor), [period, anchor]);

  const targetBedtimeMinutes = normalizeBedtimeMinutes(parseTimeToMinutes(bedtime));
  const targetWakeMinutes = parseTimeToMinutes(wakeTime);
  const targetDurationMinutes = minutesBetween(bedtime, wakeTime);

  const bedtimeSeries = useMemo(() => buildBedtimeSeries(records, period, anchor), [records, period, anchor]);
  const wakeSeries = useMemo(() => buildWakeSeries(records, period, anchor), [records, period, anchor]);
  const durationSeries = useMemo(() => buildDurationSeries(records, period, anchor), [records, period, anchor]);

  const bedtimeRegularity = useMemo(() => computeRegularity(bedtimeSeries), [bedtimeSeries]);
  const wakeRegularity = useMemo(() => computeRegularity(wakeSeries), [wakeSeries]);
  const recommendation = useMemo(
    () => pickRecommendation(records, period, bedtime, wakeTime, anchor),
    [records, period, bedtime, wakeTime, anchor]
  );

  function changePeriod(key: BedtimePeriod) {
    setPeriod(key);
    setAnchor(todayKey());
  }

  return (
    <ScreenContainer contentStyle={{ paddingBottom: 120 }} overlay={<BottomTabBar active="Bedtime" />}>
      <ScreenTopBar />
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 18 }}>
        {COPY.bedtime.screenTitle}
      </Text>

      <SegmentedTabs tabs={PERIOD_TABS} activeKey={period} onChange={(key) => changePeriod(key as BedtimePeriod)} />

      <View style={styles.navRow}>
        <Pressable
          onPress={() => setAnchor(prevAnchor(period, anchor))}
          hitSlop={10}
          style={styles.navBtn}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={18} color={theme.colors.textMid} />
        </Pressable>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textHi }}>
          {view.label}
        </Text>
        <Pressable
          onPress={() => view.canGoNext && setAnchor(nextAnchor(period, anchor))}
          disabled={!view.canGoNext}
          hitSlop={10}
          style={styles.navBtn}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-forward" size={18} color={view.canGoNext ? theme.colors.textMid : theme.colors.textLow} />
        </Pressable>
      </View>

      <Card>
        <View style={styles.headerRow}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, color: theme.colors.textLow, ...CARD_HEADER }}>
            {COPY.bedtime.cardHeaders.bedtime}
          </Text>
          {bedtimeRegularity.band && <RegularityPill band={bedtimeRegularity.band} />}
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
          <Text style={{ fontFamily: theme.fonts.bodyBold, color: theme.colors.textLow, ...CARD_HEADER }}>
            {COPY.bedtime.cardHeaders.wakeup}
          </Text>
          {wakeRegularity.band && <RegularityPill band={wakeRegularity.band} />}
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
        <Text style={{ fontFamily: theme.fonts.bodyBold, color: theme.colors.textLow, marginBottom: 12, ...CARD_HEADER }}>
          {COPY.bedtime.cardHeaders.duration}
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
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
