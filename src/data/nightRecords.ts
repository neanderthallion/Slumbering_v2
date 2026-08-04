import { NightRecord, NightRecordsMap, NightGoal, NightSource, BedtimeSchedule } from '../types/models';
import { storage } from './storage';
import { makeId } from '../utils/id';

/** Fills in fields added after a record may have been stored, so legacy JSON never yields `undefined` where `string | null` is expected. */
export function normalizeNightRecord(record: NightRecord): NightRecord {
  return {
    ...record,
    plannedBedtime: record.plannedBedtime ?? null,
    plannedWakeTime: record.plannedWakeTime ?? null,
    sleepConfirmation: record.sleepConfirmation ?? null,
    actualBedtime: record.actualBedtime ?? null,
    actualWakeTime: record.actualWakeTime ?? null,
  };
}

export async function loadNightRecords(): Promise<NightRecordsMap> {
  const stored = await storage.readJson<NightRecordsMap>(storage.keys.nightRecords);
  if (!stored) return {};
  const normalized: NightRecordsMap = {};
  for (const [date, record] of Object.entries(stored)) {
    normalized[date] = normalizeNightRecord(record);
  }
  return normalized;
}

export async function saveNightRecords(records: NightRecordsMap): Promise<void> {
  await storage.writeJson(storage.keys.nightRecords, records);
}

export function createNightRecord(
  date: string,
  goals: NightGoal[],
  source: NightSource = 'normal',
  plannedSchedule?: BedtimeSchedule | null
): NightRecord {
  return {
    date,
    goals,
    goalsSetAt: new Date().toISOString(),
    checkInCompletedAt: null,
    source,
    plannedBedtime: plannedSchedule?.bedtime ?? null,
    plannedWakeTime: plannedSchedule?.wakeTime ?? null,
    sleepConfirmation: null,
    actualBedtime: null,
    actualWakeTime: null,
  };
}

export function buildDefaultNightGoals(defaultNightPlan: string[]): NightGoal[] {
  return defaultNightPlan.map((label) => ({ goalId: makeId('goal'), label, category: 'custom', achieved: null }));
}

export function upsertNightRecord(map: NightRecordsMap, record: NightRecord): NightRecordsMap {
  return { ...map, [record.date]: record };
}

export function sortedRecords(map: NightRecordsMap): NightRecord[] {
  return Object.values(map).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
