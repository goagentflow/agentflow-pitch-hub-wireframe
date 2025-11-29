/**
 * Mock data for Phase 2: Client Hub features
 *
 * Separate file to keep mock-data.ts under 300 lines.
 * Contains: Projects, Decisions, Relationship Health, Expansion, Risk Alerts, History
 */

import type {
  Project,
  DecisionItem,
  RelationshipHealth,
  ExpansionOpportunity,
  RiskAlert,
  InstitutionalMemoryEvent,
  PerformanceNarrative,
  MeetingPrep,
  MeetingFollowUp,
  InstantAnswerJob,
} from "@/types";

// Date helpers
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

// Mock converted client hub (hub-3 "Meridian Digital" is status: "won")
export const mockClientHubId = "hub-3";

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
// Relationship Health
// ============================================================================

export const mockRelationshipHealth: RelationshipHealth = {
  hubId: mockClientHubId,
  score: 78,
  status: "stable",
  trend: "improving",
  drivers: [
    {
      type: "response_time",
      weight: 0.3,
      excerpt: "Average response time decreased from 48h to 12h over the past month",
      timestamp: daysAgo(1),
    },
    {
      type: "engagement",
      weight: 0.25,
      excerpt: "Client team actively participating in weekly syncs",
      timestamp: daysAgo(3),
    },
    {
      type: "sentiment",
      weight: 0.25,
      excerpt: "Recent communications show positive sentiment around project progress",
      timestamp: daysAgo(2),
    },
    {
      type: "delivery",
      weight: 0.2,
      excerpt: "2 of 3 milestones delivered on time",
      timestamp: daysAgo(7),
    },
  ],
  lastCalculatedAt: hoursAgo(6),
  lastRefreshedAt: hoursAgo(1),
};

// ============================================================================
// Expansion Opportunities
// ============================================================================

export const mockExpansionOpportunities: ExpansionOpportunity[] = [
  {
    id: "expansion-1",
    hubId: mockClientHubId,
    title: "Social Media Management",
    confidence: "high",
    status: "open",
    evidence: [
      {
        id: "ev-1",
        source: "meeting_transcript",
        excerpt: "Alex mentioned they're struggling to maintain consistent posting across channels and considering outsourcing.",
        redacted: false,
        date: daysAgo(7),
      },
      {
        id: "ev-2",
        source: "email",
        excerpt: "In the campaign brief, they noted social media as a gap in their current capabilities.",
        redacted: false,
        date: daysAgo(14),
      },
    ],
    notes: null,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    id: "expansion-2",
    hubId: mockClientHubId,
    title: "Analytics & Reporting",
    confidence: "medium",
    status: "open",
    evidence: [
      {
        id: "ev-3",
        source: "email",
        excerpt: "Client asked about our analytics capabilities during onboarding.",
        redacted: false,
        date: daysAgo(30),
      },
    ],
    notes: null,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
];

// ============================================================================
// Risk Alerts
// ============================================================================

export const mockRiskAlerts: RiskAlert[] = [
  {
    id: "risk-1",
    hubId: mockClientHubId,
    type: "response_delay",
    severity: "medium",
    title: "Slower response times this week",
    description: "Client response time has increased from 12h average to 36h over the past 5 days.",
    driver: "Email response patterns",
    recommendation: "Consider a quick check-in call to ensure everything is on track.",
    createdAt: daysAgo(2),
  },
];

// ============================================================================
// Institutional Memory (History)
// ============================================================================

export const mockHistoryEvents: InstitutionalMemoryEvent[] = [
  {
    id: "history-1",
    hubId: mockClientHubId,
    type: "conversion",
    date: daysAgo(60),
    title: "Became a client",
    description: "Meridian Digital converted from pitch to client after successful proposal review.",
    significance: "high",
  },
  {
    id: "history-2",
    hubId: mockClientHubId,
    type: "milestone",
    date: daysAgo(30),
    title: "Discovery phase completed",
    description: "Website Redesign project discovery and research phase completed on schedule.",
    significance: "medium",
    relatedResourceId: "project-1",
  },
  {
    id: "history-3",
    hubId: mockClientHubId,
    type: "meeting",
    date: daysAgo(14),
    title: "Design review meeting",
    description: "Presented three homepage concepts. Client preferred option B with minor revisions.",
    significance: "medium",
    relatedResourceId: "meeting-1",
  },
  {
    id: "history-4",
    hubId: mockClientHubId,
    type: "decision",
    date: daysAgo(10),
    title: "Color palette approved",
    description: "Client approved the new brand color palette for website redesign.",
    significance: "low",
  },
  {
    id: "history-5",
    hubId: mockClientHubId,
    type: "milestone",
    date: daysAgo(14),
    title: "Design system delivered",
    description: "Component library and style guide completed and handed off to dev team.",
    significance: "high",
    relatedResourceId: "project-1",
  },
];

// ============================================================================
// AI-Generated Content (Async Jobs)
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

// Cache for instant answers (simulates recent answers)
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
