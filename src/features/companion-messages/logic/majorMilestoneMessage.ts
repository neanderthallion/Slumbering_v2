export function majorMilestoneMessage(successfulNights: number): string {
  return `${successfulNights} successful nights!`;
}

export function engagementMilestoneMessage(engagedNights: number): string {
  if (engagedNights === 1) return 'First night on Slumbering.';
  return `${engagedNights} nights of showing up for yourself.`;
}
