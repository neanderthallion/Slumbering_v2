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

export interface NightRecord {
  date: string; // 'YYYY-MM-DD'
  goals: NightGoal[];
  goalsSetAt: string | null;
  checkInCompletedAt: string | null;
  source: NightSource;
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

export interface AlarmConfig {
  sound: 'Morning Xylophone' | 'Gentle Chimes' | 'Ocean Drift';
  vibration: 'Standard' | 'Gentle' | 'Off';
  snoozeCount: number;
  snoozeIntervalMinutes: number;
}

export interface SleepModeToggles {
  darkMode: boolean;
  doNotDisturb: boolean;
  lowerBrightness: boolean;
  silenceNotifications: boolean;
  turnOffAlwaysOnDisplay: boolean;
}

export interface SleepModeConfig {
  manualActive: boolean;
  autoActivated: boolean;
  bedtime: string; // 'HH:mm'
  wakeTime: string; // 'HH:mm'
  daysOfWeek: boolean[]; // length 7, Mon..Sun
  toggles: SleepModeToggles;
  alarm: AlarmConfig;
  activatedAt: string | null; // ISO, set when Sleep Mode actually turns on
  previousBrightness: number | null;
  previousThemeMode: ThemeMode | null;
}

export type SuggestedGoalCategory = Exclude<GoalCategory, 'custom'>;

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
  };
  sleepMode: SleepModeConfig;
  backup: {
    dropboxConnected: boolean;
  };
}

export type MoonPhase = 'new' | 'crescent' | 'full';

export interface MilestoneEntry {
  type: 'milestone';
  date: string;
  text: string;
}

export interface JourneyNightEntry {
  type: 'night';
  record: NightRecord;
}

export type JourneyEntry = MilestoneEntry | JourneyNightEntry;
