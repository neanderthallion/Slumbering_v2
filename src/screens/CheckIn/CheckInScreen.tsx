import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useToast } from '../../components/ToastProvider';
import { RootStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PillToggle } from '../../components/PillToggle';
import { TimeField } from '../../components/TimeField';
import { AchievementCelebrationModal } from '../../components/AchievementCelebrationModal';
import { NightRecord, SleepConfirmation } from '../../types/models';
import { getMoonPhase } from '../../data/selectors';
import { detectNewlyUnlocked, AchievementUnlock } from '../../data/achievements';
import { classifySleepDuration, pickSleepTimeFeedback } from '../../data/sleepTimeFeedback';
import { pickCheckInToast } from '../../data/checkInToastMessages';
import { todayKey, formatTime12h, minutesBetween } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;

export function CheckInScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { settings, records, upsertRecord, updateSettings } = useAppData();
  const { showToast } = useToast();
  const today = records[todayKey()];

  const [answers, setAnswers] = useState<Record<string, boolean | null>>(() => {
    const init: Record<string, boolean | null> = {};
    today?.goals.forEach((g) => (init[g.goalId] = g.achieved));
    return init;
  });

  const hasPlannedSchedule = !!today?.plannedBedtime && !!today?.plannedWakeTime;
  const [sleepStep, setSleepStep] = useState<'ask' | 'reportTimes' | 'done'>(
    hasPlannedSchedule && today?.sleepConfirmation == null ? 'ask' : 'done'
  );
  const [sleepAnswer, setSleepAnswer] = useState<{
    confirmation: SleepConfirmation;
    actualBedtime: string | null;
    actualWakeTime: string | null;
  } | null>(
    today?.sleepConfirmation
      ? { confirmation: today.sleepConfirmation, actualBedtime: today.actualBedtime, actualWakeTime: today.actualWakeTime }
      : null
  );
  const [sleepFeedback, setSleepFeedback] = useState<string | null>(null);
  const [reportBedtime, setReportBedtime] = useState(today?.plannedBedtime ?? settings.bedtimeSchedule.bedtime);
  const [reportWakeTime, setReportWakeTime] = useState(today?.plannedWakeTime ?? settings.bedtimeSchedule.wakeTime);

  const [celebration, setCelebration] = useState<AchievementUnlock[] | null>(null);
  const [pendingToast, setPendingToast] = useState<string | null>(null);

  if (!today) {
    navigation.navigate('Home');
    return null;
  }

  const allAnswered = today.goals.every((g) => answers[g.goalId] !== null && answers[g.goalId] !== undefined);

  function handleSleepYes() {
    setSleepAnswer({ confirmation: 'asPlanned', actualBedtime: null, actualWakeTime: null });
    setSleepStep('done');
  }

  function handleSleepNo() {
    setSleepStep('reportTimes');
  }

  function handleReportContinue() {
    const plannedMinutes = minutesBetween(today.plannedBedtime!, today.plannedWakeTime!);
    const actualMinutes = minutesBetween(reportBedtime, reportWakeTime);
    const comparison = classifySleepDuration(plannedMinutes, actualMinutes);
    setSleepFeedback(pickSleepTimeFeedback(comparison, today.date));
    setSleepAnswer({ confirmation: 'reportedDifferent', actualBedtime: reportBedtime, actualWakeTime: reportWakeTime });
    setSleepStep('done');
  }

  function handleConfirm() {
    if (!allAnswered || !today) return;
    const updated: NightRecord = {
      ...today,
      goals: today.goals.map((g) => ({ ...g, achieved: answers[g.goalId] ?? null })),
      checkInCompletedAt: new Date().toISOString(),
      sleepConfirmation: sleepAnswer?.confirmation ?? today.sleepConfirmation,
      actualBedtime: sleepAnswer?.actualBedtime ?? today.actualBedtime,
      actualWakeTime: sleepAnswer?.actualWakeTime ?? today.actualWakeTime,
    };
    upsertRecord(updated);
    const nextRecords = { ...records, [updated.date]: updated };

    const newlyUnlocked = detectNewlyUnlocked(nextRecords, settings.celebratedAchievementIds);
    const toastText = pickCheckInToast(getMoonPhase(updated), updated.date);

    if (newlyUnlocked.length > 0) {
      updateSettings((prev) => ({
        ...prev,
        celebratedAchievementIds: [...prev.celebratedAchievementIds, ...newlyUnlocked.map((u) => u.id)],
      }));
      setCelebration(newlyUnlocked);
      setPendingToast(toastText);
    } else {
      navigation.navigate('Home');
      showToast(toastText);
    }
  }

  function handleCelebrationClose() {
    setCelebration(null);
    navigation.navigate('Home');
    if (pendingToast) showToast(pendingToast);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgBase }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.backRow}>
          <Ionicons name="chevron-back" size={16} color={theme.colors.textMid} />
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textMid }}>
            Home
          </Text>
        </Pressable>

        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
          {sleepStep === 'done' ? 'Did you achieve your goals?' : 'How did last night go?'}
        </Text>

        {sleepStep === 'ask' && (
          <Card>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, marginBottom: 14 }}>
              Did you sleep from {formatTime12h(today.plannedBedtime!)} to {formatTime12h(today.plannedWakeTime!)}?
            </Text>
            <View style={styles.btnRow}>
              <Button label="No, let me adjust" variant="ghost" onPress={handleSleepNo} />
              <Button label="Yes, that's right" variant="primary" onPress={handleSleepYes} />
            </View>
          </Card>
        )}

        {sleepStep === 'reportTimes' && (
          <Card>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, marginBottom: 14 }}>
              What time did you actually sleep and wake up?
            </Text>
            <View style={styles.windowRow}>
              <TimeField label="Bedtime" time={reportBedtime} onChange={setReportBedtime} />
              <TimeField label="Wake-up" time={reportWakeTime} onChange={setReportWakeTime} />
            </View>
            <View style={styles.btnRow}>
              <Button
                label="Back"
                variant="ghost"
                onPress={() => setSleepStep('ask')}
              />
              <Button label="Continue" variant="primary" onPress={handleReportContinue} />
            </View>
          </Card>
        )}

        {sleepStep === 'done' && (
          <>
            {sleepFeedback && (
              <Text
                style={{
                  fontFamily: theme.fonts.displayItalic,
                  fontSize: 13.5 * theme.textScale,
                  color: theme.colors.textMid,
                  marginBottom: 14,
                }}
              >
                {sleepFeedback}
              </Text>
            )}
            <Card>
              {today.goals.map((g, i) => (
                <View
                  key={g.goalId}
                  style={[styles.row, i < today.goals.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, flex: 1, paddingRight: 10 }}>
                    {g.label}
                  </Text>
                  <PillToggle
                    value={answers[g.goalId] ?? null}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [g.goalId]: v }))}
                  />
                </View>
              ))}
            </Card>

            <View style={styles.btnRow}>
              <Button label="Cancel" variant="ghost" onPress={() => navigation.navigate('Home')} />
              <Button label="Confirm" variant="primary" disabled={!allAnswered} onPress={handleConfirm} />
            </View>
          </>
        )}
      </ScrollView>

      {celebration && <AchievementCelebrationModal unlocks={celebration} onClose={handleCelebrationClose} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  windowRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
