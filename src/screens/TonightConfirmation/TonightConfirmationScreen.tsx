import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { createNightRecord } from '../../features/goals/logic/nightGoals';
import { todayKey } from '../../lib/dateMath';

type Nav = NativeStackNavigationProp<RootStackParamList, 'TonightConfirmation'>;
type Rt = { key: string; name: string; params: RootStackParamList['TonightConfirmation'] };

export function TonightConfirmationScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const bedtime = useSettingsStore((s) => s.bedtime);
  const wakeTime = useSettingsStore((s) => s.wakeTime);
  const records = useRecordsStore((s) => s.records);
  const upsertRecord = useRecordsStore((s) => s.upsertRecord);
  const { showToast } = useToast();
  const goals = route.params.goals;
  const targetDate = route.params.date ?? todayKey();

  function handleConfirm() {
    // Editing already-set goals for tonight must not re-snapshot the plan
    // from whatever the Bedtime Schedule currently says -- the "did you
    // sleep as planned?" question next morning should ask about the plan
    // that was true when goals were first set, not one silently swapped in
    // by a later schedule edit.
    const existing = records[targetDate];
    const plannedSchedule =
      existing?.plannedBedtime && existing?.plannedWakeTime
        ? { bedtime: existing.plannedBedtime, wakeTime: existing.plannedWakeTime }
        : { bedtime, wakeTime };
    const record = createNightRecord(targetDate, goals, 'normal', plannedSchedule);
    upsertRecord(record);
    navigation.navigate('Home');
    showToast('Goals saved for tonight');
  }

  return (
    <ScreenContainer>
      <BackRow />

      <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
        {"Tonight's goals are"}
      </Text>

      <Card>
        {goals.map((g, i) => (
          <View key={g.goalId} style={[styles.goalRow, i < goals.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
            <View style={[styles.checkDot, { backgroundColor: theme.colors.accent }]}>
              <Ionicons name="checkmark" size={12} color={theme.colors.accentContrastText} />
            </View>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5 * theme.textScale, color: theme.colors.textHi, flex: 1 }}>{g.label}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.btnRow}>
        <Button label="Edit goals" variant="ghost" onPress={() => navigation.goBack()} />
        <Button label="Confirm" variant="primary" onPress={handleConfirm} />
      </View>

      <Card style={{ marginTop: 18 }}>
        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 15 * theme.textScale, color: theme.colors.textHi }}>
          {"Rest well tonight. We'll check in tomorrow."}
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkDot: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
