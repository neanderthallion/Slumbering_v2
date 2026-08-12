export const CHECKIN_COPY = {
  headlineAskSleep: 'How did last night go?',
  headlineGoals: 'Did you achieve your goals?',
  askedSleptAsPlanned: (plannedBedtime: string, plannedWakeTime: string) =>
    `Did you sleep from ${plannedBedtime} to ${plannedWakeTime}?`,
  reportActualTimes: 'What time did you actually sleep and wake up?',
};
