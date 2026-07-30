import React from 'react';
import { View, Text, Switch, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { Card } from '../../components/Card';
import { ensureNotificationPermission } from '../../notifications/permissions';
import { cancelNotification, rescheduleDailyReminder } from '../../notifications/scheduler';
import { formatTime12h } from '../../utils/date';

type ReminderKey = 'setGoals' | 'checkIn';

const COPY: Record<ReminderKey, { label: string; title: string; body: string }> = {
  setGoals: { label: 'Set goals reminder', title: 'Slumbering', body: 'Time to choose your sleep goals for tonight.' },
  checkIn: { label: 'Check-in reminder', title: 'Slumbering', body: "How did you do with last night's goals?" },
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
      const id = await rescheduleDailyReminder(reminder.notificationId, reminder.time, COPY[key].title, COPY[key].body);
      updateSettings((prev) => ({
        ...prev,
        reminders: { ...prev.reminders, [key]: { ...prev.reminders[key], enabled: true, notificationId: id } },
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

  function timeToDate(time: string): Date {
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  return (
    <Card>
      {(['setGoals', 'checkIn'] as ReminderKey[]).map((key, i) => {
        const reminder = settings.reminders[key];
        return (
          <View key={key} style={[styles.row, i === 0 && { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline, paddingBottom: 14, marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.bodyMedium, fontSize: 14 * theme.textScale, color: theme.colors.textHi }}>
                {COPY[key].label}
              </Text>
              <Pressable onPress={() => setOpenPicker(key)} disabled={!reminder.enabled}>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5 * theme.textScale, color: theme.colors.textLow, marginTop: 2 }}>
                  {formatTime12h(reminder.time)}
                </Text>
              </Pressable>
            </View>
            <Switch
              value={reminder.enabled}
              onValueChange={(v) => toggle(key, v)}
              trackColor={{ true: theme.colors.accent, false: theme.colors.hairline }}
            />
          </View>
        );
      })}
      {openPicker && (
        <DateTimePicker
          value={timeToDate(settings.reminders[openPicker].time)}
          mode="time"
          onChange={(event, date) => {
            setOpenPicker(Platform.OS === 'ios' ? openPicker : null);
            if (event.type === 'set' && date) {
              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              changeTime(openPicker, time);
            }
          }}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
