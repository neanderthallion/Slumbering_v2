import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SettingsSchema, SettingsState } from '../lib/schemas';
import { ThemeMode, TextSizeKey, ReminderConfig, SuggestedGoalCategory } from '../types/domain';
import { STORAGE_KEYS, asyncStorageAdapter } from './persist';

// Seed content for a brand-new install. Once a user edits their suggested
// goals, these values live only in persisted state -- this is a one-time
// seed, not a source consulted again after first launch.
const DEFAULT_SUGGESTED_GOALS: Record<SuggestedGoalCategory, string[]> = {
  bedtime: ['Sleep before 11:00 PM', 'Be in bed by 10:45 PM', 'Wake up at 6:30 AM'],
  windDown: ['Put away all digital devices 30 minutes before bed', 'Reading 10 pages before bed'],
  relaxation: ['Stretching for 10 minutes before bed', 'Practice breathing or meditation for 5 minutes before bed'],
};

export const DEFAULT_SETTINGS: SettingsState = {
  hasOnboarded: false,
  profile: { displayName: '' },
  theme: 'dark',
  textSize: 'medium',
  bedtime: '23:00',
  wakeTime: '07:00',
  reminders: {
    setGoals: { enabled: true, time: '21:00' },
    checkIn: { enabled: true, time: '08:00' },
    windDown: { enabled: true },
  },
  suggestedGoals: DEFAULT_SUGGESTED_GOALS,
  celebratedAchievementIds: [],
};

interface SettingsStore extends SettingsState {
  hasHydrated: boolean;
  setHasOnboarded: (v: boolean) => void;
  setDisplayName: (displayName: string) => void;
  setTheme: (mode: ThemeMode) => void;
  setTextSize: (size: TextSizeKey) => void;
  setBedtime: (bedtime: string) => void;
  setWakeTime: (wakeTime: string) => void;
  setReminder: (key: 'setGoals' | 'checkIn', patch: Partial<ReminderConfig>) => void;
  setWindDownReminder: (patch: Partial<{ enabled: boolean }>) => void;
  setSuggestedGoals: (category: SuggestedGoalCategory, labels: string[]) => void;
  addCelebratedAchievementIds: (ids: string[]) => void;
  restoreSettings: (next: SettingsState) => void;
}

/** Plain-data view of the store (no action functions, no `hasHydrated`) -- e.g. for building a backup export payload. */
export function selectSettingsState(s: SettingsStore): SettingsState {
  return {
    hasOnboarded: s.hasOnboarded,
    profile: s.profile,
    theme: s.theme,
    textSize: s.textSize,
    bedtime: s.bedtime,
    wakeTime: s.wakeTime,
    reminders: s.reminders,
    suggestedGoals: s.suggestedGoals,
    celebratedAchievementIds: s.celebratedAchievementIds,
  };
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      hasHydrated: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setDisplayName: (displayName) => set({ profile: { displayName } }),
      setTheme: (mode) => set({ theme: mode }),
      setTextSize: (size) => set({ textSize: size }),
      setBedtime: (bedtime) => set({ bedtime }),
      setWakeTime: (wakeTime) => set({ wakeTime }),
      setReminder: (key, patch) =>
        set((s) => ({ reminders: { ...s.reminders, [key]: { ...s.reminders[key], ...patch } } })),
      setWindDownReminder: (patch) =>
        set((s) => ({ reminders: { ...s.reminders, windDown: { ...s.reminders.windDown, ...patch } } })),
      setSuggestedGoals: (category, labels) =>
        set((s) => ({ suggestedGoals: { ...s.suggestedGoals, [category]: labels } })),
      addCelebratedAchievementIds: (ids) =>
        set((s) => ({ celebratedAchievementIds: Array.from(new Set([...s.celebratedAchievementIds, ...ids])) })),
      restoreSettings: (next) => set(next),
    }),
    {
      name: STORAGE_KEYS.settingsV2,
      storage: asyncStorageAdapter,
      version: 1,
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        const candidate: SettingsState = {
          ...selectSettingsState(current),
          ...p,
          reminders: { ...current.reminders, ...(p.reminders ?? {}) },
          suggestedGoals: { ...current.suggestedGoals, ...(p.suggestedGoals ?? {}) },
        };
        // A corrupted or partially-written persisted blob must not spread invalid data into
        // live state on a normal boot -- fall back to defaults, same as the legacy-migration path.
        const parsed = SettingsSchema.safeParse(candidate);
        return { ...current, ...(parsed.success ? parsed.data : DEFAULT_SETTINGS) };
      },
      onRehydrateStorage: () => () => {
        useSettingsStore.setState({ hasHydrated: true });
      },
    }
  )
);
