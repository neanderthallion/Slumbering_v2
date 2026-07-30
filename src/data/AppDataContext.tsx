import React, { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useNightRecords } from '../hooks/useNightRecords';
import { AppSettings, NightRecord, NightRecordsMap } from '../types/models';

interface AppDataContextValue {
  settings: AppSettings;
  updateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  records: NightRecordsMap;
  upsertRecord: (record: NightRecord) => void;
  isLoaded: boolean;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings, isLoaded: settingsLoaded } = useSettings();
  const { records, upsert, isLoaded: recordsLoaded } = useNightRecords();

  const value: AppDataContextValue = {
    settings,
    updateSettings,
    records,
    upsertRecord: upsert,
    isLoaded: settingsLoaded && recordsLoaded,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
