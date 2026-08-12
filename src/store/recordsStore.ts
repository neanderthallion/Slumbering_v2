import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NightRecord, NightRecordsMap, RecordsSchema } from '../lib/schemas';
import { normalizeNightRecord } from '../features/goals/logic/nightGoals';
import { STORAGE_KEYS, asyncStorageAdapter } from './persist';

interface RecordsStore {
  records: NightRecordsMap;
  hasHydrated: boolean;
  upsertRecord: (record: NightRecord) => void;
  deleteRecord: (date: string) => void;
  restoreRecords: (next: NightRecordsMap) => void;
}

export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      records: {},
      hasHydrated: false,
      upsertRecord: (record) => set((s) => ({ records: { ...s.records, [record.date]: record } })),
      deleteRecord: (date) =>
        set((s) => {
          const { [date]: _removed, ...rest } = s.records;
          return { records: rest };
        }),
      restoreRecords: (next) => set({ records: next }),
    }),
    {
      name: STORAGE_KEYS.recordsV2,
      storage: asyncStorageAdapter,
      version: 1,
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      migrate: (persisted) => {
        const raw = (persisted as { records?: Record<string, NightRecord> } | undefined)?.records ?? {};
        const records: NightRecordsMap = {};
        for (const [date, record] of Object.entries(raw)) records[date] = normalizeNightRecord(record);
        return { records };
      },
      merge: (persisted, current) => {
        const raw = (persisted as { records?: unknown } | undefined)?.records;
        // A corrupted or partially-written persisted blob must not spread invalid data into
        // live state on a normal boot -- fall back to an empty map, same as legacy migration does.
        const parsed = RecordsSchema.safeParse(raw ?? {});
        return { ...current, records: parsed.success ? parsed.data : current.records };
      },
      onRehydrateStorage: () => () => {
        useRecordsStore.setState({ hasHydrated: true });
      },
    }
  )
);

