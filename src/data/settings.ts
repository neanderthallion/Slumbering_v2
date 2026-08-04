import { AppSettings } from '../types/models';
import { storage } from './storage';
import { DEFAULT_SUGGESTED_GOALS } from './suggestedGoals';

export const DEFAULT_NIGHT_PLAN = ['Sleep before 11:00 PM', 'Put away devices 30 minutes before bed'];

export function createDefaultSettings(): AppSettings {
  return {
    hasOnboarded: false,
    userName: '',
    themeMode: 'dark',
    accent: 'periwinkle',
    textSize: 'medium',
    defaultNightPlan: [...DEFAULT_NIGHT_PLAN],
    suggestedGoals: {
      bedtime: [...DEFAULT_SUGGESTED_GOALS.bedtime],
      windDown: [...DEFAULT_SUGGESTED_GOALS.windDown],
      relaxation: [...DEFAULT_SUGGESTED_GOALS.relaxation],
    },
    lastCompanionMessage: null,
    reminders: {
      setGoals: { enabled: true, time: '21:00', notificationId: null },
      checkIn: { enabled: true, time: '08:00', notificationId: null },
      windDown: { enabled: true, time: '22:50', notificationId: null },
    },
    bedtimeSchedule: {
      bedtime: '23:00',
      wakeTime: '07:00',
    },
    celebratedAchievementIds: [],
  };
}

export function mergeSettings(base: AppSettings, partial: Partial<AppSettings> | null): AppSettings {
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    reminders: { ...base.reminders, ...(partial.reminders ?? {}) },
    suggestedGoals: { ...base.suggestedGoals, ...(partial.suggestedGoals ?? {}) },
    bedtimeSchedule: { ...base.bedtimeSchedule, ...(partial.bedtimeSchedule ?? {}) },
  };
}

export async function loadSettings(): Promise<AppSettings> {
  const stored = await storage.readJson<Partial<AppSettings>>(storage.keys.settings);
  return mergeSettings(createDefaultSettings(), stored);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await storage.writeJson(storage.keys.settings, settings);
}
