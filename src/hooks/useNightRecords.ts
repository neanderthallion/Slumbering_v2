import { useCallback, useEffect, useState } from 'react';
import { NightRecord, NightRecordsMap } from '../types/models';
import { loadNightRecords, saveNightRecords, upsertNightRecord, normalizeNightRecord } from '../data/nightRecords';

export function useNightRecords() {
  const [records, setRecords] = useState<NightRecordsMap>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadNightRecords().then((loaded) => {
      if (mounted) {
        setRecords(loaded);
        setIsLoaded(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const upsert = useCallback((record: NightRecord) => {
    setRecords((prev) => {
      const next = upsertNightRecord(prev, record);
      saveNightRecords(next);
      return next;
    });
  }, []);

  const replaceRecords = useCallback((next: NightRecordsMap) => {
    // Normalize so a backup exported before a NightRecord field existed doesn't restore into a broken state.
    const normalized: NightRecordsMap = {};
    for (const [date, record] of Object.entries(next)) normalized[date] = normalizeNightRecord(record);
    setRecords(normalized);
    saveNightRecords(normalized);
  }, []);

  return { records, isLoaded, upsert, replaceRecords };
}
