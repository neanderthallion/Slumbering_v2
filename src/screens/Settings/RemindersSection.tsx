import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { Card } from '../../components/Card';
import { Toggle } from '../../components/Toggle';
import { TimePickerPanel } from '../../components/TimePickerPanel';
import { ensureNotificationPermission } from '../../notifications/permissions';
import { cancelNotification, rescheduleDailyReminder } from '../../notifications/scheduler';
import { computeWindDownTime } from '../../notifications/reminderTiming';
import { formatTime12h } from '../../utils/date';

type ReminderKey = 'setGoals' | 'checkIn' | 'windDown';

const COPY: Record<ReminderKey, { label: string; title: string; body: string }> = {
  setGoals: { label: 'Set goals reminder', title: 'Slumbering', body: 'Time to choose your sleep goals for tonight.' },
  checkIn: { label: 'Check-in reminder', title: 'Slumbering', body: "How did you do with last night's goals?" },
  windDown: { label: 'Wind-down reminder', title: 'Slumbering', body: "It's nearly bedtime. Ready to wind down?" },
};

export function RemindersSection() {
  const { theme } = useTheme();
  const { settings, updateSettings } = useAppData();
  const [openPicker, setOpenPicker] = React.useState<ReminderKey | null>(null);

  async function toggle(key: ReminderKey, enabled: boolean) {
    const reminder = settings.reminders[key];
    if (enabled) {
      const granted = await ensureNotificationPermission();
      if (!granted) return;
      const time = key === 'windDown' ? computeWindDownTime(settings.bedtimeSchedule.bedtime) : reminder.time;
      const id = await rescheduleDailyReminder(reminder.notificationId, time, COPY[key].title, COPY[key].body);
      updateSettings((prev) => ({
        ...prev,
        reminders: { ...prev.reminders, [key]: { ...prev.reminders[key], enabled: true, time, notificationId: id } },
      }));
    } else {
      await cancelNotification(reminder.notificationId);
      updateSettings((prev) => ({
        ...prev,
        reminders: { ...prev.reminders, [key]: { ...prev.reminders[key], enabled: false, notificationId: null } },
      }));
    }
  }

  async function changeTime(key: ReminderKey, time: string) {
    const reminder = settings.reminders[key];
    let notificationId = reminder.notificationId;
    if (reminder.enabled) {
      notificationId = await rescheduleDailyReminder(reminder.notificationId, time, COPY[key].title, COPY[key].body);
    }
    updateSettings((prev) => ({
      ...prev,
      reminders: { ...prev.reminders, [key]: { ...prev.reminders[key], time, notificationId } },
    }));
  }

  return (
    <Card>
      {(['setGoals', 'checkIn', 'windDown'] as ReminderKey[]).map((key, i) => {
        const reminder = settings.reminders[key];
        return (
          <View key={key} style={[styles.row, i < 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline, paddingBottom: 14, marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi }}>
                {COPY[key].label}
              </Text>
              {key === 'windDown' ? (
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow, marginTop: 2 }}>
                  10 min before bedtime
                </Text>
              ) : (
                <Pressable onPress={() => setOpenPicker(key)}>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow, marginTop: 2 }}>
                    {formatTime12h(reminder.time)}
                  </Text>
                </Pressable>
              )}
            </View>
            <Toggle value={reminder.enabled} onValueChange={(v) => toggle(key, v)} />
          </View>
        );
      })}
      {openPicker && (
        <TimePickerPanel
          time={settings.reminders[openPicker].time}
          onChange={(time) => changeTime(openPicker, time)}
          onRequestClose={() => setOpenPicker(null)}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
