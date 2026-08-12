import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { useToast } from '../../components/ToastProvider';
import { RootStackParamList } from '../../app/navigation.types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { BackRow } from '../../components/BackRow';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Pill } from '../../components/Pill';
import { TimeField } from '../../components/TimeField';
import { CelebrationModal } from '../../features/achievements/components/CelebrationModal';
import { NightRecord, SleepConfirmation } from '../../types/domain';
import { getMoonPhase } from '../../features/journey/logic/journeyEntries';
import { findOpenRecord } from '../../features/journey/logic/shared';
import { detectNewlyUnlocked, AchievementUnlock } from '../../features/achievements/logic/celebrationGating';
import { classifySleepSchedule, pickSleepTimeFeedback } from '../../features/checkin/logic/deltaClassification';
import { pickCheckInToast } from '../../features/checkin/logic/checkInToast';
import { initialSleepStep, SleepStep } from '../../features/checkin/logic/checkInGate';
import { formatTime12h } from '../../lib/dateMath';
import { CHECKIN_COPY } from './copy';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;

export function CheckInScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const records = useRecordsStore((s) => s.records);
  const upsertRecord = useRecordsStore((s) => s.upsertRecord);
  const celebratedAchievementIds = useSettingsStore((s) => s.celebratedAchievementIds);
  const addCelebratedAchievementIds = useSettingsStore((s) => s.addCelebratedAchievementIds);
  const { showToast } = useToast();
  const today = findOpenRecord(records);

  const [answers, setAnswers] = useState<Record<string, boolean | null>>(() => {
    const init: Record<string, boolean | null> = {};
    today?.goals.forEach((g) => (init[g.goalId] = g.achieved));
    return init;
  });

  const hasPlannedSchedule = !!today?.plannedBedtime && !!today?.plannedWakeTime;
  const [sleepStep, setSleepStep] = useState<SleepStep>(initialSleepStep(hasPlannedSchedule, today?.sleepConfirmation ?? null));
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
  const bedtime = useSettingsStore((s) => s.bedtime);
  const wakeTime = useSettingsStore((s) => s.wakeTime);
  const [reportBedtime, setReportBedtime] = useState(today?.plannedBedtime ?? bedtime);
  const [reportWakeTime, setReportWakeTime] = useState(today?.plannedWakeTime ?? wakeTime);

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
    if (!today) return;
    const comparison = classifySleepSchedule(today.plannedBedtime!, today.plannedWakeTime!, reportBedtime, reportWakeTime);
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

    const newlyUnlocked = detectNewlyUnlocked(nextRecords, celebratedAchievementIds, updated.date);
    const toastText = pickCheckInToast(getMoonPhase(updated), updated.date);

    if (newlyUnlocked.length > 0) {
      addCelebratedAchievementIds(newlyUnlocked.map((u) => u.id));
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
    <ScreenContainer overlay={celebration && <CelebrationModal unlocks={celebration} onClose={handleCelebrationClose} />}>
      <BackRow />

      <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
        {sleepStep === 'done' ? CHECKIN_COPY.headlineGoals : CHECKIN_COPY.headlineAskSleep}
      </Text>

      {sleepStep === 'ask' && (
        <Card>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, marginBottom: 14 }}>
            {CHECKIN_COPY.askedSleptAsPlanned(formatTime12h(today.plannedBedtime!), formatTime12h(today.plannedWakeTime!))}
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
            {CHECKIN_COPY.reportActualTimes}
          </Text>
          <View style={styles.windowRow}>
            <TimeField label="Bedtime" time={reportBedtime} onChange={setReportBedtime} />
            <TimeField label="Wake-up" time={reportWakeTime} onChange={setReportWakeTime} />
          </View>
          <View style={styles.btnRow}>
            <Button label="Back" variant="ghost" onPress={() => setSleepStep('ask')} />
            <Button label="Continue" variant="primary" onPress={handleReportContinue} />
          </View>
        </Card>
      )}

      {sleepStep === 'done' && (
        <>
          {sleepFeedback && (
            <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid, marginBottom: 14 }}>
              {sleepFeedback}
            </Text>
          )}
          <Card>
            {today.goals.map((g, i) => (
              <View key={g.goalId} style={[styles.row, i < today.goals.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, flex: 1, paddingRight: 10 }}>
                  {g.label}
                </Text>
                <Pill value={answers[g.goalId] ?? null} onChange={(v) => setAnswers((prev) => ({ ...prev, [g.goalId]: v }))} />
              </View>
            ))}
          </Card>

          <View style={styles.btnRow}>
            <Button label="Cancel" variant="ghost" onPress={() => navigation.navigate('Home')} />
            <Button label="Confirm" variant="primary" disabled={!allAnswered} onPress={handleConfirm} />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  windowRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
