import { COPY, fmt } from '../../../copy';

export function majorMilestoneMessage(successfulNights: number): string {
  return fmt(COPY.journey.majorMilestone, { count: successfulNights });
}

export function engagementMilestoneMessage(engagedNights: number): string {
  if (engagedNights === 1) return COPY.journey.engagementFirst;
  return fmt(COPY.journey.engagementMany, { count: engagedNights });
}
