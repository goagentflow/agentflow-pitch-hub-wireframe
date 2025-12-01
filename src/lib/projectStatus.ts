/**
 * Project status helper - derives display status from project/milestone data
 *
 * All date parameters expect ISO 8601 timestamp strings.
 * Date comparisons use local time semantics.
 *
 * Status logic:
 * - Delayed: Project targetEndDate is past OR any milestone is "missed" OR overdue
 * - At Risk: Any milestone is near-due (within NEAR_DUE_DAYS) and not completed
 * - On Track: Everything looks good
 */

import type { Project, ProjectMilestone } from "@/types";

export type ProjectDisplayStatus = "on_track" | "at_risk" | "delayed";

export interface ProjectStatusResult {
  status: ProjectDisplayStatus;
  label: string;
  description?: string;
}

/** Days threshold for "near-due" warning. Exported for UI display. */
export const NEAR_DUE_DAYS = 7;

/**
 * Check if a date is in the past (expects ISO timestamp)
 */
function isPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Check if a date is within N days from now (expects ISO timestamp)
 */
function isWithinDays(dateString: string, days: number): boolean {
  const targetDate = new Date(dateString);
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return targetDate > now && targetDate <= futureDate;
}

/**
 * Sort milestones by targetDate for deterministic processing
 */
function sortByTargetDate(milestones: ProjectMilestone[]): ProjectMilestone[] {
  return [...milestones].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );
}

/**
 * Derive project display status from project data and milestones
 */
export function getProjectDisplayStatus(project: Project): ProjectStatusResult {
  const { status, targetEndDate, milestones } = project;

  // Completed projects
  if (status === "completed") {
    return {
      status: "on_track",
      label: "Completed",
      description: "Project has been completed",
    };
  }

  // Cancelled projects
  if (status === "cancelled") {
    return {
      status: "on_track",
      label: "Cancelled",
      description: "Project has been cancelled",
    };
  }

  // On hold is a special case - show as at risk
  if (status === "on_hold") {
    return {
      status: "at_risk",
      label: "On Hold",
      description: "Project is currently paused",
    };
  }

  // Check for missed milestones → Delayed
  const hasMissedMilestone = milestones.some((m) => m.status === "missed");
  if (hasMissedMilestone) {
    return {
      status: "delayed",
      label: "Delayed",
      description: "One or more milestones have been missed",
    };
  }

  // Check if project end date is past → Delayed
  if (targetEndDate && isPast(targetEndDate)) {
    return {
      status: "delayed",
      label: "Delayed",
      description: "Project is past its target end date",
    };
  }

  // Check for overdue milestones (target date past, not completed) → Delayed
  const hasOverdueMilestone = milestones.some(
    (m) => m.status !== "completed" && isPast(m.targetDate)
  );
  if (hasOverdueMilestone) {
    return {
      status: "delayed",
      label: "Delayed",
      description: "One or more milestones are overdue",
    };
  }

  // Check for near-due milestones (within NEAR_DUE_DAYS, not completed) → At Risk
  const hasNearDueMilestone = milestones.some(
    (m) => m.status !== "completed" && isWithinDays(m.targetDate, NEAR_DUE_DAYS)
  );
  if (hasNearDueMilestone) {
    return {
      status: "at_risk",
      label: "At Risk",
      description: `Milestone due within ${NEAR_DUE_DAYS} days`,
    };
  }

  // Default: On Track
  return {
    status: "on_track",
    label: "On Track",
    description: "Project is progressing as expected",
  };
}

/**
 * Get milestone display status
 */
export function getMilestoneDisplayStatus(
  milestone: ProjectMilestone
): ProjectStatusResult {
  const { status, targetDate } = milestone;

  if (status === "completed") {
    return { status: "on_track", label: "Completed" };
  }

  if (status === "missed") {
    return { status: "delayed", label: "Missed" };
  }

  if (isPast(targetDate)) {
    return { status: "delayed", label: "Overdue" };
  }

  if (isWithinDays(targetDate, NEAR_DUE_DAYS)) {
    return { status: "at_risk", label: "Due Soon" };
  }

  if (status === "in_progress") {
    return { status: "on_track", label: "In Progress" };
  }

  return { status: "on_track", label: "Not Started" };
}

/**
 * Calculate project progress percentage based on milestones
 */
export function calculateProjectProgress(milestones: ProjectMilestone[]): number {
  if (milestones.length === 0) return 0;

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  return Math.round((completedCount / milestones.length) * 100);
}

/**
 * Get the current milestone (first in_progress, or first not_started by date)
 * Milestones are sorted by targetDate for deterministic behavior.
 */
export function getCurrentMilestone(
  milestones: ProjectMilestone[]
): ProjectMilestone | undefined {
  const sorted = sortByTargetDate(milestones);
  return (
    sorted.find((m) => m.status === "in_progress") ||
    sorted.find((m) => m.status === "not_started")
  );
}

/**
 * Get the next upcoming milestone after the current one.
 * Falls back to first future incomplete milestone if no current milestone.
 * Milestones are sorted by targetDate for deterministic behavior.
 */
export function getNextMilestone(
  milestones: ProjectMilestone[]
): ProjectMilestone | undefined {
  const sorted = sortByTargetDate(milestones);
  const current = getCurrentMilestone(milestones);

  if (!current) {
    // Fallback: return first future incomplete milestone
    return sorted.find((m) => m.status !== "completed" && !isPast(m.targetDate));
  }

  const currentIndex = sorted.findIndex((m) => m.id === current.id);
  return sorted.slice(currentIndex + 1).find((m) => m.status !== "completed");
}

/**
 * Format days until date as human-readable string (expects ISO timestamp)
 */
export function formatDaysUntil(dateString: string): string {
  const targetDate = new Date(dateString);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return absDays === 1 ? "1 day overdue" : `${absDays} days overdue`;
  }
  if (diffDays === 0) {
    return "Due today";
  }
  if (diffDays === 1) {
    return "Due tomorrow";
  }
  return `${diffDays} days`;
}
