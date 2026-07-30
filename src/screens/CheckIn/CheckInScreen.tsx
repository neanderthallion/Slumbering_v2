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
import { todayKey } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;

export function CheckInScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { records, upsertRecord } = useAppData();
  const { showToast } = useToast();
  const today = records[todayKey()];

  const [answers, setAnswers] = useState<Record<string, boolean | null>>(() => {
    const init: Record<string, boolean | null> = {};
    today?.goals.forEach((g) => (init[g.goalId] = g.achieved));
    return init;
  });

  if (!today) {
    navigation.navigate('Home');
    return null;
  }

  const allAnswered = today.goals.every((g) => answers[g.goalId] !== null && answers[g.goalId] !== undefined);

  function handleConfirm() {
    if (!allAnswered || !today) return;
    const updated = {
      ...today,
      goals: today.goals.map((g) => ({ ...g, achieved: answers[g.goalId] ?? null })),
      checkInCompletedAt: new Date().toISOString(),
    };
    upsertRecord(updated);
    navigation.navigate('Home');
    showToast('Check-in saved');
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
          Did you achieve your goals?
        </Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
