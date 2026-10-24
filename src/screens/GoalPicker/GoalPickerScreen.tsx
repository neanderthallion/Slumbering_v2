import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { RootStackParamList } from '../../app/navigation.types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { BackRow } from '../../components/BackRow';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GoalListItem } from '../../features/goals/components/GoalListItem';
import { EditableGoalListItem } from '../../features/goals/components/EditableGoalListItem';
import { DisclaimerDialog } from '../../components/DisclaimerDialog';
import { GOAL_CATEGORIES } from '../../features/goals/logic/suggestedGoals';
import { looksLikeUnhealthyBedtime } from '../../features/goals/logic/unhealthyBedtime';
import { GoalCategory, NightGoal, SuggestedGoalCategory } from '../../types/domain';
import { makeId } from '../../lib/id';
import { todayKey } from '../../lib/dateMath';
import { GOAL_PICKER_COPY } from './copy';
import { COPY, fmt } from '../../copy';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GoalPicker'>;
type SelectedGoal = { goalId: string; label: string; category: GoalCategory };

export function GoalPickerScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const records = useRecordsStore((s) => s.records);
  const suggestedGoals = useSettingsStore((s) => s.suggestedGoals);
  const setSuggestedGoals = useSettingsStore((s) => s.setSuggestedGoals);
  const mode: 'create' | 'edit' = route.params?.mode ?? 'create';
  const targetDate: string = route.params?.date ?? todayKey();

  const [category, setCategory] = useState<SuggestedGoalCategory>('bedtime');
  const [selected, setSelected] = useState<SelectedGoal[]>(() => {
    if (mode === 'edit') {
      const existing = records[targetDate];
      if (existing) {
        return existing.goals.map((g) => ({ goalId: g.goalId, label: g.label, category: g.category }));
      }
    }
    return [];
  });
  const [customText, setCustomText] = useState('');
  const [disclaimerFor, setDisclaimerFor] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const suggestions = suggestedGoals[category];

  function isSelected(label: string) {
    return selected.some((s) => s.label === label);
  }

  function toggleSuggested(label: string) {
    if (isSelected(label)) {
      setSelected((prev) => prev.filter((s) => s.label !== label));
      if (disclaimerFor === label) setDisclaimerFor(null);
      return;
    }
    setSelected((prev) => [...prev, { goalId: makeId('goal'), label, category }]);
    if (looksLikeUnhealthyBedtime(category, label)) setDisclaimerFor(label);
  }

  function addCustomGoal() {
    const text = customText.trim();
    if (!text) return;
    setSelected((prev) => [...prev, { goalId: makeId('goal'), label: text, category }]);
    setCustomText('');
    if (looksLikeUnhealthyBedtime(category, text)) setDisclaimerFor(text);
  }

  function removeGoalByLabel(label: string) {
    setSelected((prev) => prev.filter((s) => s.label !== label));
    setDisclaimerFor(null);
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditDraft(suggestions[index]);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditDraft('');
  }

  function saveEdit(index: number) {
    const originalLabel = suggestions[index];
    const newLabel = editDraft.trim();
    setEditingIndex(null);
    setEditDraft('');
    if (!newLabel || newLabel === originalLabel) return;

    // Permanently update the suggestion in the goal bank going forward.
    setSuggestedGoals(
      category,
      suggestions.map((l, i) => (i === index ? newLabel : l))
    );

    // Editing auto-selects the goal (replacing it in-place if it was already selected).
    setSelected((prev) => {
      const alreadySelected = prev.some((s) => s.label === originalLabel);
      if (alreadySelected) {
        return prev.map((s) => (s.label === originalLabel ? { ...s, label: newLabel } : s));
      }
      return [...prev, { goalId: makeId('goal'), label: newLabel, category }];
    });

    if (looksLikeUnhealthyBedtime(category, newLabel)) setDisclaimerFor(newLabel);
  }

  const customSelectedForCategory = selected.filter((s) => s.category === category && !suggestions.includes(s.label));

  function handleConfirmGoals() {
    if (selected.length === 0) return;
    const goals: NightGoal[] = selected.map((s) => ({
      goalId: s.goalId,
      label: s.label,
      category: s.category,
      achieved: null,
    }));
    navigation.navigate('TonightConfirmation', { goals, date: targetDate });
  }

  return (
    <ScreenContainer keyboardShouldPersistTaps="handled">
      <BackRow />

      <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 6 }}>
        {GOAL_PICKER_COPY.headline}
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5 * theme.textScale, color: theme.colors.textMid, marginBottom: 10 }}>
        {GOAL_PICKER_COPY.tip}
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12 * theme.textScale, color: theme.colors.textLow, marginBottom: 16 }}>
        {fmt(COPY.goalPicker.selectedCount, { count: selected.length })}
      </Text>

      <SegmentedTabs
        tabs={GOAL_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
        activeKey={category}
        onChange={(key) => {
          cancelEdit();
          setCategory(key as SuggestedGoalCategory);
        }}
      />

      <Card>
        {suggestions.map((label, i) => {
          const checked = isSelected(label);
          return (
            <EditableGoalListItem
              key={i}
              label={label}
              checked={checked}
              isEditing={editingIndex === i}
              editValue={editDraft}
              onToggle={() => toggleSuggested(label)}
              onStartEdit={() => startEdit(i)}
              onChangeEditValue={setEditDraft}
              onSaveEdit={() => saveEdit(i)}
              onCancelEdit={cancelEdit}
              isLast={i === suggestions.length - 1 && customSelectedForCategory.length === 0}
            />
          );
        })}
        {customSelectedForCategory.map((s, i, arr) => (
          <GoalListItem key={s.goalId} label={s.label} checked onPress={() => removeGoalByLabel(s.label)} isLast={i === arr.length - 1} />
        ))}
        <View style={styles.addRow}>
          <TextInput
            value={customText}
            onChangeText={setCustomText}
            placeholder={COPY.goalPicker.addYourOwn}
            placeholderTextColor={theme.colors.textLow}
            style={[styles.input, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
          />
          <Pressable
            onPress={addCustomGoal}
            disabled={!customText.trim()}
            style={[styles.addBtn, { borderColor: theme.colors.hairline, opacity: !customText.trim() ? 0.5 : 1 }]}
          >
            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.textHi }}>{COPY.goalPicker.add}</Text>
          </Pressable>
        </View>
      </Card>

      {disclaimerFor && (
        <DisclaimerDialog
          message={GOAL_PICKER_COPY.unhealthyBedtimeDisclaimer}
          onContinue={() => setDisclaimerFor(null)}
          onChangeGoal={() => removeGoalByLabel(disclaimerFor)}
        />
      )}

      <View style={styles.btnRow}>
        <Button label={COPY.common.cancel} variant="ghost" onPress={() => navigation.navigate('Home')} />
        <Button label={COPY.goalPicker.confirmGoals} variant="primary" disabled={selected.length === 0} onPress={handleConfirmGoals} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: { flex: 1, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 13, fontSize: 13.5 },
  addBtn: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
