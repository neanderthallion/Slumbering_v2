/* eslint-disable @typescript-eslint/no-require-imports, import/first -- this suite deliberately
   uses jest.resetModules() + require() per-test so each store re-runs its persist hydration
   against freshly-seeded mock storage; a static top-level import can't be re-triggered that way. */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { STORAGE_KEYS } from './persist';

function waitForHydration(store: { persist: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => void } }): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => store.persist.onFinishHydration(() => resolve()));
}

describe('store rehydration validation (normal boot, version already current)', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('falls back to DEFAULT_SETTINGS when persisted settingsV2 data is schema-invalid, instead of loading garbage into live state', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(
      STORAGE_KEYS.settingsV2,
      JSON.stringify({ state: { theme: 12345, bedtime: { not: 'a string' } }, version: 1 })
    );

    const { useSettingsStore, DEFAULT_SETTINGS } = require('./settingsStore');
    await waitForHydration(useSettingsStore);

    expect(useSettingsStore.getState().theme).toBe(DEFAULT_SETTINGS.theme);
    expect(useSettingsStore.getState().bedtime).toBe(DEFAULT_SETTINGS.bedtime);
  });

  it('falls back to an empty records map when persisted recordsV2 data is schema-invalid', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(
      STORAGE_KEYS.recordsV2,
      JSON.stringify({ state: { records: { '2026-08-01': { garbage: true } } }, version: 1 })
    );

    const { useRecordsStore } = require('./recordsStore');
    await waitForHydration(useRecordsStore);

    expect(useRecordsStore.getState().records).toEqual({});
  });

  it('still loads valid persisted settings normally', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const validSettings = {
      hasOnboarded: true,
      profile: { displayName: 'Alex' },
      theme: 'light',
      textSize: 'medium',
      bedtime: '22:15',
      wakeTime: '06:30',
      reminders: {
        setGoals: { enabled: true, time: '21:00' },
        checkIn: { enabled: true, time: '08:00' },
        windDown: { enabled: true },
      },
      suggestedGoals: { bedtime: [], windDown: [], relaxation: [] },
      celebratedAchievementIds: [],
    };
    await AsyncStorage.setItem(STORAGE_KEYS.settingsV2, JSON.stringify({ state: validSettings, version: 1 }));

    const { useSettingsStore } = require('./settingsStore');
    await waitForHydration(useSettingsStore);

    expect(useSettingsStore.getState().theme).toBe('light');
    expect(useSettingsStore.getState().bedtime).toBe('22:15');
  });
});
