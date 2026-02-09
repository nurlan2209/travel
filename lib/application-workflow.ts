import type { ApplicationStatus } from "@prisma/client";

export const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = ["NEW", "CONTACTED", "GOING"];

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  NEW: ["CONTACTED", "GOING", "NOT_GOING"],
  CONTACTED: ["GOING", "NOT_GOING"],
  GOING: ["NOT_GOING"],
  NOT_GOING: []
};

export function canTransitionApplicationStatus(
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
) {
  return transitions[fromStatus]?.includes(toStatus) ?? false;
}

export function getUtcDayRange(dateInput: Date) {
  const start = new Date(
    Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate(), 0, 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate(), 23, 59, 59, 999)
  );
  return { start, end };
}

export function isDecisionStatus(status: ApplicationStatus) {
  return status === "GOING" || status === "NOT_GOING";
}
