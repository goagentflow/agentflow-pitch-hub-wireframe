/**
 * Mock data for Phase 2: Client Hub features
 *
 * Core data: Projects, Decisions
 * Intelligence data re-exported from: mock-data-intelligence.ts
 * Async job data re-exported from: mock-data-async-jobs.ts
 */

import type {
  Project,
  DecisionItem,
} from "@/types";
import { daysAgo, daysFromNow, mockClientHubId } from "./mock-data-constants";

// Re-export constants for backwards compatibility
export { daysAgo, hoursAgo, daysFromNow, mockClientHubId } from "./mock-data-constants";

// ============================================================================
// Projects
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: "project-1",
    hubId: mockClientHubId,
    name: "Website Redesign",
    description: "Complete overhaul of corporate website with new brand identity",
    status: "active",
    startDate: daysAgo(45),
    targetEndDate: daysFromNow(30),
    lead: "user-staff-1",
    leadName: "Hamish Nicklin",
    milestones: [
      { id: "ms-1", name: "Discovery & Research", targetDate: daysAgo(30), status: "completed", description: "User interviews and competitor analysis" },
      { id: "ms-2", name: "Design System", targetDate: daysAgo(14), status: "completed", description: "Component library and style guide" },
      { id: "ms-3", name: "Development", targetDate: daysFromNow(14), status: "in_progress", description: "Frontend build and CMS integration" },
      { id: "ms-4", name: "Launch", targetDate: daysFromNow(30), status: "not_started", description: "Go-live and monitoring" },
    ],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(1),
    createdBy: "user-staff-1",
  },
  {
    id: "project-2",
    hubId: mockClientHubId,
    name: "Q1 Marketing Campaign",
    description: "Integrated digital campaign for product launch",
    status: "active",
    startDate: daysAgo(21),
    targetEndDate: daysFromNow(60),
    lead: "user-staff-1",
    leadName: "Hamish Nicklin",
    milestones: [
      { id: "ms-5", name: "Strategy & Planning", targetDate: daysAgo(7), status: "completed", description: "Campaign brief and media plan" },
      { id: "ms-6", name: "Creative Development", targetDate: daysFromNow(21), status: "in_progress", description: "Ad creative and landing pages" },
    ],
    createdAt: daysAgo(21),
    updatedAt: daysAgo(2),
    createdBy: "user-staff-1",
  },
];

// ============================================================================
// Decision Queue
// ============================================================================

export const mockDecisions: DecisionItem[] = [
  {
    id: "decision-1",
    hubId: mockClientHubId,
    title: "Approve homepage hero design",
    description: "Final design for the new homepage hero section. Three options presented in the attached document.",
    dueDate: daysFromNow(3),
    requestedBy: "user-staff-1",
    requestedByName: "Hamish Nicklin",
    assignee: "user-client-1",
    assigneeName: "Alex Torres",
    status: "open",
    relatedResource: { type: "document", id: "doc-1" },
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "decision-2",
    hubId: mockClientHubId,
    title: "Sign off on campaign messaging",
    description: "Review and approve the key messaging framework for Q1 campaign.",
    dueDate: daysFromNow(7),
    requestedBy: "user-staff-1",
    requestedByName: "Hamish Nicklin",
    status: "open",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: "decision-3",
    hubId: mockClientHubId,
    title: "Budget allocation for paid media",
    description: "Approve the proposed budget split between channels.",
    requestedBy: "user-staff-1",
    requestedByName: "Hamish Nicklin",
    assignee: "user-client-1",
    assigneeName: "Alex Torres",
    status: "in_review",
    relatedResource: { type: "meeting", id: "meeting-1" },
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
    updatedBy: "user-client-1",
  },
];

// ============================================================================
// Re-exports from split files (backwards compatibility)
// ============================================================================

export {
  mockRelationshipHealth,
  mockExpansionOpportunities,
  mockRiskAlerts,
  mockHistoryEvents,
} from "./mock-data-intelligence";

export {
  mockMeetingPrep,
  mockMeetingFollowUp,
  mockPerformanceNarrative,
  mockInstantAnswers,
} from "./mock-data-async-jobs";
