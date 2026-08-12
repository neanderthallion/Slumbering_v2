import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * New, zustand-`persist`-enveloped storage keys. Kept distinct from the old
 * bare-JSON `slumbering.settings.v1`/`slumbering.nightRecords.v1` keys
 * (written by the pre-rebuild Context/AsyncStorage layer) so a stored blob's
 * format is unambiguous from its key name alone -- `persist` wraps state as
 * `{"state": {...}, "version": N}`, which the old bare `JSON.stringify`
 * blobs are not, so pointing `persist` at the same key would silently fail
 * to hydrate a returning user's existing data. See `migrateLegacyStorage`.
 */
export const STORAGE_KEYS = {
  settingsLegacyV1: 'slumbering.settings.v1',
  recordsLegacyV1: 'slumbering.nightRecords.v1',
  settingsV2: 'slumbering.settings.v2',
  recordsV2: 'slumbering.nightRecords.v2',
  /**
   * Dedicated sentinel, separate from `settingsV2`'s mere existence: the
   * settings store's own `persist` middleware writes a (default-valued) blob
   * to `settingsV2` the moment ANY `set()` call happens post-hydration --
   * including the store's own `hasHydrated` marker update -- which can race
   * ahead of `migrateLegacyStorage`'s check and make it look like migration
   * already ran. This key is only ever written by `migrateLegacyStorage`
   * itself, once it has actually finished (or confirmed there was nothing to
   * migrate), so it can't be pre-empted by unrelated store writes.
   */
  migrationDone: 'slumbering.migration.v1.done',
} as const;

export const asyncStorageAdapter = createJSONStorage(() => AsyncStorage);
