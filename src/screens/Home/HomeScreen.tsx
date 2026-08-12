import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MoonMascot } from '../../components/MoonMascot';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { RootStackParamList } from '../../app/navigation.types';
import {
  computeDailyStage,
  computeGreeting,
  computeTodaysActionState,
  pickTodaysActionText,
  computeCompanionMessage,
} from '../../features/companion-messages/logic/pickMessage';
import { lastSevenNights, recordsInLastSevenDays } from '../../features/journey/logic/journeyEntries';
import { strongestCategoryFor } from '../../features/journey/logic/strongestCategory';
import { findOpenRecord } from '../../features/journey/logic/shared';
import { addDays, todayKey } from '../../lib/dateMath';

import { GreetingHeader } from './GreetingHeader';
import { TodaysMessageCard } from './TodaysMessageCard';
import { BedtimeSchedulePanel } from './BedtimeSchedulePanel';
import { GoalsStatusCard } from './GoalsStatusCard';
import { JourneyPreviewCard } from './JourneyPreviewCard';

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
  const yesterdaysMessage = computeCompanionMessage(records, addDays(today, -1));
  const message = computeCompanionMessage(records, today, yesterdaysMessage);
  const actionState = computeTodaysActionState(records, stage);
  const subMessage = pickTodaysActionText(actionState, today);
  const pastNights = lastSevenNights(records);
  const totalNights = Object.values(records).filter((r) => r.checkInCompletedAt != null).length;
  const strongestCategory = strongestCategoryFor(recordsInLastSevenDays(records));

  return (
    <LinearGradient colors={[theme.colors.bgGradientTop, theme.colors.bgGradientBottom]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <View style={styles.topBar}>
          <MoonMascot size={30} />
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={[styles.iconBtn, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.hairline }, theme.shadows.pop]}
          >
            <Ionicons name="settings-outline" size={17} color={theme.colors.textHi} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GreetingHeader greeting={greeting} userName={displayName} />
          <TodaysMessageCard message={message} subMessage={subMessage} />
          <GoalsStatusCard
            stage={stage}
            readyToCheckIn={actionState === 'beforeCheckInNextDay'}
            todayRecord={openRecord}
            onPressCta={() => {
              if (stage === 'noGoalsSet') navigation.navigate('GoalPicker', { mode: 'create', date: goalTargetDate });
              else if (stage === 'checkInDue') navigation.navigate('CheckIn');
            }}
            onEditGoals={() => navigation.navigate('GoalPicker', { mode: 'edit', date: openRecord?.date })}
          />
          <JourneyPreviewCard
            pastNights={pastNights}
            totalNights={totalNights}
            strongestCategory={strongestCategory}
            onPress={() => navigation.navigate('Journey')}
          />
          <BedtimeSchedulePanel onPress={() => navigation.navigate('Bedtime')} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
});
