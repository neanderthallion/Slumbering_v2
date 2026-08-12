import { z } from 'zod';

const TimeStringSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const GOAL_CATEGORIES = ['bedtime', 'windDown', 'relaxation', 'custom'] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const NIGHT_SOURCES = ['normal', 'backfilled'] as const;
export type NightSource = (typeof NIGHT_SOURCES)[number];

export const SLEEP_CONFIRMATIONS = ['asPlanned', 'reportedDifferent'] as const;
export type SleepConfirmation = (typeof SLEEP_CONFIRMATIONS)[number];

const ReminderConfigSchema = z.object({ enabled: z.boolean(), time: TimeStringSchema });
export type ReminderConfig = z.infer<typeof ReminderConfigSchema>;

export const SettingsSchema = z.object({
  hasOnboarded: z.boolean(),
  profile: z.object({ displayName: z.string() }),
  theme: z.enum(['light', 'dark']),
  textSize: z.enum(['small', 'medium', 'large']),
  bedtime: TimeStringSchema,
  wakeTime: TimeStringSchema,
  reminders: z.object({
    setGoals: ReminderConfigSchema,
    checkIn: ReminderConfigSchema,
    windDown: z.object({ enabled: z.boolean() }),
  }),
  suggestedGoals: z.object({
    bedtime: z.array(z.string()),
    windDown: z.array(z.string()),
    relaxation: z.array(z.string()),
  }),
  celebratedAchievementIds: z.array(z.string()),
});
export type SettingsState = z.infer<typeof SettingsSchema>;

const NightGoalSchema = z.object({
  goalId: z.string(),
  label: z.string(),
  category: z.enum(GOAL_CATEGORIES),
  achieved: z.boolean().nullable(),
});
export type NightGoal = z.infer<typeof NightGoalSchema>;

export const NightRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goals: z.array(NightGoalSchema),
  goalsSetAt: z.string().nullable(),
  checkInCompletedAt: z.string().nullable(),
  source: z.enum(NIGHT_SOURCES),
  plannedBedtime: TimeStringSchema.nullable(),
  plannedWakeTime: TimeStringSchema.nullable(),
  sleepConfirmation: z.enum(SLEEP_CONFIRMATIONS).nullable(),
  actualBedtime: TimeStringSchema.nullable(),
  actualWakeTime: TimeStringSchema.nullable(),
});
export type NightRecord = z.infer<typeof NightRecordSchema>;

export const RecordsSchema = z.record(z.string(), NightRecordSchema);
export type NightRecordsMap = z.infer<typeof RecordsSchema>;

export const BackupPayloadSchema = z.object({
  exportedAt: z.string(),
  settings: SettingsSchema,
  records: RecordsSchema,
});
export type BackupPayload = z.infer<typeof BackupPayloadSchema>;
