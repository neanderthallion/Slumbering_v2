import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useNightRecords } from '../hooks/useNightRecords';
import { AppSettings, NightRecord, NightRecordsMap } from '../types/models';
import { createNightRecord, buildDefaultNightGoals } from './nightRecords';
import { needsDefaultNightPlanFallback } from './selectors';

interface AppDataContextValue {
  settings: AppSettings;
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  records: NightRecordsMap;
  upsertRecord: (record: NightRecord) => void;
  restoreBackup: (settings: AppSettings, records: NightRecordsMap) => void;
  isLoaded: boolean;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings, replaceSettings, isLoaded: settingsLoaded } = useSettings();
  const { records, upsert, replaceRecords, isLoaded: recordsLoaded } = useNightRecords();
  const isLoaded = settingsLoaded && recordsLoaded;

  useEffect(() => {
    if (!isLoaded) return;
    const missingDate = needsDefaultNightPlanFallback(records);
    if (!missingDate) return;
    const goals = buildDefaultNightGoals(settings.defaultNightPlan);
    upsert(createNightRecord(missingDate, goals, 'backfilled', settings.bedtimeSchedule));
  }, [isLoaded, records, settings, upsert]);

  const value: AppDataContextValue = {
    settings,
    updateSettings,
    records,
    upsertRecord: upsert,
    restoreBackup: (nextSettings, nextRecords) => {
      replaceSettings(nextSettings);
      replaceRecords(nextRecords);
    },
    isLoaded,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
