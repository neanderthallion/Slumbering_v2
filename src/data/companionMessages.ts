/**
 * Message pools per Slumbering.docx's "Home Screen Messages" spec.
 * Each pool is chosen from randomly (date-seeded for stability within a day);
 * an `exclude` value skips that exact string when another option exists, to
 * satisfy "never repeat the same companion message 2 days in a row."
 */

export const GREETING_POOLS = {
  firstTime: ['Welcome'],
  morning: ['Good morning'],
  afternoon: ['Good afternoon'],
  evening: ['Good evening'],
  returning: ['Welcome back'],
} as const;

export const COMPANION_POOLS = {
  firstTime: ['Start with a goal that feels achievable.', 'Ready to begin?'],
  returning: [
    "Let's pick up where you left off.",
    'Glad to see you again.',
    "Your journey is still here whenever you're ready.",
    'Thanks for coming back.',
    "It's never too late to begin again.",
  ],
  streak3to6: ["You're building momentum.", "You're creating a healthy rhythm.", 'Keep it up!'],
  streak7: ['A whole week of consistency.', '7 days of great work!', 'One week strong!'],
  streak30: ['A month-long streak. Amazing work!', '30 days of consistency. Keep it up!'],
  goalStatusAllAchieved: [
    'You kept your promise to yourself tonight.',
    'Another successful night recorded.',
    'Well done. See you tomorrow!',
  ],
  goalStatusPartial: ['Your effort today matters.', 'Every bit of effort counts.', 'Small wins are still wins.'],
  goalStatusNone: ['Tomorrow is another opportunity.'],
  default: [
    'Hope today treats you well.',
    'May tonight be in your favor.',
    "Ready for tonight's goals?",
    "Let's make tonight count.",
    'Thanks for stopping by.',
  ],
} as const;

export const TODAYS_ACTION_POOLS = {
  newUser: ['Set your first sleep goal.'],
  beforeGoals: ['What do you want to try for tonight?', 'How would you like to achieve tonight?'],
  afterGoalsSameDay: ["You're all set for tonight.", 'Good luck!'],
  beforeCheckInNextDay: ['How did last night go?'],
} as const;

function hashString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Date-seeded pick from a pool, skipping `exclude` when another option exists. */
export function pickFromPool(pool: readonly string[], seed: string, exclude?: string): string {
  const candidates = exclude && pool.length > 1 ? pool.filter((m) => m !== exclude) : pool;
  const hash = hashString(seed);
  return candidates[hash % candidates.length];
}

export function majorMilestoneMessage(successfulNights: number): string {
  return `${successfulNights} successful nights!`;
}
