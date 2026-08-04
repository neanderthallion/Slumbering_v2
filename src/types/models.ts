export type GoalCategory = 'bedtime' | 'windDown' | 'relaxation' | 'custom';

export interface GoalDefinition {
  id: string;
  category: GoalCategory;
  label: string;
  isCustom: boolean;
}

export interface NightGoal {
  goalId: string;
  label: string;
  category: GoalCategory;
  achieved: boolean | null;
}

export type NightSource = 'normal' | 'backfilled';

export type SleepConfirmation = 'asPlanned' | 'reportedDifferent';

export interface NightRecord {
  date: string; // 'YYYY-MM-DD'
  goals: NightGoal[];
  goalsSetAt: string | null;
  checkInCompletedAt: string | null;
  source: NightSource;
  plannedBedtime: string | null; // 'HH:mm', snapshotted from bedtimeSchedule at goal-set time
  plannedWakeTime: string | null; // 'HH:mm'
  sleepConfirmation: SleepConfirmation | null;
  actualBedtime: string | null; // only set when sleepConfirmation === 'reportedDifferent'
  actualWakeTime: string | null;
}

export type NightRecordsMap = Record<string, NightRecord>;

export type ThemeMode = 'light' | 'dark';
export type AccentKey = 'periwinkle' | 'amber' | 'sage' | 'blush';
export type TextSizeKey = 'small' | 'medium' | 'large';

export interface ReminderConfig {
  enabled: boolean;
  time: string; // 'HH:mm'
  notificationId: string | null;
}

export interface BedtimeSchedule {
  bedtime: string; // 'HH:mm'
  wakeTime: string; // 'HH:mm'
}

export type SuggestedGoalCategory = Exclude<GoalCategory, 'custom'>;

export type BadgeId = 'firstStep' | 'fullWeek' | 'oneMonth' | 'earlyRiser' | 'welcomeBack';

export interface AppSettings {
  hasOnboarded: boolean;
  userName: string;
  themeMode: ThemeMode;
  accent: AccentKey;
  textSize: TextSizeKey;
  defaultNightPlan: string[]; // goal labels
  suggestedGoals: Record<SuggestedGoalCategory, string[]>;
  lastCompanionMessage: { date: string; text: string } | null;
  reminders: {
    setGoals: ReminderConfig;
    checkIn: ReminderConfig;
    windDown: ReminderConfig;
  };
  bedtimeSchedule: BedtimeSchedule;
  celebratedAchievementIds: string[];
}

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
