import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ToastProvider';
import { Card } from '../../components/Card';
import { Toggle } from '../../components/Toggle';
import { TimePickerPanel } from '../../components/TimePickerPanel';
import { ensureNotificationPermission } from '../../features/notifications/logic/permissions';
import { formatClockTime } from '../../lib/dateMath';
import { COPY } from '../../copy';

type TimedReminderKey = 'setGoals' | 'checkIn';

const LABELS: Record<'setGoals' | 'checkIn' | 'windDown', string> = {
  setGoals: COPY.settings.reminders.setGoals,
  checkIn: COPY.settings.reminders.checkIn,
  windDown: COPY.settings.reminders.windDown,
};

export function RemindersSection() {
  const { theme } = useTheme();
  const reminders = useSettingsStore((s) => s.reminders);
  const setReminder = useSettingsStore((s) => s.setReminder);
  const setWindDownReminder = useSettingsStore((s) => s.setWindDownReminder);
  const [openPicker, setOpenPicker] = useState<TimedReminderKey | null>(null);
  const { showToast } = useToast();

  function setEnabled(key: 'setGoals' | 'checkIn' | 'windDown', enabled: boolean) {
    const apply = (v: boolean) => (key === 'windDown' ? setWindDownReminder({ enabled: v }) : setReminder(key, { enabled: v }));
    if (!enabled) {
      apply(false);
      return;
    }
    ensureNotificationPermission().then((granted) => {
      if (granted) apply(true);
      else showToast(COPY.settings.reminders.permissionDenied);
    });
  }

  return (
    <Card>
      {(['setGoals', 'checkIn', 'windDown'] as const).map((key, i) => (
        <View key={key} style={[styles.row, i < 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline, paddingBottom: 14, marginBottom: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi }}>{LABELS[key]}</Text>
            {key === 'windDown' ? (
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow, marginTop: 2 }}>
                {COPY.settings.reminders.windDownHint}
              </Text>
            ) : (
              <Pressable onPress={() => setOpenPicker(key)}>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow, marginTop: 2 }}>
                  {formatClockTime(reminders[key].time)}
                </Text>
              </Pressable>
            )}
          </View>
          <Toggle value={reminders[key].enabled} onValueChange={(v) => setEnabled(key, v)} />
        </View>
      ))}
      {openPicker && (
        <TimePickerPanel
          time={reminders[openPicker].time}
          onChange={(time) => setReminder(openPicker, { time })}
          onRequestClose={() => setOpenPicker(null)}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
