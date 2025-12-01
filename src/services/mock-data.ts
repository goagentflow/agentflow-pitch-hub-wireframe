/**
 * Mock data for development and demos
 *
 * Core data: Users, Hubs, Hub Overview, Portal Config, Activity
 * Content data re-exported from: mock-data-content.ts
 * Engagement data re-exported from: mock-data-engagement.ts
 */

import type {
  Hub,
  User,
  HubOverview,
  HubAlert,
  EngagementStats,
  PortalConfig,
  ActivityFeedItem,
} from "@/types";

// Current date helpers
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

// ============================================================================
// Users
// ============================================================================

export const mockStaffUser: User = {
  id: "user-staff-1",
  email: "hamish@goagentflow.com",
  displayName: "Hamish Nicklin",
  role: "staff",
  permissions: {
    isAdmin: true,
    canConvertHubs: true,
    canViewAllHubs: true,
  },
  tenantId: "agentflow-tenant-id",
  domain: "goagentflow.com",
};

export const mockClientUser: User = {
  id: "user-client-1",
  email: "sarah@whitmorelaw.co.uk",
  displayName: "Sarah Mitchell",
  role: "client",
  permissions: {
    isAdmin: false,
    canConvertHubs: false,
    canViewAllHubs: false,
  },
  tenantId: "whitmore-tenant-id",
  domain: "whitmorelaw.co.uk",
};

// Client user for Client Hub (Meridian Digital) - tests Phase 2 client features
export const mockClientHubUser: User = {
  id: "user-client-2",
  email: "alex@meridiandigital.co",
  displayName: "Alex Torres",
  role: "client",
  permissions: {
    isAdmin: false,
    canConvertHubs: false,
    canViewAllHubs: false,
  },
  tenantId: "meridian-tenant-id",
  domain: "meridiandigital.co",
};

// ============================================================================
// Hubs
// ============================================================================

export const mockHubs: Hub[] = [
  {
    id: "hub-1",
    companyName: "Whitmore & Associates",
    contactName: "Sarah Mitchell",
    contactEmail: "sarah@whitmorelaw.co.uk",
    status: "active",
    hubType: "pitch",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
    lastActivity: hoursAgo(2),
    clientsInvited: 3,
    lastVisit: hoursAgo(2),
    clientDomain: "whitmorelaw.co.uk",
  },
  {
    id: "hub-2",
    companyName: "Hartley Grant Partners",
    contactName: "John Chen",
    contactEmail: "john@hartleygrant.com",
    status: "draft",
    hubType: "pitch",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    lastActivity: daysAgo(1),
    clientsInvited: 0,
    lastVisit: null,
    clientDomain: "hartleygrant.com",
  },
  {
    id: "hub-3",
    companyName: "Meridian Digital",
    contactName: "Alex Torres",
    contactEmail: "alex@meridiandigital.co",
    status: "won",
    hubType: "client",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(14),
    lastActivity: daysAgo(14),
    clientsInvited: 5,
    lastVisit: daysAgo(14),
    clientDomain: "meridiandigital.co",
  },
  {
    id: "hub-4",
    companyName: "Ashford Consulting",
    contactName: "Emma Davies",
    contactEmail: "emma@ashfordconsulting.com",
    status: "active",
    hubType: "pitch",
    createdAt: daysAgo(21),
    updatedAt: daysAgo(3),
    lastActivity: daysAgo(3),
    clientsInvited: 2,
    lastVisit: daysAgo(5),
    clientDomain: "ashfordconsulting.com",
  },
  {
    id: "hub-5",
    companyName: "Clearwater IT Solutions",
    contactName: "Marcus Webb",
    contactEmail: "marcus@clearwaterit.co.uk",
    status: "lost",
    hubType: "pitch",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
    lastActivity: daysAgo(10),
    clientsInvited: 1,
    lastVisit: daysAgo(12),
    clientDomain: "clearwaterit.co.uk",
  },
];

// ============================================================================
// Hub Overview & Portal Config
// ============================================================================

export const mockHubOverview: HubOverview = {
  hub: mockHubs[0],
  alerts: [
    {
      id: "alert-1",
      type: "proposal_viewed",
      title: "Sarah viewed the proposal",
      description: "Spent 12 minutes reviewing slides 1-8",
      createdAt: hoursAgo(2),
      isRead: false,
    },
    {
      id: "alert-2",
      type: "message_received",
      title: "New message from Sarah",
      description: "Question about timeline on slide 15",
      createdAt: hoursAgo(5),
      isRead: false,
    },
  ] as HubAlert[],
  internalNotes: "Key decision maker is Sarah. Budget approved for Q1. Focus on creative capabilities.",
  engagementStats: {
    totalViews: 47,
    uniqueVisitors: 3,
    avgTimeSpent: 720,
    lastVisit: hoursAgo(2),
    proposalViews: 12,
    documentDownloads: 5,
    videoWatchTime: 1800,
  } as EngagementStats,
};

export const mockPortalConfig: PortalConfig = {
  hubId: "hub-1",
  isPublished: true,
  welcomeHeadline: "Welcome to Your AgentFlow Hub",
  welcomeMessage: "We're excited to share our proposal with you. Explore the materials below and let us know if you have any questions.",
  heroContentType: "video",
  heroContentId: "video-1",
  sections: {
    showProposal: true,
    showVideos: true,
    showDocuments: true,
    showMessages: true,
    showMeetings: true,
    showQuestionnaire: true,
  },
};

// ============================================================================
// Activity Feed (per-hub)
// ============================================================================

// Hub-1 (Whitmore & Associates - Pitch Hub)
const hub1Activity: ActivityFeedItem[] = [
  { id: "activity-1", type: "view", title: "Proposal viewed", description: "Sarah Mitchell viewed the proposal", timestamp: hoursAgo(2), actor: { name: "Sarah Mitchell", email: "sarah@whitmorelaw.co.uk", avatarUrl: null }, resourceLink: "/hub/hub-1/proposal" },
  { id: "activity-2", type: "download", title: "Document downloaded", description: "Pricing Breakdown was downloaded", timestamp: hoursAgo(5), actor: { name: "Sarah Mitchell", email: "sarah@whitmorelaw.co.uk", avatarUrl: null }, resourceLink: "/hub/hub-1/documents" },
  { id: "activity-3", type: "message", title: "Message sent", description: "New message in 'Proposal Questions' thread", timestamp: hoursAgo(8), actor: { name: "Sarah Mitchell", email: "sarah@whitmorelaw.co.uk", avatarUrl: null }, resourceLink: "/hub/hub-1/messages" },
];

// Hub-3 (Meridian Digital - Client Hub)
const hub3Activity: ActivityFeedItem[] = [
  { id: "activity-c1", type: "message", title: "Message received", description: "Alex Torres replied to design feedback thread", timestamp: hoursAgo(4), actor: { name: "Alex Torres", email: "alex@meridiandigital.co", avatarUrl: null }, resourceLink: "/hub/hub-3/messages" },
  { id: "activity-c2", type: "view", title: "Document viewed", description: "Alex Torres reviewed the Homepage Hero Design Options", timestamp: hoursAgo(12), actor: { name: "Alex Torres", email: "alex@meridiandigital.co", avatarUrl: null }, resourceLink: "/hub/hub-3/documents" },
  { id: "activity-c3", type: "download", title: "Document downloaded", description: "Brand Guidelines was downloaded", timestamp: daysAgo(1), actor: { name: "Alex Torres", email: "alex@meridiandigital.co", avatarUrl: null }, resourceLink: "/hub/hub-3/documents" },
  { id: "activity-c4", type: "message", title: "Decision updated", description: "Homepage Hero Design moved to In Review", timestamp: daysAgo(2), actor: { name: "Alex Torres", email: "alex@meridiandigital.co", avatarUrl: null }, resourceLink: "/hub/hub-3/decisions" },
];

// Activity lookup by hub ID
export const mockActivityByHub: Record<string, ActivityFeedItem[]> = {
  "hub-1": hub1Activity,
  "hub-3": hub3Activity,
};

// Default export for backwards compatibility
export const mockActivityFeed = hub1Activity;

// ============================================================================
// Re-exports from split files (backwards compatibility)
// ============================================================================

export { mockProposal, mockVideos, mockDocuments } from "./mock-data-content";
export { mockMessageThreads, mockMeetings, mockQuestionnaires, mockMembers } from "./mock-data-engagement";
