import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { useToast, ToastOptions } from '../../components/ToastProvider';
import { RootStackParamList } from '../../app/navigation.types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { BackRow } from '../../components/BackRow';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Pill } from '../../components/Pill';
import { TimeField } from '../../components/TimeField';
import { CelebrationModal } from '../../features/achievements/components/CelebrationModal';
import { NightRecord } from '../../types/domain';
import { getMoonPhase } from '../../features/journey/logic/journeyEntries';
import { findOpenRecord } from '../../features/journey/logic/shared';
import { detectNewlyUnlocked, AchievementUnlock } from '../../features/achievements/logic/celebrationGating';
import { classifySleepSchedule, pickSleepTimeFeedback, deriveSleepConfirmation } from '../../features/checkin/logic/deltaClassification';
import { pickCheckInToast, isFullNightPhase } from '../../features/checkin/logic/checkInToast';
import { shouldShowSleepPickers } from '../../features/checkin/logic/checkInGate';
import { CHECKIN_COPY } from './copy';
import { COPY } from '../../copy';

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
  const showsSleepPickers = shouldShowSleepPickers(hasPlannedSchedule, today?.sleepConfirmation ?? null);
  const bedtime = useSettingsStore((s) => s.bedtime);
  const wakeTime = useSettingsStore((s) => s.wakeTime);
  const [reportBedtime, setReportBedtime] = useState(today?.plannedBedtime ?? bedtime);
  const [reportWakeTime, setReportWakeTime] = useState(today?.plannedWakeTime ?? wakeTime);

  const [celebration, setCelebration] = useState<AchievementUnlock[] | null>(null);
  const [pendingToast, setPendingToast] = useState<{ text: string; options?: ToastOptions } | null>(null);

  if (!today && !celebration) {
    navigation.navigate('Home');
    return null;
  }

  const allAnswered = !!today && today.goals.every((g) => answers[g.goalId] !== null && answers[g.goalId] !== undefined);

  const sleepComparison =
    today && showsSleepPickers && today.plannedBedtime && today.plannedWakeTime
      ? classifySleepSchedule(today.plannedBedtime, today.plannedWakeTime, reportBedtime, reportWakeTime)
      : null;
  const sleepFeedback = sleepComparison && today ? pickSleepTimeFeedback(sleepComparison, today.date) : null;

  function handleConfirm() {
    if (!allAnswered || !today) return;

    const sleepConfirmation = showsSleepPickers
      ? deriveSleepConfirmation(today.plannedBedtime!, today.plannedWakeTime!, reportBedtime, reportWakeTime)
      : today.sleepConfirmation;
    const actualBedtime = showsSleepPickers ? reportBedtime : today.actualBedtime;
    const actualWakeTime = showsSleepPickers ? reportWakeTime : today.actualWakeTime;

    const updated: NightRecord = {
      ...today,
      goals: today.goals.map((g) => ({ ...g, achieved: answers[g.goalId] ?? null })),
      checkInCompletedAt: new Date().toISOString(),
      sleepConfirmation,
      actualBedtime,
      actualWakeTime,
    };
    upsertRecord(updated);
    const nextRecords = { ...records, [updated.date]: updated };

    const newlyUnlocked = detectNewlyUnlocked(nextRecords, celebratedAchievementIds, updated.date);
    const phase = getMoonPhase(updated);
    const toast: { text: string; options?: ToastOptions } = {
      text: pickCheckInToast(phase, updated.date),
      // A fully-achieved night gets a celebratory toast the user can sit with:
      // top of screen, dismiss with the X, or auto-gone after 5s.
      options: isFullNightPhase(phase) ? { dismissible: true, durationMs: 5000 } : undefined,
    };

    if (newlyUnlocked.length > 0) {
      addCelebratedAchievementIds(newlyUnlocked.map((u) => u.id));
      setCelebration(newlyUnlocked);
      setPendingToast(toast);
    } else {
      navigation.navigate('Home');
      showToast(toast.text, toast.options);
    }
  }

  function handleCelebrationClose() {
    setCelebration(null);
    navigation.navigate('Home');
    if (pendingToast) showToast(pendingToast.text, pendingToast.options);
  }

  const overlay = celebration && <CelebrationModal unlocks={celebration} onClose={handleCelebrationClose} />;

  // `today` becomes undefined the instant this record is marked checked-in (it's no longer
  // "open"), which lands in the same batched re-render as `celebration` being set -- so once a
  // celebration is pending there's nothing left to check in, just the overlay to show.
  if (!today) {
    return <ScreenContainer overlay={overlay}>{null}</ScreenContainer>;
  }

  return (
    <ScreenContainer overlay={overlay}>
      <BackRow />

      <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
        {showsSleepPickers ? CHECKIN_COPY.headlineSleep : CHECKIN_COPY.headlineGoalsOnly}
      </Text>

      {showsSleepPickers && (
        <Card>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, marginBottom: 14 }}>
            {CHECKIN_COPY.reportActualTimes}
          </Text>
          <View style={styles.windowRow}>
            <TimeField label={COPY.checkIn.bedtimeField} time={reportBedtime} onChange={setReportBedtime} />
            <TimeField label={COPY.checkIn.wakeField} time={reportWakeTime} onChange={setReportWakeTime} />
          </View>
          {sleepFeedback && (
            <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 13.5 * theme.textScale, color: theme.colors.textMid, marginTop: 12 }}>
              {sleepFeedback}
            </Text>
          )}
        </Card>
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
        <Button label={COPY.common.cancel} variant="ghost" onPress={() => navigation.navigate('Home')} />
        <Button label={COPY.common.confirm} variant="primary" disabled={!allAnswered} onPress={handleConfirm} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  windowRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
