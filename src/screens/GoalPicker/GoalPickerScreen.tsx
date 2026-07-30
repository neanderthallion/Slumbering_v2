import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { RootStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GoalListItem } from '../../components/GoalListItem';
import { EditableGoalListItem } from '../../components/EditableGoalListItem';
import { DisclaimerDialog } from '../../components/DisclaimerDialog';
import { GOAL_CATEGORIES, looksLikeUnhealthyBedtime } from '../../data/suggestedGoals';
import { GoalCategory, NightGoal, SuggestedGoalCategory } from '../../types/models';
import { makeId } from '../../utils/id';
import { todayKey } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GoalPicker'>;
type SelectedGoal = { goalId: string; label: string; category: GoalCategory };

const MAX_GOALS = 2;

export function GoalPickerScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { records, settings, updateSettings } = useAppData();
  const mode: 'create' | 'edit' = route.params?.mode ?? 'create';

  const [category, setCategory] = useState<SuggestedGoalCategory>('bedtime');
  const [selected, setSelected] = useState<SelectedGoal[]>(() => {
    if (mode === 'edit') {
      const today = records[todayKey()];
      if (today) {
        return today.goals.map((g) => ({ goalId: g.goalId, label: g.label, category: g.category }));
      }
    }
    return [];
  });
  const [customText, setCustomText] = useState('');
  const [disclaimerFor, setDisclaimerFor] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const maxReached = selected.length >= MAX_GOALS;
  const suggestions = settings.suggestedGoals[category];

  function isSelected(label: string) {
    return selected.some((s) => s.label === label);
  }

  function toggleSuggested(label: string) {
    if (isSelected(label)) {
      setSelected((prev) => prev.filter((s) => s.label !== label));
      if (disclaimerFor === label) setDisclaimerFor(null);
      return;
    }
    if (maxReached) return;
    setSelected((prev) => [...prev, { goalId: makeId('goal'), label, category }]);
    if (looksLikeUnhealthyBedtime(category, label)) setDisclaimerFor(label);
  }

  function addCustomGoal() {
    const text = customText.trim();
    if (!text || maxReached) return;
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
    updateSettings((prev) => ({
      ...prev,
      suggestedGoals: {
        ...prev.suggestedGoals,
        [category]: prev.suggestedGoals[category].map((l, i) => (i === index ? newLabel : l)),
      },
    }));

    // Editing auto-selects the goal (replacing it in-place if it was already selected).
    setSelected((prev) => {
      const alreadySelected = prev.some((s) => s.label === originalLabel);
      if (alreadySelected) {
        return prev.map((s) => (s.label === originalLabel ? { ...s, label: newLabel } : s));
      }
      if (prev.length >= MAX_GOALS) return prev;
      return [...prev, { goalId: makeId('goal'), label: newLabel, category }];
    });

    if (looksLikeUnhealthyBedtime(category, newLabel)) setDisclaimerFor(newLabel);
  }

  const customSelectedForCategory = selected.filter(
    (s) => s.category === category && !suggestions.includes(s.label)
  );

  function handleConfirmGoals() {
    if (selected.length === 0) return;
    const goals: NightGoal[] = selected.map((s) => ({
      goalId: s.goalId,
      label: s.label,
      category: s.category,
      achieved: null,
    }));
    navigation.navigate('TonightConfirmation', { goals });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgBase }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.backRow}>
          <Ionicons name="chevron-back" size={16} color={theme.colors.textMid} />
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13 * theme.textScale, color: theme.colors.textMid }}>
            Home
          </Text>
        </Pressable>

        <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 24 * theme.textScale, color: theme.colors.textHi, marginBottom: 6 }}>
          Pick your goals for tonight
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12 * theme.textScale, color: theme.colors.textLow, marginBottom: 16 }}>
          {selected.length} of {MAX_GOALS} selected
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
                disabled={!checked && maxReached && editingIndex !== i}
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
            <GoalListItem
              key={s.goalId}
              label={s.label}
              checked
              onPress={() => removeGoalByLabel(s.label)}
              isLast={i === arr.length - 1}
            />
          ))}
          <View style={styles.addRow}>
            <TextInput
              value={customText}
              onChangeText={setCustomText}
              placeholder="Add your own..."
              placeholderTextColor={theme.colors.textLow}
              editable={!maxReached}
              style={[
                styles.input,
                { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi },
              ]}
            />
            <Pressable
              onPress={addCustomGoal}
              disabled={maxReached || !customText.trim()}
              style={[styles.addBtn, { borderColor: theme.colors.hairline, opacity: maxReached || !customText.trim() ? 0.5 : 1 }]}
            >
              <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.textHi }}>Add</Text>
            </Pressable>
          </View>
        </Card>

        {disclaimerFor && (
          <DisclaimerDialog
            message="Sleep experts generally recommend an earlier bedtime. Would you like to continue with this goal?"
            onContinue={() => setDisclaimerFor(null)}
            onChangeGoal={() => removeGoalByLabel(disclaimerFor)}
          />
        )}

        <View style={styles.btnRow}>
          <Button label="Cancel" variant="ghost" onPress={() => navigation.navigate('Home')} />
          <Button label="Confirm goals" variant="primary" disabled={selected.length === 0} onPress={handleConfirmGoals} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 13.5 },
  addBtn: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
