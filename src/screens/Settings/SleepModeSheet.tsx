import React, { forwardRef, useMemo, useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { useToast } from '../../components/ToastProvider';
import { Button } from '../../components/Button';
import { TimeField } from '../../components/TimeField';
import { WeekdayPicker } from '../../components/WeekdayPicker';
import { SleepModeConfig } from '../../types/models';
import { minutesBetween, formatTime12h } from '../../utils/date';
import { dndAvailable, dndPlatformNote } from '../../sleepMode/dnd';
import { alwaysOnDisplayAvailable, alwaysOnDisplayPlatformNote } from '../../sleepMode/alwaysOnDisplay';

const TOGGLE_LABELS: { key: keyof SleepModeConfig['toggles']; label: string; note?: string }[] = [
  { key: 'darkMode', label: 'Dark mode' },
  { key: 'doNotDisturb', label: 'Do Not Disturb', note: dndAvailable ? undefined : dndPlatformNote },
  { key: 'lowerBrightness', label: 'Lower brightness' },
  { key: 'silenceNotifications', label: 'Silence notifications' },
  {
    key: 'turnOffAlwaysOnDisplay',
    label: 'Turn off Always-on Display',
    note: alwaysOnDisplayAvailable ? undefined : alwaysOnDisplayPlatformNote,
  },
];

const ALARM_SOUNDS = ['Morning Xylophone', 'Gentle Chimes', 'Ocean Drift'] as const;
const VIBRATIONS = ['Standard', 'Gentle', 'Off'] as const;

export const SleepModeSheet = forwardRef<BottomSheetModal>((_props, ref) => {
  const { theme } = useTheme();
  const { settings, updateSettings } = useAppData();
  const { showToast } = useToast();
  const snapPoints = useMemo(() => ['88%'], []);

  const [draft, setDraft] = useState<SleepModeConfig>(settings.sleepMode);

  function patch(update: Partial<SleepModeConfig>) {
    setDraft((prev) => ({ ...prev, ...update }));
  }

  function cyclePick<T extends string>(options: readonly T[], current: T): T {
    const idx = options.indexOf(current);
    return options[(idx + 1) % options.length];
  }

  function handleConfirm(dismiss: () => void) {
    updateSettings((prev) => ({ ...prev, sleepMode: { ...prev.sleepMode, ...draft } }));
    dismiss();
    showToast('Sleep mode updated');
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: theme.colors.bgGradientTop }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.hairline }}
      onChange={(index) => {
        if (index === 0) setDraft(settings.sleepMode);
      }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={{ fontFamily: theme.fonts.displayItalic, fontSize: 22, color: theme.colors.textHi }}>Sleep mode</Text>
        </View>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMid, marginBottom: 16 }}>
          Automates your phone settings at bedtime.
        </Text>

        <View style={styles.sectionRow}>
          <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.accent }}>
            Automatic activation
          </Text>
          <Switch
            value={draft.autoActivated}
            onValueChange={(v) => patch({ autoActivated: v })}
            trackColor={{ true: theme.colors.accent, false: theme.colors.hairline }}
          />
        </View>

        {draft.autoActivated && (
          <>
            <View style={styles.windowRow}>
              <TimeField label="Bedtime" emoji="🌙" time={draft.bedtime} onChange={(t) => patch({ bedtime: t })} />
              <TimeField label="Wake-up" emoji="☀️" time={draft.wakeTime} onChange={(t) => patch({ wakeTime: t })} />
            </View>
            <Text style={{ textAlign: 'center', fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMid, marginBottom: 16 }}>
              Sleep duration · {Math.floor(minutesBetween(draft.bedtime, draft.wakeTime) / 60)}h{' '}
              {minutesBetween(draft.bedtime, draft.wakeTime) % 60}m
            </Text>

            <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.accent, marginBottom: 4 }}>
              Frequency
            </Text>
            <WeekdayPicker value={draft.daysOfWeek} onChange={(v) => patch({ daysOfWeek: v })} />
          </>
        )}

        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.accent, marginTop: 22, marginBottom: 8 }}>
          While Sleep Mode is active
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.hairline }]}>
          {TOGGLE_LABELS.map((t, i) => (
            <View key={t.key} style={[styles.toggleRow, i < TOGGLE_LABELS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14, color: theme.colors.textHi }}>{t.label}</Text>
                {t.note && (
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, color: theme.colors.textLow, marginTop: 2, maxWidth: 220 }}>
                    {t.note}
                  </Text>
                )}
              </View>
              <Switch
                value={draft.toggles[t.key]}
                onValueChange={(v) => patch({ toggles: { ...draft.toggles, [t.key]: v } })}
                trackColor={{ true: theme.colors.accent, false: theme.colors.hairline }}
              />
            </View>
          ))}
        </View>

        <Text style={{ fontFamily: theme.fonts.bodyBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.accent, marginTop: 22, marginBottom: 8 }}>
          Wake-up alarm
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, color: theme.colors.textLow, marginBottom: 8 }}>
          Rings via a scheduled notification — not a full replacement for a dedicated alarm clock while the app is closed.
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.bgCard, borderColor: theme.colors.hairline }]}>
          <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
            <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14, color: theme.colors.textHi, flex: 1 }}>Alarm sound</Text>
            <Text
              onPress={() => patch({ alarm: { ...draft.alarm, sound: cyclePick(ALARM_SOUNDS, draft.alarm.sound) } })}
              style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.accent }}
            >
              {draft.alarm.sound}
            </Text>
          </View>
          <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline }]}>
            <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14, color: theme.colors.textHi, flex: 1 }}>Vibration</Text>
            <Text
              onPress={() => patch({ alarm: { ...draft.alarm, vibration: cyclePick(VIBRATIONS, draft.alarm.vibration) } })}
              style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.accent }}
            >
              {draft.alarm.vibration}
            </Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14, color: theme.colors.textHi, flex: 1 }}>Snooze</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMid }}>
              {draft.alarm.snoozeIntervalMinutes} min · {draft.alarm.snoozeCount} times
            </Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => {
              setDraft(settings.sleepMode);
              // @ts-ignore - ref is a BottomSheetModal instance provided by parent
              ref && 'current' in ref && ref.current?.dismiss();
            }}
          />
          <Button
            label="Confirm"
            variant="primary"
            onPress={() => {
              // @ts-ignore
              const dismiss = () => ref && 'current' in ref && ref.current?.dismiss();
              handleConfirm(dismiss);
            }}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: { padding: 22, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  windowRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  card: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
