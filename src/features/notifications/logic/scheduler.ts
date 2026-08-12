import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

/**
 * Schedules (or, if one with this identifier already exists, replaces) a
 * daily repeating reminder. Uses a fixed identifier per reminder rather than
 * a stored/returned one, so rescheduling is just cancel-then-schedule with
 * the same id -- no notification id needs to live in persisted settings
 * (which would otherwise leak a device-local id into JSON backup export).
 */
export async function scheduleDailyReminder(identifier: string, hour: number, minute: number, title: string, body: string): Promise<void> {
  await cancelReminder(identifier);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: true },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelReminder(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // already cancelled / never scheduled
  }
}
