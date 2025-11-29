/**
 * Hub service
 *
 * Operations for hub list and hub management.
 */

import type {
  Hub,
  CreateHubRequest,
  UpdateHubRequest,
  HubOverview,
  PortalConfig,
  UpdatePortalConfigRequest,
  PaginatedList,
  PaginationParams,
  ActivityFeedItem,
  Project,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay } from "./api";
import { mockProjects } from "./mock-data-client-hub";
import { mockHubs, mockHubOverview, mockPortalConfig, mockActivityFeed } from "./mock-data";

/**
 * Get paginated list of hubs
 */
export async function getHubs(params?: PaginationParams): Promise<PaginatedList<Hub>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    let filtered = [...mockHubs];

    // Apply search filter
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.companyName.toLowerCase().includes(search) ||
          h.contactName.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (params?.filter) {
      const [field, value] = params.filter.split(":");
      if (field === "status" && value) {
        filtered = filtered.filter((h) => h.status === value);
      }
    }

    // Apply sorting
    if (params?.sort) {
      const [field, direction] = params.sort.split(":");
      filtered.sort((a, b) => {
        const aVal = a[field as keyof Hub];
        const bVal = b[field as keyof Hub];
        const cmp = String(aVal).localeCompare(String(bVal));
        return direction === "desc" ? -cmp : cmp;
      });
    }

    // Apply pagination
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  }

  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
  if (params?.sort) queryParams.sort = params.sort;
  if (params?.filter) queryParams.filter = params.filter;
  if (params?.search) queryParams.search = params.search;

  return api.get<PaginatedList<Hub>>("/hubs", queryParams);
}

/**
 * Get single hub by ID
 */
export async function getHub(hubId: string): Promise<Hub> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    const hub = mockHubs.find((h) => h.id === hubId);
    if (!hub) throw new Error("Hub not found");
    return hub;
  }

  return api.get<Hub>(`/hubs/${hubId}`);
}

/**
 * Create a new hub
 */
export async function createHub(data: CreateHubRequest): Promise<Hub> {
  if (isMockApiEnabled()) {
    await simulateDelay(500);

    const newHub: Hub = {
      id: `hub-${Date.now()}`,
      companyName: data.companyName,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      status: "draft",
      hubType: "pitch", // New hubs start as pitch hubs
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      clientsInvited: 0,
      lastVisit: null,
      clientDomain: data.clientDomain || data.contactEmail.split("@")[1],
    };

    mockHubs.unshift(newHub);
    return newHub;
  }

  return api.post<Hub>("/hubs", data);
}

/**
 * Update hub details
 */
export async function updateHub(hubId: string, data: UpdateHubRequest): Promise<Hub> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const index = mockHubs.findIndex((h) => h.id === hubId);
    if (index === -1) throw new Error("Hub not found");

    mockHubs[index] = { ...mockHubs[index], ...data, updatedAt: new Date().toISOString() };
    return mockHubs[index];
  }

  return api.patch<Hub>(`/hubs/${hubId}`, data);
}

/**
 * Get hub overview with alerts and stats
 * Note: Uses /overview endpoint to keep hub details and dashboard data distinct
 */
export async function getHubOverview(hubId: string): Promise<HubOverview> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);
    return mockHubOverview;
  }

  return api.get<HubOverview>(`/hubs/${hubId}/overview`);
}

/**
 * Update hub internal notes
 */
export async function updateHubNotes(hubId: string, notes: string): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    mockHubOverview.internalNotes = notes;
    return;
  }

  return api.patch(`/hubs/${hubId}/notes`, { notes });
}

/**
 * Get hub activity feed
 */
export async function getHubActivity(
  hubId: string,
  params?: PaginationParams
): Promise<PaginatedList<ActivityFeedItem>> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    return {
      items: mockActivityFeed,
      pagination: { page: 1, pageSize: 20, totalItems: mockActivityFeed.length, totalPages: 1 },
    };
  }

  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.pageSize) queryParams.pageSize = String(params.pageSize);

  return api.get<PaginatedList<ActivityFeedItem>>(`/hubs/${hubId}/activity`, queryParams);
}

/**
 * Get portal configuration
 */
export async function getPortalConfig(hubId: string): Promise<PortalConfig> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    return mockPortalConfig;
  }

  return api.get<PortalConfig>(`/hubs/${hubId}/portal-config`);
}

/**
 * Update portal configuration
 */
export async function updatePortalConfig(
  hubId: string,
  data: UpdatePortalConfigRequest
): Promise<PortalConfig> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);
    Object.assign(mockPortalConfig, data);
    return mockPortalConfig;
  }

  return api.patch<PortalConfig>(`/hubs/${hubId}/portal-config`, data);
}

/**
 * Publish portal (make live to clients)
 */
export async function publishPortal(hubId: string): Promise<PortalConfig> {
  if (isMockApiEnabled()) {
    await simulateDelay(500);
    mockPortalConfig.isPublished = true;
    return mockPortalConfig;
  }

  return api.post<PortalConfig>(`/hubs/${hubId}/publish`);
}

// ============================================================================
// Hub Conversion (Pitch → Client)
// ============================================================================

export interface ConvertHubResponse {
  hub: Hub;
  archiveSummary: {
    proposalArchived: boolean;
    proposalDocumentId?: string;
    questionnaireArchived: boolean;
    questionnaireHistoryId?: string;
  };
  project?: Project;
  alreadyConverted: boolean;
  audit: {
    convertedBy: string;
    convertedAt: string;
  };
}

export interface ConvertHubRequest {
  initialProjectName?: string;
}

/**
 * Convert a pitch hub to a client hub
 * Atomic operation: archives proposal, handles questionnaire, creates optional first project
 * Idempotent: calling twice returns same result without side effects
 */
export async function convertToClientHub(
  hubId: string,
  data?: ConvertHubRequest
): Promise<ConvertHubResponse> {
  if (isMockApiEnabled()) {
    await simulateDelay(800);

    const hub = mockHubs.find((h) => h.id === hubId);
    if (!hub) throw new Error("Hub not found");

    const now = new Date().toISOString();
    const userId = "user-staff-1";

    // Check if already converted (idempotent)
    if (hub.hubType === "client") {
      return {
        hub,
        archiveSummary: {
          proposalArchived: true,
          proposalDocumentId: `doc-archived-${hubId}`,
          questionnaireArchived: true,
          questionnaireHistoryId: `history-questionnaire-${hubId}`,
        },
        alreadyConverted: true,
        audit: {
          convertedBy: hub.convertedBy || userId,
          convertedAt: hub.convertedAt || now,
        },
      };
    }

    // Perform conversion
    hub.hubType = "client";
    hub.convertedAt = now;
    hub.convertedBy = userId;
    hub.updatedAt = now;

    let project: Project | undefined;

    // Create initial project if name provided
    if (data?.initialProjectName) {
      project = {
        id: `project-${Date.now()}`,
        hubId,
        name: data.initialProjectName,
        description: null,
        status: "active",
        startDate: now,
        targetEndDate: null,
        lead: userId,
        leadName: "Hamish Nicklin",
        milestones: [],
        createdAt: now,
        updatedAt: now,
      };
      mockProjects.push(project);
    }

    return {
      hub,
      archiveSummary: {
        proposalArchived: true,
        proposalDocumentId: `doc-archived-${hubId}`,
        questionnaireArchived: true,
        questionnaireHistoryId: `history-questionnaire-${hubId}`,
      },
      project,
      alreadyConverted: false,
      audit: {
        convertedBy: userId,
        convertedAt: now,
      },
    };
  }

  return api.post<ConvertHubResponse>(`/hubs/${hubId}/convert`, data);
}

/**
 * Rollback hub conversion (INTERNAL USE ONLY - requires admin)
 * NOT for production use - early-phase recovery only
 */
export async function rollbackConversion(hubId: string): Promise<Hub> {
  if (isMockApiEnabled()) {
    await simulateDelay(500);

    const hub = mockHubs.find((h) => h.id === hubId);
    if (!hub) throw new Error("Hub not found");

    // Only rollback if actually a client hub
    if (hub.hubType !== "client") {
      throw new Error("Hub is not a client hub");
    }

    // Reverse conversion
    hub.hubType = "pitch";
    hub.convertedAt = undefined;
    hub.convertedBy = undefined;
    hub.updatedAt = new Date().toISOString();

    return hub;
  }

  return api.post<Hub>(`/hubs/${hubId}/convert/rollback`);
}
