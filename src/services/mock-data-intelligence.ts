/**
 * Mock data for intelligence features
 *
 * Contains: Relationship Health, Expansion Opportunities, Risk Alerts, Institutional Memory
 */

import type {
  RelationshipHealth,
  ExpansionOpportunity,
  RiskAlert,
  InstitutionalMemoryEvent,
} from "@/types";
import { mockClientHubId, daysAgo, hoursAgo } from "./mock-data-constants";

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
      type: "engagement_level",
      weight: 0.25,
      excerpt: "Client team actively participating in weekly syncs",
      timestamp: daysAgo(3),
    },
    {
      type: "email_sentiment",
      weight: 0.25,
      excerpt: "Recent communications show positive sentiment around project progress",
      timestamp: daysAgo(2),
    },
    {
      type: "project_delivery",
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
