/**
 * Mock data for async AI-generated jobs
 *
 * Contains: Meeting Prep, Meeting Follow-Up, Performance Narrative, Instant Answers
 */

import type {
  MeetingPrep,
  MeetingFollowUp,
  PerformanceNarrative,
  InstantAnswerJob,
} from "@/types";
import { mockClientHubId, daysAgo, daysFromNow, hoursAgo } from "./mock-data-constants";

// ============================================================================
// Meeting Intelligence
// ============================================================================

export const mockMeetingPrep: MeetingPrep = {
  meetingId: "meeting-2",
  status: "ready",
  summary: "Weekly sync to review website development progress and discuss upcoming launch timeline.",
  sinceLastMeeting: [
    "Development sprint 2 completed - 8 of 10 planned components built",
    "Client approved hero section design (decision-1 closed)",
    "Minor delay on CMS integration due to API changes",
  ],
  decisionsNeeded: [
    "Confirm launch date: March 15 or delay to March 22?",
    "Approve final copy for About page",
  ],
  generatedAt: hoursAgo(2),
  createdAt: hoursAgo(2),
  expiresAt: daysFromNow(1),
  pollIntervalHint: 2000,
};

export const mockMeetingFollowUp: MeetingFollowUp = {
  meetingId: "meeting-1",
  status: "ready",
  summary: "Productive design review. Client selected homepage option B with modifications to the CTA placement.",
  agreedActions: [
    "Hamish to revise CTA placement by EOD Friday",
    "Alex to gather internal feedback on color adjustments",
    "Schedule dev handoff for next Tuesday",
  ],
  decisions: [
    "Homepage design: Option B approved with CTA moved above the fold",
    "Mobile-first approach confirmed for development",
  ],
  generatedAt: daysAgo(14),
  createdAt: daysAgo(14),
  expiresAt: daysAgo(7),
  pollIntervalHint: 2000,
};

// ============================================================================
// Performance Narrative
// ============================================================================

export const mockPerformanceNarrative: PerformanceNarrative = {
  id: "perf-1",
  hubId: mockClientHubId,
  projectId: "project-1",
  period: "November 2025",
  status: "ready",
  summaries: [
    "Website Redesign project is tracking well with 2 of 4 milestones completed on schedule.",
    "Development phase is 60% complete with no major blockers identified.",
    "Client engagement has been strong with timely feedback on design deliverables.",
  ],
  recommendations: [
    "Consider adding buffer time for QA given upcoming holiday period.",
    "Schedule stakeholder preview session before final launch.",
  ],
  generatedAt: daysAgo(1),
  createdAt: daysAgo(1),
  expiresAt: daysFromNow(6),
  pollIntervalHint: 2000,
};

// ============================================================================
// Instant Answers
// ============================================================================

export const mockInstantAnswers: InstantAnswerJob[] = [
  {
    id: "answer-1",
    hubId: mockClientHubId,
    question: "When is the website launching?",
    answer: "The website is scheduled to launch on March 15, 2025, pending final sign-off on the About page copy and completion of QA testing.",
    source: "Project timeline and recent meeting notes",
    confidence: "high",
    evidence: [
      {
        id: "ev-ans-1",
        source: "meeting_transcript",
        excerpt: "Launch date confirmed as March 15 during the planning session.",
        redacted: false,
        date: daysAgo(14),
      },
    ],
    status: "ready",
    createdAt: hoursAgo(4),
    completedAt: hoursAgo(4),
    expiresAt: daysFromNow(1),
    pollIntervalHint: 2000,
  },
];
