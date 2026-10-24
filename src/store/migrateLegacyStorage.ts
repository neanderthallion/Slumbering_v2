import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsSchema, RecordsSchema, SettingsState, NightRecordsMap } from '../lib/schemas';
import { useSettingsStore, DEFAULT_SETTINGS } from './settingsStore';
import { useRecordsStore } from './recordsStore';
import { normalizeNightRecord } from '../features/goals/logic/nightGoals';
import { STORAGE_KEYS } from './persist';
import { computeCelebratableUnlocks } from '../features/achievements/logic/celebrationGating';

/** Old (pre-rebuild) bare-JSON settings shape, loosely typed since it predates the zod schema. */
interface LegacySettings {
  hasOnboarded?: boolean;
  userName?: string;
  themeMode?: 'light' | 'dark';
  textSize?: 'small' | 'medium' | 'large';
  suggestedGoals?: { bedtime?: string[]; windDown?: string[]; relaxation?: string[] };
  reminders?: {
    setGoals?: { enabled?: boolean; time?: string };
    checkIn?: { enabled?: boolean; time?: string };
    windDown?: { enabled?: boolean };
  };
  bedtimeSchedule?: { bedtime?: string; wakeTime?: string };
  celebratedAchievementIds?: string[];
}

function translateLegacySettings(legacy: LegacySettings): SettingsState {
  const candidate: SettingsState = {
    hasOnboarded: legacy.hasOnboarded ?? DEFAULT_SETTINGS.hasOnboarded,
    profile: { displayName: legacy.userName ?? DEFAULT_SETTINGS.profile.displayName },
    theme: legacy.themeMode ?? DEFAULT_SETTINGS.theme,
    textSize: legacy.textSize ?? DEFAULT_SETTINGS.textSize,
    bedtime: legacy.bedtimeSchedule?.bedtime ?? DEFAULT_SETTINGS.bedtime,
    wakeTime: legacy.bedtimeSchedule?.wakeTime ?? DEFAULT_SETTINGS.wakeTime,
    reminders: {
      setGoals: {
        enabled: legacy.reminders?.setGoals?.enabled ?? DEFAULT_SETTINGS.reminders.setGoals.enabled,
        time: legacy.reminders?.setGoals?.time ?? DEFAULT_SETTINGS.reminders.setGoals.time,
      },
      checkIn: {
        enabled: legacy.reminders?.checkIn?.enabled ?? DEFAULT_SETTINGS.reminders.checkIn.enabled,
        time: legacy.reminders?.checkIn?.time ?? DEFAULT_SETTINGS.reminders.checkIn.time,
      },
      windDown: { enabled: legacy.reminders?.windDown?.enabled ?? DEFAULT_SETTINGS.reminders.windDown.enabled },
    },
    suggestedGoals: {
      bedtime: legacy.suggestedGoals?.bedtime ?? DEFAULT_SETTINGS.suggestedGoals.bedtime,
      windDown: legacy.suggestedGoals?.windDown ?? DEFAULT_SETTINGS.suggestedGoals.windDown,
      relaxation: legacy.suggestedGoals?.relaxation ?? DEFAULT_SETTINGS.suggestedGoals.relaxation,
    },
    celebratedAchievementIds: legacy.celebratedAchievementIds ?? [],
  };
  const parsed = SettingsSchema.safeParse(candidate);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

function translateLegacyRecords(raw: Record<string, unknown>): NightRecordsMap {
  const normalized: Record<string, unknown> = {};
  for (const [date, record] of Object.entries(raw)) {
    try {
      normalized[date] = normalizeNightRecord(record as never);
    } catch {
      // malformed legacy record (e.g. null) -- drop it rather than block the whole migration
    }
  }
  const parsed = RecordsSchema.safeParse(normalized);
  return parsed.success ? parsed.data : {};
}

/**
 * One-time upgrade path from the pre-rebuild bare-JSON AsyncStorage format to
 * the new zustand `persist`-enveloped store. Idempotent: does nothing once
 * `STORAGE_KEYS.migrationDone` is set (either from a prior run of this
 * migration, or because this is a fresh install with nothing to migrate).
 * Safe to call on every app start.
 */
export async function migrateLegacyStorage(): Promise<void> {
  const alreadyMigrated = await AsyncStorage.getItem(STORAGE_KEYS.migrationDone);
  if (alreadyMigrated != null) return;

  const [rawSettings, rawRecords] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.settingsLegacyV1),
    AsyncStorage.getItem(STORAGE_KEYS.recordsLegacyV1),
  ]);
  if (rawSettings == null && rawRecords == null) {
    await AsyncStorage.setItem(STORAGE_KEYS.migrationDone, 'true');
    return; // fresh install, nothing to migrate
  }

  let legacySettings: LegacySettings = {};
  try {
    if (rawSettings != null) legacySettings = JSON.parse(rawSettings);
  } catch {
    // corrupt legacy data -- fall through to defaults rather than block startup
  }

  let legacyRecordsRaw: Record<string, unknown> = {};
  try {
    if (rawRecords != null) legacyRecordsRaw = JSON.parse(rawRecords);
  } catch {
    // corrupt legacy data -- fall through to an empty records map
  }

  const settings = translateLegacySettings(legacySettings);
  const records = translateLegacyRecords(legacyRecordsRaw);

  useSettingsStore.getState().restoreSettings(settings);
  useRecordsStore.getState().restoreRecords(records);

  // Pre-existing users must not have every already-crossed badge/engagement
  // milestone re-fire as a celebration the moment this ships (celebratedIds
  // was empty for everyone pre-migration) -- backdate-seed everything
  // celebratable as of today so only genuinely new unlocks celebrate from here on.
  const allUnlockIds = computeCelebratableUnlocks(records as never).map((u) => u.id);
  if (allUnlockIds.length > 0) useSettingsStore.getState().addCelebratedAchievementIds(allUnlockIds);

  await AsyncStorage.setItem(STORAGE_KEYS.migrationDone, 'true');
}
