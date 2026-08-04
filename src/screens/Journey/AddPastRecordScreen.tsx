import React, { useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { createNightRecord } from '../../data/nightRecords';
import { GoalCategory, NightGoal, SuggestedGoalCategory } from '../../types/models';
import { makeId } from '../../utils/id';
import { addDays, formatFriendlyDate, todayKey, toDDMMYY, parseDDMMYY } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddPastRecord'>;

export function AddPastRecordScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { upsertRecord, settings } = useAppData();
  const { showToast } = useToast();

  const yesterday = addDays(todayKey(), -1);
  const [date, setDate] = useState(yesterday);
  const [editingDate, setEditingDate] = useState(false);
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yy, setYy] = useState('');
  const mmRef = useRef<TextInput>(null);
  const yyRef = useRef<TextInput>(null);
  const [category, setCategory] = useState<SuggestedGoalCategory>('bedtime');
  const [selected, setSelected] = useState<{ goalId: string; label: string; category: GoalCategory; achieved: boolean | null }[]>([]);

  function toggleGoal(label: string) {
    const existing = selected.find((s) => s.label === label);
    if (existing) {
      setSelected((prev) => prev.filter((s) => s.label !== label));
      return;
    }
    setSelected((prev) => [...prev, { goalId: makeId('goal'), label, category, achieved: null }]);
  }

  function setAchieved(goalId: string, value: boolean) {
    setSelected((prev) => prev.map((s) => (s.goalId === goalId ? { ...s, achieved: value } : s)));
  }

  const canSave = selected.length > 0 && selected.every((s) => s.achieved !== null);

  function openDateEditor() {
    const parts = toDDMMYY(date);
    setDd(parts.dd);
    setMm(parts.mm);
    setYy(parts.yy);
    setEditingDate(true);
  }

  function confirmDate() {
    const parsed = parseDDMMYY(dd, mm, yy);
    if (!parsed) {
      showToast('Enter a valid date (dd/mm/yy)');
      return;
    }
    if (parsed > yesterday) {
      showToast('Pick a date before today');
      return;
    }
    setDate(parsed);
    setEditingDate(false);
  }

  function handleSave() {
    if (!canSave) return;
    const goals: NightGoal[] = selected.map((s) => ({
      goalId: s.goalId,
      label: s.label,
      category: s.category,
      achieved: s.achieved,
    }));
    upsertRecord({
      ...createNightRecord(date, goals, 'backfilled'),
      checkInCompletedAt: new Date().toISOString(),
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
          {editingDate ? (
            <View>
              <View style={styles.dateInputRow}>
                <TextInput
                  value={dd}
                  onChangeText={(t) => {
                    const v = t.replace(/[^0-9]/g, '').slice(0, 2);
                    setDd(v);
                    if (v.length === 2) mmRef.current?.focus();
                  }}
                  placeholder="DD"
                  placeholderTextColor={theme.colors.textLow}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={[styles.dateInput, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
                />
                <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 18, color: theme.colors.textLow }}>/</Text>
                <TextInput
                  ref={mmRef}
                  value={mm}
                  onChangeText={(t) => {
                    const v = t.replace(/[^0-9]/g, '').slice(0, 2);
                    setMm(v);
                    if (v.length === 2) yyRef.current?.focus();
                  }}
                  placeholder="MM"
                  placeholderTextColor={theme.colors.textLow}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={[styles.dateInput, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
                />
                <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 18, color: theme.colors.textLow }}>/</Text>
                <TextInput
                  ref={yyRef}
                  value={yy}
                  onChangeText={(t) => setYy(t.replace(/[^0-9]/g, '').slice(0, 2))}
                  placeholder="YY"
                  placeholderTextColor={theme.colors.textLow}
                  keyboardType="number-pad"
                  maxLength={2}
                  onSubmitEditing={confirmDate}
                  style={[styles.dateInput, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
                />
              </View>
              <View style={styles.btnRow}>
                <Button label="Cancel" variant="ghost" onPress={() => setEditingDate(false)} />
                <Button label="Set date" variant="primary" onPress={confirmDate} />
              </View>
            </View>
          ) : (
            <Pressable onPress={openDateEditor}>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 18, color: theme.colors.textHi }}>
                {formatFriendlyDate(date)}
              </Text>
            </Pressable>
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
  dateInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateInput: {
    width: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 18,
  },
});
