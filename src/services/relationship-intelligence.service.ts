/**
 * Relationship Intelligence service
 *
 * Staff-facing intelligence features:
 * - Relationship Health scoring
 * - Expansion Radar (opportunities)
 * - Leadership Portfolio views (admin-only)
 */

import type {
  RelationshipHealth,
  ExpansionOpportunity,
  UpdateExpansionRequest,
  ExpansionOpportunitiesResponse,
  PortfolioOverview,
  PortfolioClientsResponse,
  PortfolioFilterParams,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay, ApiRequestError } from "./api";
import {
  mockRelationshipHealth,
  mockExpansionOpportunities,
  mockClientHubId,
} from "./mock-data-client-hub";
import { mockHubs, mockStaffUser } from "./mock-data";

// ============================================================================
// Relationship Health
// ============================================================================

/**
 * Get relationship health for a hub
 */
export async function getRelationshipHealth(hubId: string): Promise<RelationshipHealth> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    if (hubId === mockClientHubId) {
      return mockRelationshipHealth;
    }

    // Return default health for other hubs
    return {
      hubId,
      score: 65,
      status: "stable",
      trend: "stable",
      drivers: [],
      lastCalculatedAt: new Date().toISOString(),
      lastRefreshedAt: new Date().toISOString(),
    };
  }

  return api.get<RelationshipHealth>(`/hubs/${hubId}/relationship-health`);
}

// ============================================================================
// Expansion Opportunities
// ============================================================================

/**
 * Get expansion opportunities for a hub
 */
export async function getExpansionOpportunities(
  hubId: string
): Promise<ExpansionOpportunitiesResponse> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const opportunities = mockExpansionOpportunities.filter((o) => o.hubId === hubId);

    return {
      opportunities,
      lastCalculatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    };
  }

  return api.get<ExpansionOpportunitiesResponse>(`/hubs/${hubId}/expansion-opportunities`);
}

/**
 * Update expansion opportunity (status, notes)
 */
export async function updateExpansionOpportunity(
  hubId: string,
  opportunityId: string,
  data: UpdateExpansionRequest
): Promise<ExpansionOpportunity> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const opportunity = mockExpansionOpportunities.find(
      (o) => o.id === opportunityId && o.hubId === hubId
    );
    if (!opportunity) throw new Error("Opportunity not found");

    if (data.status) opportunity.status = data.status;
    if (data.notes !== undefined) opportunity.notes = data.notes;
    opportunity.updatedAt = new Date().toISOString();

    return opportunity;
  }

  return api.patch<ExpansionOpportunity>(
    `/hubs/${hubId}/expansion-opportunities/${opportunityId}`,
    data
  );
}

// ============================================================================
// Leadership Portfolio (Admin-only)
// ============================================================================

/**
 * Check if current user has admin access
 * Returns 403 if not authorized
 */
function checkAdminAccess(): void {
  if (isMockApiEnabled()) {
    // In mock mode, staff user has isAdmin: true
    if (mockStaffUser.role !== "staff" || !mockStaffUser.permissions.isAdmin) {
      throw new ApiRequestError(
        {
          code: "FORBIDDEN",
          message: "Leadership views require admin permissions",
        },
        403
      );
    }
  }
}

/**
 * Get portfolio overview (aggregated metrics)
 * Requires: role === "staff" && permissions.isAdmin === true
 */
export async function getPortfolioOverview(): Promise<PortfolioOverview> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(400);

    // Calculate from mock data
    const clientHubs = mockHubs.filter((h) => h.hubType === "client" || h.status === "won");
    const atRiskCount = 1; // Mock value
    const expansionReadyCount = mockExpansionOpportunities.filter(
      (o) => o.confidence === "high" && o.status === "open"
    ).length;

    return {
      totalClients: clientHubs.length,
      atRiskCount,
      expansionReadyCount,
      avgHealthScore: 72,
      dataStaleTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    };
  }

  return api.get<PortfolioOverview>("/leadership/portfolio");
}

/**
 * Get clients grid (health vs expansion matrix)
 * Requires: role === "staff" && permissions.isAdmin === true
 */
export async function getPortfolioClients(
  params?: PortfolioFilterParams
): Promise<PortfolioClientsResponse> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(400);

    // Build client list from hubs that are either client type or won
    const clientHubs = mockHubs.filter((h) => h.hubType === "client" || h.status === "won");

    const clients = clientHubs.map((hub) => ({
      hubId: hub.id,
      name: hub.companyName,
      healthScore: hub.id === mockClientHubId ? mockRelationshipHealth.score : 65,
      healthStatus: hub.id === mockClientHubId ? mockRelationshipHealth.status : ("stable" as const),
      expansionPotential:
        mockExpansionOpportunities.filter((o) => o.hubId === hub.id && o.status === "open")
          .length > 0
          ? ("high" as const)
          : ("low" as const),
      lastActivity: hub.lastActivity,
    }));

    // Apply sorting
    if (params?.sortBy) {
      clients.sort((a, b) => {
        let comparison = 0;
        switch (params.sortBy) {
          case "health":
            comparison = a.healthScore - b.healthScore;
            break;
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "expansion":
            const order = { high: 3, medium: 2, low: 1 };
            comparison =
              (order[a.expansionPotential] || 0) - (order[b.expansionPotential] || 0);
            break;
        }
        return params.order === "desc" ? -comparison : comparison;
      });
    }

    return {
      clients,
      dataStaleTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };
  }

  const queryParams: Record<string, string> = {};
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.order) queryParams.order = params.order;

  return api.get<PortfolioClientsResponse>("/leadership/clients", queryParams);
}

/**
 * Get at-risk clients
 * Requires: role === "staff" && permissions.isAdmin === true
 */
export async function getAtRiskClients(): Promise<PortfolioClientsResponse> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(300);

    // Return clients with at_risk status
    const atRiskClients = mockHubs
      .filter((h) => h.hubType === "client" || h.status === "won")
      .filter((h) => {
        // In mock, only mark hub as at_risk if it matches our mock health data
        return false; // No at-risk clients in demo for now
      })
      .map((hub) => ({
        hubId: hub.id,
        name: hub.companyName,
        healthScore: 45,
        healthStatus: "at_risk" as const,
        expansionPotential: "low" as const,
        lastActivity: hub.lastActivity,
      }));

    return {
      clients: atRiskClients,
      dataStaleTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };
  }

  return api.get<PortfolioClientsResponse>("/leadership/at-risk");
}

/**
 * Get expansion candidates
 * Requires: role === "staff" && permissions.isAdmin === true
 */
export async function getExpansionCandidates(): Promise<{
  clients: PortfolioClientsResponse["clients"];
  opportunities: ExpansionOpportunity[];
  dataStaleTimestamp: string;
}> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(300);

    // Find hubs with open high/medium confidence opportunities
    const hubsWithOpportunities = new Set(
      mockExpansionOpportunities
        .filter((o) => o.status === "open" && (o.confidence === "high" || o.confidence === "medium"))
        .map((o) => o.hubId)
    );

    const clients = mockHubs
      .filter((h) => hubsWithOpportunities.has(h.id))
      .map((hub) => ({
        hubId: hub.id,
        name: hub.companyName,
        healthScore: hub.id === mockClientHubId ? mockRelationshipHealth.score : 65,
        healthStatus: hub.id === mockClientHubId ? mockRelationshipHealth.status : ("stable" as const),
        expansionPotential: "high" as const,
        lastActivity: hub.lastActivity,
      }));

    const opportunities = mockExpansionOpportunities.filter(
      (o) => o.status === "open" && (o.confidence === "high" || o.confidence === "medium")
    );

    return {
      clients,
      opportunities,
      dataStaleTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    };
  }

  return api.get("/leadership/expansion");
}

/**
 * Trigger portfolio metrics refresh
 * Requires: role === "staff" && permissions.isAdmin === true
 */
export async function refreshPortfolioMetrics(): Promise<{
  status: "queued";
  estimatedCompletionMs: number;
}> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(200);

    return {
      status: "queued",
      estimatedCompletionMs: 5000,
    };
  }

  return api.post("/leadership/refresh");
}
