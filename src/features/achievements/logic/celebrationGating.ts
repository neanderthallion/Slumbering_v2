import { BadgeId, NightRecordsMap } from '../../../types/domain';
import { todayKey } from '../../../lib/dateMath';
import { computeEngagementMilestones } from '../../journey/logic/milestones';
import { computeBadgeUnlocks } from './badgeUnlocks';

export type AchievementCategory = 'engagementMilestone' | 'badge';

export interface AchievementUnlock {
  id: string;
  date: string;
  category: AchievementCategory;
  text: string;
  /** Present only when category === 'badge' — lets the celebration modal show real badge art/description. */
  badgeId?: BadgeId;
}

/**
 * Engagement milestones + badges only — the existing fully-achieved-nights
 * milestone track keeps its current companion-message-only behavior and is
 * deliberately not part of the celebration system.
 */
export function computeCelebratableUnlocks(records: NightRecordsMap): AchievementUnlock[] {
  const engagement = computeEngagementMilestones(records).map((m) => ({
    id: m.id,
    date: m.date,
    category: 'engagementMilestone' as const,
    text: m.text,
  }));
  const badges = computeBadgeUnlocks(records).map((b) => ({
    id: b.id,
    date: b.date,
    category: 'badge' as const,
    text: b.text,
    badgeId: b.badgeId,
  }));
  return [...engagement, ...badges];
}

/**
 * Only unlocks dated today are eligible to celebrate. Without this, a user
 * with existing history would have their entire past re-scanned the first
 * time this ships and see every already-crossed threshold fire at once
 * (celebratedIds starts empty for everyone). Anything earned on a past date
 * still appears quietly in the Journey timeline — it just never pops up.
 */
export function detectNewlyUnlocked(
  records: NightRecordsMap,
  celebratedIds: string[],
  todayStr: string = todayKey()
): AchievementUnlock[] {
  const celebrated = new Set(celebratedIds);
  return computeCelebratableUnlocks(records).filter((u) => u.date === todayStr && !celebrated.has(u.id));
}
