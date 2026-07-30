import { NightRecord, NightRecordsMap, NightGoal, NightSource } from '../types/models';
import { storage } from './storage';

export async function loadNightRecords(): Promise<NightRecordsMap> {
  const stored = await storage.readJson<NightRecordsMap>(storage.keys.nightRecords);
  return stored ?? {};
}

export async function saveNightRecords(records: NightRecordsMap): Promise<void> {
  await storage.writeJson(storage.keys.nightRecords, records);
}

export function createNightRecord(
  date: string,
  goals: NightGoal[],
  source: NightSource = 'normal'
): NightRecord {
  return {
    date,
    goals,
    goalsSetAt: new Date().toISOString(),
    checkInCompletedAt: null,
    source,
  };
}

export function upsertNightRecord(map: NightRecordsMap, record: NightRecord): NightRecordsMap {
  return { ...map, [record.date]: record };
}

export function sortedRecords(map: NightRecordsMap): NightRecord[] {
  return Object.values(map).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
