import { useCallback, useEffect, useState } from 'react';
import { NightRecord, NightRecordsMap } from '../types/models';
import { loadNightRecords, saveNightRecords, upsertNightRecord } from '../data/nightRecords';

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

  return { records, isLoaded, upsert };
}
