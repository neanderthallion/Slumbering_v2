import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppData } from '../../data/AppDataContext';
import { Card } from '../../components/Card';
import { TimeField } from '../../components/TimeField';
import { minutesBetween } from '../../utils/date';
import { computeWindDownTime } from '../../notifications/reminderTiming';
import { rescheduleDailyReminder } from '../../notifications/scheduler';

export function BedtimeSchedulePanel() {
  const { theme } = useTheme();
  const { settings, updateSettings } = useAppData();
  const { bedtime, wakeTime } = settings.bedtimeSchedule;

  function patch(update: Partial<typeof settings.bedtimeSchedule>) {
    updateSettings((prev) => ({ ...prev, bedtimeSchedule: { ...prev.bedtimeSchedule, ...update } }));
  }

  async function handleBedtimeChange(time: string) {
    const windDown = settings.reminders.windDown;
    const nextWindDownTime = computeWindDownTime(time);
    let notificationId = windDown.notificationId;
    if (windDown.enabled) {
      notificationId = await rescheduleDailyReminder(
        windDown.notificationId,
        nextWindDownTime,
        'Slumbering',
        "It's nearly bedtime. Ready to wind down?"
      );
    }
    updateSettings((prev) => ({
      ...prev,
      bedtimeSchedule: { ...prev.bedtimeSchedule, bedtime: time },
      reminders: { ...prev.reminders, windDown: { ...prev.reminders.windDown, time: nextWindDownTime, notificationId } },
    }));
  }

  const duration = minutesBetween(bedtime, wakeTime);

  return (
    <Card>
      <Text
        style={{
          fontFamily: theme.fonts.bodyBold,
          fontSize: 11 * theme.textScale,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.colors.textLow,
          marginBottom: 12,
        }}
      >
        Bedtime schedule
      </Text>
      <View style={styles.windowRow}>
        <TimeField label="Bedtime" emoji="🌙" time={bedtime} onChange={handleBedtimeChange} />
        <TimeField label="Wake-up" emoji="☀️" time={wakeTime} onChange={(t) => patch({ wakeTime: t })} />
      </View>
      <Text
        style={{
          textAlign: 'center',
          fontFamily: theme.fonts.body,
          fontSize: 12 * theme.textScale,
          color: theme.colors.textMid,
          marginTop: 12,
        }}
      >
        Sleep duration · {Math.floor(duration / 60)}h {duration % 60}m
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  windowRow: { flexDirection: 'row', gap: 12 },
});
