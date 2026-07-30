import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useCompanionMessage } from '../../hooks/useCompanionMessage';
import { RootStackParamList } from '../../navigation/types';
import {
  computeDailyStage,
  computeGreeting,
  computeStreak,
  computeTodaysActionState,
  lastSevenNights,
  mostRecentMilestone,
  pickTodaysActionText,
} from '../../data/selectors';
import { todayKey } from '../../utils/date';

import { GreetingHeader } from './GreetingHeader';
import { TodaysMessageCard } from './TodaysMessageCard';
import { GoalsStatusCard } from './GoalsStatusCard';
import { JourneyPreviewCard } from './JourneyPreviewCard';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { records, settings } = useAppData();

  const stage = computeDailyStage(records);
  const todayRecord = records[todayKey()];
  const greeting = computeGreeting(records);
  const message = useCompanionMessage();
  const actionState = computeTodaysActionState(records, stage);
  const subMessage = pickTodaysActionText(actionState);
  const streak = computeStreak(records);
  const pastNights = lastSevenNights(records);
  const totalNights = Object.values(records).filter((r) => r.checkInCompletedAt != null).length;
  const milestone = mostRecentMilestone(records);

  return (
    <LinearGradient
      colors={[theme.colors.bgGradientTop, theme.colors.bgGradientBottom]}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.moonLight }]} />
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={[styles.iconBtn, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.hairline }]}
          >
            <Ionicons name="settings-outline" size={17} color={theme.colors.textHi} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GreetingHeader greeting={greeting} userName={settings.userName} />
          <TodaysMessageCard message={message} subMessage={subMessage} />
          <GoalsStatusCard
            stage={stage}
            todayRecord={todayRecord}
            onPressCta={() => {
              if (stage === 'noGoalsSet') navigation.navigate('GoalPicker', { mode: 'create' });
              else if (stage === 'checkInDue') navigation.navigate('CheckIn');
            }}
            onEditGoals={() => navigation.navigate('GoalPicker', { mode: 'edit' })}
          />
          <JourneyPreviewCard
            pastNights={pastNights}
            streak={streak}
            totalNights={totalNights}
            milestone={milestone}
            onPress={() => navigation.navigate('Journey')}
          />
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
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
