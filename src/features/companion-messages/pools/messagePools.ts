export const HOME_MESSAGE_POOLS = {
  firstTime: ['Start with a goal that feels achievable.', 'Ready to begin?'],
  returning: [
    "Let's pick up where you left off.",
    'Glad to see you again.',
    'Your journey is still here whenever you’re ready.',
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
