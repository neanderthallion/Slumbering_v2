import { SettingsState } from '../../../types/domain';
import { parseTimeToMinutes } from '../../../lib/dateMath';
import { computeWindDownTime } from '../preferences';
import { scheduleDailyReminder, cancelReminder } from './scheduler';

export const REMINDER_IDS = {
  setGoals: 'reminder-setGoals',
  checkIn: 'reminder-checkIn',
  windDown: 'reminder-windDown',
} as const;

const REMINDER_COPY = {
  setGoals: { title: 'Set tonight’s goals', body: 'A couple of small goals go a long way.' },
  checkIn: { title: 'Check in', body: 'How did last night go?' },
  windDown: { title: 'Unwind time', body: 'Time to start easing into the night.' },
} as const;

/** Schedules/cancels the three daily reminders to match `settings`. Silently a no-op per-reminder if the OS call fails (e.g. permission revoked outside the app). */
export async function syncReminderSchedules(settings: Pick<SettingsState, 'reminders' | 'bedtime'>): Promise<void> {
  await Promise.all([
    syncOne(REMINDER_IDS.setGoals, settings.reminders.setGoals.enabled, settings.reminders.setGoals.time, REMINDER_COPY.setGoals),
    syncOne(REMINDER_IDS.checkIn, settings.reminders.checkIn.enabled, settings.reminders.checkIn.time, REMINDER_COPY.checkIn),
    syncOne(
      REMINDER_IDS.windDown,
      settings.reminders.windDown.enabled,
      computeWindDownTime(settings.bedtime),
      REMINDER_COPY.windDown
    ),
  ]);
}

async function syncOne(identifier: string, enabled: boolean, time: string, copy: { title: string; body: string }): Promise<void> {
  try {
    if (!enabled) {
      await cancelReminder(identifier);
      return;
    }
    const minutes = parseTimeToMinutes(time);
    await scheduleDailyReminder(identifier, Math.floor(minutes / 60), minutes % 60, copy.title, copy.body);
  } catch {
    // best-effort -- a scheduling failure here shouldn't crash the app
  }
}
