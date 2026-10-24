import { NightRecord, NightRecordsMap } from '../../../types/domain';
import { sortedRecords } from '../../goals/logic/nightGoals';
import { addDays, todayKey } from '../../../lib/dateMath';

export function isFullyAchieved(record: NightRecord): boolean {
  return record.goals.length > 0 && record.goals.every((g) => g.achieved === true);
}

export function checkedInRecords(records: NightRecordsMap): NightRecord[] {
  return sortedRecords(records).filter((r) => r.checkInCompletedAt != null);
}

function isOpenRecord(record: NightRecord | undefined): record is NightRecord {
  return !!record && record.goals.length > 0 && record.checkInCompletedAt == null;
}

/**
 * Goals set tonight are meant to be checked in tomorrow morning, so an
 * unfinished check-in can still be sitting under yesterday's date key once
 * the calendar day rolls over. Looks back exactly one day (never further),
 * matching the "tonight's goals card stays until the next morning" scope --
 * it should not linger indefinitely if the user skips a check-in entirely.
 */
export function findOpenRecord(records: NightRecordsMap, todayStr: string = todayKey()): NightRecord | undefined {
  const today = records[todayStr];
  if (isOpenRecord(today)) return today;
  const yesterday = records[addDays(todayStr, -1)];
  if (isOpenRecord(yesterday)) return yesterday;
  return undefined;
}
