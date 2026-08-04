import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

/**
 * expo-notifications has no scheduling implementation on web (it throws), so
 * this no-ops there instead of blocking whatever triggered the reschedule
 * (e.g. a settings update) with an unhandled rejection.
 */
export async function scheduleDailyReminder(time: string, title: string, body: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const [hour, minute] = time.split(':').map(Number);
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelNotification(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already cancelled / never scheduled
  }
}

export async function rescheduleDailyReminder(
  previousId: string | null,
  time: string,
  title: string,
  body: string
): Promise<string | null> {
  await cancelNotification(previousId);
  return scheduleDailyReminder(time, title, body);
}
