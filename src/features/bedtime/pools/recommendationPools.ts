export const RECOMMENDATION_POOLS = {
  duration: [
    'Teenagers generally need 8-10 hours of sleep each night to support healthy growth and learning.',
    'Getting enough sleep (8-10 hours a day) can help you feel more focused, energized, and ready for the day.',
    'Sticking to a regular pre-sleep routine can make a meaningful difference.',
  ],
  regularity: [
    'Try to go to bed and wake up at similar times each day, including weekends.',
    'A consistent sleep schedule helps your body maintain a healthy internal clock.',
    'Keeping your sleep times regular can make it easier to fall asleep and wake up naturally.',
  ],
  bedtime: [
    'Going to bed earlier can give your body more time to get the restorative sleep it needs.',
    'An earlier bedtime is often associated with better sleep habits and overall health.',
    'Moving your bedtime earlier gradually can be an easy way to improve your sleep routine.',
  ],
  wakeUp: [
    'Waking up at a consistent time can help your body establish a steady rhythm.',
    'Getting some morning sunlight can help reset your body clock and support better sleep at night.',
    'Give yourself enough time to wake up without rushing so you can start your day feeling refreshed.',
  ],
  tips: [
    'Put away your phone and other screens at least 30 minutes before bed.',
    'Keep your bedroom cool, quiet, comfortable, and as dark as possible.',
    'Avoid caffeine in the afternoon and evening to make falling asleep easier.',
    'Wind down with a relaxing activity such as reading, stretching, or listening to calm music.',
    'Give yourself a little time to relax before bed instead of going straight from work to sleep.',
  ],
} as const;

export type RecommendationCategory = keyof typeof RECOMMENDATION_POOLS;
