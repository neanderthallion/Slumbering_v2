import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useRecordsStore } from '../../store/recordsStore';
import { RootStackParamList } from '../../app/navigation.types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { BottomTabBar } from '../../components/BottomTabBar';
import { Card } from '../../components/Card';
import { SuccessRing } from '../../features/journey/components/SuccessRing';
import { TimelineList } from '../../features/journey/components/TimelineList';
import { buildJourneyEntries, computeAllTimeStats } from '../../features/journey/logic/journeyEntries';
import { COPY, fmt } from '../../copy';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Journey'>;

export function JourneyScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const records = useRecordsStore((s) => s.records);
  const insets = useSafeAreaInsets();

  const entries = buildJourneyEntries(records);
  const stats = computeAllTimeStats(records);

  // The tab bar's real height is 56 (its minHeight) + the device's own bottom safe-area
  // inset -- a hardcoded offset here undershoots on devices with a tall gesture-nav inset,
  // letting the bar (painted after, so on top) cover the FAB's lower edge.
  const fabBottom = 56 + insets.bottom + 16;

  return (
    <ScreenContainer
      contentStyle={{ paddingBottom: 120 }}
      overlay={
        <>
          <Pressable
            onPress={() => navigation.navigate('AddPastRecord', {})}
            style={[styles.fab, { bottom: fabBottom, backgroundColor: theme.colors.accent }, theme.shadows.raised]}
          >
            <Ionicons name="calendar-outline" size={22} color={theme.colors.accentContrastText} />
          </Pressable>
          <BottomTabBar active="Journey" />
        </>
      }
    >
      <ScreenTopBar />

      <Text style={{ fontFamily: theme.fonts.display, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 18 }}>
        {COPY.journey.screenTitle}
      </Text>

      <Card variant="night">
        <View style={styles.statsRow}>
          <SuccessRing
            successRate={stats.successRate}
            size={104}
            trackColor="rgba(251,243,228,0.14)"
            progressColor={theme.colors.nightAccent}
            textColor={theme.colors.nightText}
            labelColor={theme.colors.nightTextDim}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 17 * theme.textScale, color: theme.colors.nightText }}>
              {fmt(COPY.journey.nightsLogged, { count: stats.nightsLogged })}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.nightTextDim, marginTop: 4 }}>
              {fmt(COPY.journey.successfulAllTime, { count: stats.successfulNights })}
            </Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13 * theme.textScale, color: theme.colors.nightTextDim, marginTop: 2 }}>
              {fmt(COPY.journey.longestStreak, { count: stats.longestStreak })}
            </Text>
          </View>
        </View>
      </Card>

      <TimelineList entries={entries} onPressNight={(date) => navigation.navigate('AddPastRecord', { date })} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  fab: {
    position: 'absolute',
    right: 22,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
