import { NightGoal, NightRecord, NightRecordsMap, NightSource } from '../../../types/domain';

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

export function createNightRecord(
  date: string,
  goals: NightGoal[],
  source: NightSource = 'normal',
  plannedSchedule?: { bedtime: string; wakeTime: string } | null
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

export function sortedRecords(map: NightRecordsMap): NightRecord[] {
  return Object.values(map).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
