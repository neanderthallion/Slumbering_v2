import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useToast } from '../../components/ToastProvider';
import { RootStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GoalListItem } from '../../components/GoalListItem';
import { PillToggle } from '../../components/PillToggle';
import { GOAL_CATEGORIES } from '../../data/suggestedGoals';
import { GoalCategory, NightGoal, SuggestedGoalCategory } from '../../types/models';
import { makeId } from '../../utils/id';
import { addDays, formatFriendlyDate, todayKey, toDateKey } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddPastRecord'>;
const MAX_GOALS = 2;

export function AddPastRecordScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { upsertRecord, settings } = useAppData();
  const { showToast } = useToast();

  const [date, setDate] = useState(addDays(todayKey(), -1));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [category, setCategory] = useState<SuggestedGoalCategory>('bedtime');
  const [selected, setSelected] = useState<{ goalId: string; label: string; category: GoalCategory; achieved: boolean | null }[]>([]);

  const maxReached = selected.length >= MAX_GOALS;

  function toggleGoal(label: string) {
    const existing = selected.find((s) => s.label === label);
    if (existing) {
      setSelected((prev) => prev.filter((s) => s.label !== label));
      return;
    }
    if (maxReached) return;
    setSelected((prev) => [...prev, { goalId: makeId('goal'), label, category, achieved: null }]);
  }

  function setAchieved(goalId: string, value: boolean) {
    setSelected((prev) => prev.map((s) => (s.goalId === goalId ? { ...s, achieved: value } : s)));
  }

  const canSave = selected.length > 0 && selected.every((s) => s.achieved !== null);

  function handleSave() {
    if (!canSave) return;
    const goals: NightGoal[] = selected.map((s) => ({
      goalId: s.goalId,
      label: s.label,
      category: s.category,
      achieved: s.achieved,
    }));
    upsertRecord({
      date,
      goals,
      goalsSetAt: new Date().toISOString(),
      checkInCompletedAt: new Date().toISOString(),
      source: 'backfilled',
    });
    navigation.goBack();
    showToast('Past record added');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgBase }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 22 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
          Add a past record
        </Text>

        <Card>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textLow, marginBottom: 6 }}>
            Date
          </Text>
          <Pressable onPress={() => setPickerOpen(true)}>
            <Text style={{ fontFamily: theme.fonts.display, fontSize: 18, color: theme.colors.textHi }}>
              {formatFriendlyDate(date)}
            </Text>
          </Pressable>
          {pickerOpen && (
            <DateTimePicker
              value={new Date(date + 'T00:00:00')}
              mode="date"
              maximumDate={new Date(addDays(todayKey(), -1) + 'T00:00:00')}
              onChange={(event, selectedDate) => {
                setPickerOpen(Platform.OS === 'ios');
                if (event.type === 'set' && selectedDate) setDate(toDateKey(selectedDate));
              }}
            />
          )}
        </Card>

        <SegmentedTabs
          tabs={GOAL_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
          activeKey={category}
          onChange={(key) => setCategory(key as SuggestedGoalCategory)}
        />

        <Card>
          {settings.suggestedGoals[category].map((label, i, arr) => (
            <GoalListItem
              key={label}
              label={label}
              checked={selected.some((s) => s.label === label)}
              disabled={!selected.some((s) => s.label === label) && maxReached}
              onPress={() => toggleGoal(label)}
              isLast={i === arr.length - 1}
            />
          ))}
        </Card>

        {selected.length > 0 && (
          <Card>
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textLow, marginBottom: 10 }}>
              Did you achieve these?
            </Text>
            {selected.map((s, i) => (
              <View key={s.goalId} style={[styles.achieveRow, i < selected.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1, paddingRight: 10 }}>
                  {s.label}
                </Text>
                <PillToggle value={s.achieved} onChange={(v) => setAchieved(s.goalId, v)} />
              </View>
            ))}
          </Card>
        )}

        <View style={styles.btnRow}>
          <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
          <Button label="Save" variant="primary" disabled={!canSave} onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  achieveRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
