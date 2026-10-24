import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useRecordsStore } from '../../store/recordsStore';
import { useToast } from '../../components/ToastProvider';
import { RootStackParamList } from '../../app/navigation.types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GoalListItem } from '../../features/goals/components/GoalListItem';
import { EditableGoalListItem } from '../../features/goals/components/EditableGoalListItem';
import { Pill } from '../../components/Pill';
import { Toggle } from '../../components/Toggle';
import { TimeField } from '../../components/TimeField';
import { GOAL_CATEGORIES } from '../../features/goals/logic/suggestedGoals';
import { createNightRecord } from '../../features/goals/logic/nightGoals';
import { GoalCategory, NightGoal, SuggestedGoalCategory } from '../../types/domain';
import { makeId } from '../../lib/id';
import { addDays, formatFriendlyDate, todayKey, toDDMMYY, parseDDMMYY } from '../../lib/dateMath';
import { COPY } from '../../copy';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddPastRecord'>;
type Rt = { key: string; name: string; params: RootStackParamList['AddPastRecord'] };

export function AddPastRecordScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const records = useRecordsStore((s) => s.records);
  const upsertRecord = useRecordsStore((s) => s.upsertRecord);
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);
  const suggestedGoals = useSettingsStore((s) => s.suggestedGoals);
  const defaultBedtime = useSettingsStore((s) => s.bedtime);
  const defaultWakeTime = useSettingsStore((s) => s.wakeTime);
  const { showToast } = useToast();

  // Editing an existing night (opened from Journey history) prefills from
  // that record; otherwise this is the normal "add a past record" flow.
  const existingRecord = route.params?.date ? records[route.params.date] : undefined;
  const isEditMode = !!existingRecord;

  const yesterday = addDays(todayKey(), -1);
  // Normally a "past" record can't be dated later than yesterday, but when
  // editing an existing record that's already dated today (e.g. fixing a
  // typo'd achievement right after check-in), leaving its date unchanged
  // must not be blocked by that same rule.
  const maxDate = existingRecord && existingRecord.date > yesterday ? existingRecord.date : yesterday;
  const [date, setDate] = useState(existingRecord?.date ?? yesterday);
  const [editingDate, setEditingDate] = useState(false);
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yy, setYy] = useState('');
  const mmRef = useRef<TextInput>(null);
  const yyRef = useRef<TextInput>(null);
  const [category, setCategory] = useState<SuggestedGoalCategory>(() => {
    const firstCategory = existingRecord?.goals[0]?.category;
    return firstCategory && firstCategory !== 'custom' ? firstCategory : 'bedtime';
  });
  const [selected, setSelected] = useState<{ goalId: string; label: string; category: GoalCategory; achieved: boolean | null }[]>(
    () => existingRecord?.goals.map((g) => ({ goalId: g.goalId, label: g.label, category: g.category, achieved: g.achieved })) ?? []
  );

  // Editing/adding goals here never touches settings.suggestedGoals -- changes
  // (relabeled suggestions, custom additions) only ever apply to this one
  // night's record, so suggestions are edited on a local copy.
  const [localSuggestedGoals, setLocalSuggestedGoals] = useState(() => ({
    bedtime: [...suggestedGoals.bedtime],
    windDown: [...suggestedGoals.windDown],
    relaxation: [...suggestedGoals.relaxation],
  }));
  const [customText, setCustomText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');

  // Goals and sleep schedule are independently optional -- a past record can
  // carry either one, or both, so each gets its own toggle and only one
  // Save confirms the whole thing. In edit mode both default to whatever the
  // record actually has recorded, so opening an existing night for editing
  // never hides (and then silently discards) data that's genuinely there.
  const [goalsIncluded, setGoalsIncluded] = useState(() => !existingRecord || existingRecord.goals.length > 0);

  // A record confirmed "as planned" (the normal check-in flow's default)
  // stores its times in plannedBedtime/plannedWakeTime, not
  // actualBedtime/actualWakeTime -- so the toggle and prefill must key off
  // sleepConfirmation being set at all, not off actualBedtime specifically,
  // or a previously-confirmed "as planned" night would look empty here.
  const recordedBedtime =
    existingRecord?.sleepConfirmation === 'reportedDifferent'
      ? existingRecord.actualBedtime
      : existingRecord?.sleepConfirmation === 'asPlanned'
        ? existingRecord.plannedBedtime
        : null;
  const recordedWakeTime =
    existingRecord?.sleepConfirmation === 'reportedDifferent'
      ? existingRecord.actualWakeTime
      : existingRecord?.sleepConfirmation === 'asPlanned'
        ? existingRecord.plannedWakeTime
        : null;
  const [includeSleepSchedule, setIncludeSleepSchedule] = useState(!!existingRecord?.sleepConfirmation);
  const [sleepBedtime, setSleepBedtime] = useState(recordedBedtime ?? defaultBedtime);
  const [sleepWakeTime, setSleepWakeTime] = useState(recordedWakeTime ?? defaultWakeTime);

  const suggestions = localSuggestedGoals[category];

  function isSelected(label: string) {
    return selected.some((s) => s.label === label);
  }

  function toggleGoal(label: string) {
    if (isSelected(label)) {
      setSelected((prev) => prev.filter((s) => s.label !== label));
      return;
    }
    setSelected((prev) => [...prev, { goalId: makeId('goal'), label, category, achieved: null }]);
  }

  function addCustomGoal() {
    const text = customText.trim();
    if (!text) return;
    setSelected((prev) => [...prev, { goalId: makeId('goal'), label: text, category, achieved: null }]);
    setCustomText('');
  }

  function removeGoalByLabel(label: string) {
    setSelected((prev) => prev.filter((s) => s.label !== label));
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

    setLocalSuggestedGoals((prev) => ({
      ...prev,
      [category]: prev[category].map((l, i) => (i === index ? newLabel : l)),
    }));

    setSelected((prev) => prev.map((s) => (s.label === originalLabel ? { ...s, label: newLabel } : s)));
  }

  const customSelectedForCategory = selected.filter((s) => s.category === category && !suggestions.includes(s.label));

  function setAchieved(goalId: string, value: boolean) {
    setSelected((prev) => prev.map((s) => (s.goalId === goalId ? { ...s, achieved: value } : s)));
  }

  const canSave =
    !editingDate &&
    (goalsIncluded || includeSleepSchedule) &&
    (!goalsIncluded || (selected.length > 0 && selected.every((s) => s.achieved !== null)));

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
      showToast(COPY.addPastRecord.toastInvalidDate);
      return;
    }
    if (parsed > maxDate) {
      showToast(COPY.addPastRecord.toastFutureDate);
      return;
    }
    if (parsed !== existingRecord?.date && records[parsed]) {
      showToast(COPY.addPastRecord.toastDuplicate);
      return;
    }
    setDate(parsed);
    setEditingDate(false);
  }

  function handleSave() {
    if (!canSave) return;
    const goals: NightGoal[] = goalsIncluded
      ? selected.map((s) => ({
          goalId: s.goalId,
          label: s.label,
          category: s.category,
          achieved: s.achieved,
        }))
      : [];
    // This screen only ever collects one pair of times and always writes
    // them as the confirmed "actual" schedule -- backfilled nights have no
    // separate plan to compare against. plannedBedtime/plannedWakeTime are
    // cleared alongside so no stale planned-schedule data can outlive an
    // edit and be picked up by badge/stat code that doesn't check confirmation.
    const sleepSchedule = includeSleepSchedule
      ? {
          sleepConfirmation: 'reportedDifferent' as const,
          actualBedtime: sleepBedtime,
          actualWakeTime: sleepWakeTime,
          plannedBedtime: null,
          plannedWakeTime: null,
        }
      : { sleepConfirmation: null, actualBedtime: null, actualWakeTime: null, plannedBedtime: null, plannedWakeTime: null };
    if (existingRecord) {
      if (date !== existingRecord.date) deleteRecord(existingRecord.date);
      upsertRecord({ ...existingRecord, date, goals, ...sleepSchedule });
    } else {
      upsertRecord({
        ...createNightRecord(date, goals, 'backfilled'),
        checkInCompletedAt: new Date().toISOString(),
        ...sleepSchedule,
      });
    }
    navigation.goBack();
    showToast(existingRecord ? COPY.addPastRecord.toastUpdated : COPY.addPastRecord.toastAdded);
  }

  return (
    <ScreenContainer>
      <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 22 * theme.textScale, color: theme.colors.textHi, marginBottom: 16 }}>
        {isEditMode ? COPY.addPastRecord.titleEdit : COPY.addPastRecord.titleAdd}
      </Text>

      <Card>
        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textLow, marginBottom: 6 }}>
          {COPY.addPastRecord.dateLabel}
        </Text>
        {editingDate ? (
          <View>
            <View style={styles.dateInputRow}>
              <TextInput
                value={dd}
                onChangeText={(text) => {
                  const v = text.replace(/[^0-9]/g, '').slice(0, 2);
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
                onChangeText={(text) => {
                  const v = text.replace(/[^0-9]/g, '').slice(0, 2);
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
                onChangeText={(text) => setYy(text.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="YY"
                placeholderTextColor={theme.colors.textLow}
                keyboardType="number-pad"
                maxLength={2}
                onSubmitEditing={confirmDate}
                style={[styles.dateInput, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
              />
            </View>
            <View style={styles.btnRow}>
              <Button label={COPY.common.cancel} variant="ghost" onPress={() => setEditingDate(false)} />
              <Button label={COPY.addPastRecord.setDate} variant="primary" onPress={confirmDate} />
            </View>
          </View>
        ) : (
          <Pressable onPress={openDateEditor}>
            <Text style={{ fontFamily: theme.fonts.display, fontSize: 18, color: theme.colors.textHi }}>{formatFriendlyDate(date)}</Text>
          </Pressable>
        )}
      </Card>

      <Card>
        <View style={styles.sleepHeaderRow}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textLow }}>
            {COPY.addPastRecord.goalsLabel}
          </Text>
          <Toggle value={goalsIncluded} onValueChange={setGoalsIncluded} />
        </View>
        {!goalsIncluded && (
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5 * theme.textScale, color: theme.colors.textLow, marginTop: 4 }}>
            {COPY.addPastRecord.goalsOptionalHint}
          </Text>
        )}
      </Card>

      {goalsIncluded && (
        <>
          <SegmentedTabs
            tabs={GOAL_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            activeKey={category}
            onChange={(key) => {
              cancelEdit();
              setCategory(key as SuggestedGoalCategory);
            }}
          />

          <Card>
            {suggestions.map((label, i) => (
              <EditableGoalListItem
                key={i}
                label={label}
                checked={isSelected(label)}
                isEditing={editingIndex === i}
                editValue={editDraft}
                onToggle={() => toggleGoal(label)}
                onStartEdit={() => startEdit(i)}
                onChangeEditValue={setEditDraft}
                onSaveEdit={() => saveEdit(i)}
                onCancelEdit={cancelEdit}
                isLast={i === suggestions.length - 1 && customSelectedForCategory.length === 0}
              />
            ))}
            {customSelectedForCategory.map((s, i, arr) => (
              <GoalListItem key={s.goalId} label={s.label} checked onPress={() => removeGoalByLabel(s.label)} isLast={i === arr.length - 1} />
            ))}
            <View style={styles.addRow}>
              <TextInput
                value={customText}
                onChangeText={setCustomText}
                placeholder={COPY.addPastRecord.addYourOwn}
                placeholderTextColor={theme.colors.textLow}
                style={[styles.input, { backgroundColor: theme.colors.bgCardStrong, borderColor: theme.colors.hairline, color: theme.colors.textHi }]}
              />
              <Pressable
                onPress={addCustomGoal}
                disabled={!customText.trim()}
                style={[styles.addBtn, { borderColor: theme.colors.hairline, opacity: !customText.trim() ? 0.5 : 1 }]}
              >
                <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.textHi }}>{COPY.addPastRecord.add}</Text>
              </Pressable>
            </View>
          </Card>

          {selected.length > 0 && (
            <Card>
              <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textLow, marginBottom: 10 }}>
                {COPY.addPastRecord.didYouAchieve}
              </Text>
              {selected.map((s, i) => (
                <View key={s.goalId} style={[styles.achieveRow, i < selected.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 14 * theme.textScale, color: theme.colors.textHi, flex: 1, paddingRight: 10 }}>
                    {s.label}
                  </Text>
                  <Pill value={s.achieved} onChange={(v) => setAchieved(s.goalId, v)} />
                </View>
              ))}
            </Card>
          )}
        </>
      )}

      <Card>
        <View style={styles.sleepHeaderRow}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textLow }}>
            {COPY.addPastRecord.sleepScheduleLabel}
          </Text>
          <Toggle value={includeSleepSchedule} onValueChange={setIncludeSleepSchedule} />
        </View>
        {includeSleepSchedule ? (
          <View style={styles.windowRow}>
            <TimeField label={COPY.addPastRecord.bedtimeField} time={sleepBedtime} onChange={setSleepBedtime} />
            <TimeField label={COPY.addPastRecord.wakeField} time={sleepWakeTime} onChange={setSleepWakeTime} />
          </View>
        ) : (
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5 * theme.textScale, color: theme.colors.textLow, marginTop: 4 }}>
            {COPY.addPastRecord.sleepOptionalHint}
          </Text>
        )}
      </Card>

      <View style={styles.btnRow}>
        <Button label={COPY.common.cancel} variant="ghost" onPress={() => navigation.goBack()} />
        <Button label={COPY.common.save} variant="primary" disabled={!canSave} onPress={handleSave} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  achieveRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  sleepHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  windowRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
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
  addRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: { flex: 1, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 13, fontSize: 13.5 },
  addBtn: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
});
