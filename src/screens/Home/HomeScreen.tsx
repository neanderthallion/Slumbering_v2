import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenTopBar } from '../../components/ScreenTopBar';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { RootStackParamList } from '../../app/navigation.types';
import { computeDailyStage, computeGreeting, isCheckInReady } from '../../features/companion-messages/logic/pickMessage';
import { lastSevenNights, recordsInLastSevenDays } from '../../features/journey/logic/journeyEntries';
import { strongestCategoryFor } from '../../features/journey/logic/strongestCategory';
import { findOpenRecord } from '../../features/journey/logic/shared';
import { computeStreak } from '../../features/journey/logic/streak';
import { nearestMilestoneProgress, milestoneProgressText } from '../../features/journey/logic/milestones';
import { BadgesRow } from '../../features/achievements/components/BadgesRow';
import { addDays, todayKey } from '../../lib/dateMath';

import { GreetingHeader } from './GreetingHeader';
import { BedtimeSchedulePanel } from './BedtimeSchedulePanel';
import { GoalsStatusCard } from './GoalsStatusCard';
import { JourneyPreviewCard } from './JourneyPreviewCard';
import { StreakBadgeCue } from './StreakBadgeCue';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const records = useRecordsStore((s) => s.records);
  const displayName = useSettingsStore((s) => s.profile.displayName);

  const today = todayKey();
  const stage = computeDailyStage(records);
  const todayRecord = records[today];
  const openRecord = findOpenRecord(records, today);
  // Once today's record is fully checked in, there's nothing left to plan for
  // today -- the next actionable goal-setting target is tomorrow's date, so
  // setting fresh goals doesn't overwrite today's already-resolved record.
  const goalTargetDate = todayRecord?.checkInCompletedAt != null ? addDays(today, 1) : today;
  const greeting = computeGreeting(records, today);
  const readyToCheckIn = isCheckInReady(records, today);
  const pastNights = lastSevenNights(records);
  const totalNights = Object.values(records).filter((r) => r.checkInCompletedAt != null).length;
  const strongestCategory = strongestCategoryFor(recordsInLastSevenDays(records));
  const streak = computeStreak(records);
  const nearestMilestone = nearestMilestoneProgress(records);

  return (
    <LinearGradient colors={[theme.colors.bgGradientTop, theme.colors.bgGradientBottom]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScreenTopBar />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GreetingHeader greeting={greeting} userName={displayName} />
          <GoalsStatusCard
            stage={stage}
            readyToCheckIn={readyToCheckIn}
            todayRecord={openRecord}
            onPressCta={() => {
              if (stage === 'noGoalsSet') navigation.navigate('GoalPicker', { mode: 'create', date: goalTargetDate });
              else if (stage === 'checkInDue') navigation.navigate('CheckIn');
            }}
            onEditGoals={() => navigation.navigate('GoalPicker', { mode: 'edit', date: openRecord?.date })}
          />
          <StreakBadgeCue streak={streak} milestoneProgressText={nearestMilestone ? milestoneProgressText(nearestMilestone) : null} />
          <BadgesRow records={records} />
          <JourneyPreviewCard
            pastNights={pastNights}
            totalNights={totalNights}
            strongestCategory={strongestCategory}
            onPress={() => navigation.navigate('Journey')}
          />
          <BedtimeSchedulePanel />
        </ScrollView>

        <BottomTabBar active="Home" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
});
