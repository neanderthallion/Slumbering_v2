/* eslint-disable @typescript-eslint/no-require-imports, import/first -- this suite deliberately
   uses jest.resetModules() + require() per-test so each store re-runs its persist hydration
   against freshly-seeded mock storage; a static top-level import can't be re-triggered that way. */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { STORAGE_KEYS } from './persist';

/** Mirrors AppShell's real gating: migration must only run after the store's own persist-hydration has settled, or its restoreSettings/restoreRecords call can be raced and clobbered by that hydration finishing afterward. */
function waitForHydration(store: { persist: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => void } }): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => store.persist.onFinishHydration(() => resolve()));
}

describe('migrateLegacyStorage', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('hydrates the new store from an old bare-JSON settings/records blob and backdate-seeds celebratedAchievementIds', async () => {
    // require()'d fresh, after resetModules, so it's the SAME AsyncStorage mock
    // instance the freshly-required stores below will read from -- a stale
    // top-level `import` here would resolve to a different, already-discarded
    // module instance post-reset and silently see no seeded data.
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    const legacySettings = {
      hasOnboarded: true,
      userName: 'Alex',
      themeMode: 'light',
      textSize: 'large',
      suggestedGoals: { bedtime: ['Sleep before 11'], windDown: [], relaxation: [] },
      reminders: {
        setGoals: { enabled: true, time: '21:00' },
        checkIn: { enabled: true, time: '08:00' },
        windDown: { enabled: true, time: '22:50' },
      },
      bedtimeSchedule: { bedtime: '22:30', wakeTime: '06:30' },
      celebratedAchievementIds: [],
    };
    const legacyRecords = {
      '2026-08-01': {
        date: '2026-08-01',
        goals: [{ goalId: 'g1', label: 'Sleep early', category: 'bedtime', achieved: true }],
        goalsSetAt: '2026-08-01T20:00:00.000Z',
        checkInCompletedAt: '2026-08-01T09:00:00.000Z',
        source: 'normal',
        plannedBedtime: '22:30',
        plannedWakeTime: '06:30',
        sleepConfirmation: 'asPlanned',
        actualBedtime: null,
        actualWakeTime: null,
      },
    };

    await AsyncStorage.setItem(STORAGE_KEYS.settingsLegacyV1, JSON.stringify(legacySettings));
    await AsyncStorage.setItem(STORAGE_KEYS.recordsLegacyV1, JSON.stringify(legacyRecords));

    const { useSettingsStore } = require('./settingsStore');
    const { useRecordsStore } = require('./recordsStore');
    const { migrateLegacyStorage } = require('./migrateLegacyStorage');

    await Promise.all([waitForHydration(useSettingsStore), waitForHydration(useRecordsStore)]);
    await migrateLegacyStorage();

    const settings = useSettingsStore.getState();
    expect(settings.hasOnboarded).toBe(true);
    expect(settings.profile.displayName).toBe('Alex');
    expect(settings.theme).toBe('light');
    expect(settings.textSize).toBe('large');
    expect(settings.bedtime).toBe('22:30');
    expect(settings.wakeTime).toBe('06:30');
    expect(settings.celebratedAchievementIds).toContain('badge-firstStep');

    const records = useRecordsStore.getState().records;
    expect(records['2026-08-01']).toBeDefined();
    expect(records['2026-08-01'].source).toBe('normal');

    const migratedRaw = await AsyncStorage.getItem(STORAGE_KEYS.migrationDone);
    expect(migratedRaw).not.toBeNull();
  });

  it('is a no-op on a fresh install with no legacy keys present', async () => {
    const { useSettingsStore } = require('./settingsStore');
    const { migrateLegacyStorage } = require('./migrateLegacyStorage');

    await waitForHydration(useSettingsStore);
    await migrateLegacyStorage();

    expect(useSettingsStore.getState().hasOnboarded).toBe(false);
  });

  it('skips a malformed (null) legacy record instead of throwing, and still completes migration', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    const legacyRecords = {
      '2026-08-01': null,
      '2026-08-02': {
        date: '2026-08-02',
        goals: [{ goalId: 'g1', label: 'Sleep early', category: 'bedtime', achieved: true }],
        goalsSetAt: '2026-08-02T20:00:00.000Z',
        checkInCompletedAt: '2026-08-02T09:00:00.000Z',
        source: 'normal',
        plannedBedtime: '22:30',
        plannedWakeTime: '06:30',
        sleepConfirmation: 'asPlanned',
        actualBedtime: null,
        actualWakeTime: null,
      },
    };
    await AsyncStorage.setItem(STORAGE_KEYS.recordsLegacyV1, JSON.stringify(legacyRecords));

    const { useSettingsStore } = require('./settingsStore');
    const { useRecordsStore } = require('./recordsStore');
    const { migrateLegacyStorage } = require('./migrateLegacyStorage');

    await Promise.all([waitForHydration(useSettingsStore), waitForHydration(useRecordsStore)]);
    await expect(migrateLegacyStorage()).resolves.not.toThrow();

    const records = useRecordsStore.getState().records;
    expect(records['2026-08-01']).toBeUndefined();
    expect(records['2026-08-02']).toBeDefined();

    const migratedRaw = await AsyncStorage.getItem(STORAGE_KEYS.migrationDone);
    expect(migratedRaw).not.toBeNull();
  });
});
