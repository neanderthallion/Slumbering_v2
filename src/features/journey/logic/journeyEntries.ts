import { NightRecord, NightRecordsMap, MoonPhase, JourneyEntry } from '../../../types/domain';
import { addDays, todayKey } from '../../../lib/dateMath';
import { checkedInRecords, isFullyAchieved } from './shared';
import { computeMilestones, computeEngagementMilestones } from './milestones';
import { computeLongestStreak } from './streak';

export function getMoonPhase(record: NightRecord | undefined): MoonPhase {
  if (!record || record.goals.length === 0) return 'new';
  const achievedCount = record.goals.filter((g) => g.achieved === true).length;
  if (achievedCount === 0) return 'new';
  if (achievedCount === record.goals.length) return 'full';
  return 'crescent';
}

const JOURNEY_EXTRA_ORDER: JourneyEntry['type'][] = ['milestone', 'engagementMilestone'];

/** Badges are shown in their own Journey section (not the timeline) — see features/achievements/logic/badgeUnlocks.ts. */
export function buildJourneyEntries(records: NightRecordsMap): JourneyEntry[] {
  const sorted = checkedInRecords(records);
  const extrasByDate = new Map<string, JourneyEntry[]>();
  function pushExtra(date: string, entry: JourneyEntry) {
    const list = extrasByDate.get(date) ?? [];
    list.push(entry);
    extrasByDate.set(date, list);
  }

  for (const m of computeMilestones(records)) pushExtra(m.date, { type: 'milestone', date: m.date, id: m.id, text: m.text });
  for (const m of computeEngagementMilestones(records)) {
    pushExtra(m.date, { type: 'engagementMilestone', date: m.date, id: m.id, threshold: m.threshold, text: m.text });
  }

  const entries: JourneyEntry[] = [];
  for (const record of sorted) {
    entries.push({ type: 'night', record });
    const extras = extrasByDate.get(record.date);
    if (extras) {
      extras.sort((a, b) => JOURNEY_EXTRA_ORDER.indexOf(a.type as never) - JOURNEY_EXTRA_ORDER.indexOf(b.type as never));
      entries.push(...extras);
    }
  }
  return entries.reverse();
}

export interface PastNightSummary {
  date: string;
  phase: MoonPhase;
}

/** Past 7 calendar days (including today), oldest first. Days with no record show as 'new'. */
export function lastSevenNights(records: NightRecordsMap): PastNightSummary[] {
  const days: PastNightSummary[] = [];
  let cursor = todayKey();
  for (let i = 0; i < 7; i++) {
    days.unshift({ date: cursor, phase: getMoonPhase(records[cursor]) });
    cursor = addDays(cursor, -1);
  }
  return days;
}

/** Checked-in records within the same trailing 7-day window as lastSevenNights, for scoping stats like strongestCategoryFor to the Home journey preview. */
export function recordsInLastSevenDays(records: NightRecordsMap): NightRecord[] {
  const startDate = addDays(todayKey(), -6);
  return checkedInRecords(records).filter((r) => r.date >= startDate);
}

export interface AllTimeStats {
  nightsLogged: number;
  successfulNights: number;
  successRate: number; // 0..1
  longestStreak: number;
}

/** All-time totals across the full app history, for the Journey screen's summary card. */
export function computeAllTimeStats(records: NightRecordsMap): AllTimeStats {
  const checkedIn = checkedInRecords(records);
  const nightsLogged = checkedIn.length;
  const successfulNights = checkedIn.filter(isFullyAchieved).length;
  return {
    nightsLogged,
    successfulNights,
    successRate: nightsLogged > 0 ? successfulNights / nightsLogged : 0,
    longestStreak: computeLongestStreak(records),
  };
}
