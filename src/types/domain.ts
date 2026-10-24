// Structural shapes here are owned by the zod schemas in lib/schemas.ts (the
// runtime-validated source of truth for persisted state and backup import) --
// re-exported so the rest of the app can import them from one place without
// a second, hand-written copy that could silently drift from the real shape.
import type { GoalCategory, NightRecord } from '../lib/schemas';
export type {
  GoalCategory,
  NightGoal,
  NightSource,
  SleepConfirmation,
  ReminderConfig,
  NightRecord,
  NightRecordsMap,
  SettingsState,
} from '../lib/schemas';

export type ThemeMode = 'light' | 'dark';
export type TextSizeKey = 'small' | 'medium' | 'large';

export type SuggestedGoalCategory = Exclude<GoalCategory, 'custom'>;

export type BadgeId = 'firstStep' | 'fullWeek' | 'oneMonth' | 'welcomeBack' | 'goGetter' | 'fullNight' | 'steadyRhythm';

export type MoonPhase = 'new' | 'crescent' | 'full';

export interface MilestoneEntry {
  type: 'milestone';
  date: string;
  id: string;
  text: string;
}

export interface EngagementMilestoneEntry {
  type: 'engagementMilestone';
  date: string;
  id: string;
  threshold: number;
  text: string;
}

export interface BadgeEntry {
  type: 'badge';
  date: string;
  id: string;
  badgeId: BadgeId;
  text: string;
}

export interface JourneyNightEntry {
  type: 'night';
  record: NightRecord;
}

export type JourneyEntry = MilestoneEntry | JourneyNightEntry | EngagementMilestoneEntry | BadgeEntry;
