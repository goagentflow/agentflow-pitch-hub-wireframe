/**
 * Leadership Portfolio service
 *
 * Admin-only views for portfolio management:
 * - Portfolio Overview (aggregated metrics)
 * - Clients Grid (health vs expansion matrix)
 * - At-Risk Clients
 * - Expansion Candidates
 *
 * Requires: role === "staff" && permissions.isAdmin === true
 */

import type {
  ExpansionOpportunity,
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

/**
 * Check if current user has admin access
 * Throws 403 if not authorized
 */
function checkAdminAccess(): void {
  if (isMockApiEnabled()) {
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
 */
export async function getPortfolioOverview(): Promise<PortfolioOverview> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(400);

    const clientHubs = mockHubs.filter(
      (h) => h.hubType === "client" || h.status === "won"
    );
    const atRiskCount = 1;
    const expansionReadyCount = mockExpansionOpportunities.filter(
      (o) => o.confidence === "high" && o.status === "open"
    ).length;

    const now = Date.now();
    return {
      totalClients: clientHubs.length,
      atRiskCount,
      expansionReadyCount,
      avgHealthScore: 72,
      dataStaleTimestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastCalculatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastRefreshedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    };
  }

  return api.get<PortfolioOverview>("/leadership/portfolio");
}

/**
 * Get clients grid (health vs expansion matrix)
 */
export async function getPortfolioClients(
  params?: PortfolioFilterParams
): Promise<PortfolioClientsResponse> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(400);

    const clientHubs = mockHubs.filter(
      (h) => h.hubType === "client" || h.status === "won"
    );

    const clients = clientHubs.map((hub) => ({
      hubId: hub.id,
      name: hub.companyName,
      healthScore:
        hub.id === mockClientHubId ? mockRelationshipHealth.score : 65,
      healthStatus:
        hub.id === mockClientHubId
          ? mockRelationshipHealth.status
          : ("stable" as const),
      expansionPotential:
        mockExpansionOpportunities.filter(
          (o) => o.hubId === hub.id && o.status === "open"
        ).length > 0
          ? ("high" as const)
          : ("low" as const),
      lastActivity: hub.lastActivity,
    }));

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
          case "expansion": {
            const order = { high: 3, medium: 2, low: 1 };
            comparison =
              (order[a.expansionPotential] || 0) -
              (order[b.expansionPotential] || 0);
            break;
          }
          case "lastActivity":
            comparison =
              new Date(a.lastActivity).getTime() -
              new Date(b.lastActivity).getTime();
            break;
        }
        return params.order === "desc" ? -comparison : comparison;
      });
    }

    const now = Date.now();
    return {
      clients,
      dataStaleTimestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastCalculatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastRefreshedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    };
  }

  const queryParams: Record<string, string> = {};
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.order) queryParams.order = params.order;

  return api.get<PortfolioClientsResponse>("/leadership/clients", queryParams);
}

/**
 * Get at-risk clients
 */
export async function getAtRiskClients(): Promise<PortfolioClientsResponse> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const atRiskClients = mockHubs
      .filter((h) => h.hubType === "client" || h.status === "won")
      .filter(() => false) // No at-risk clients in demo
      .map((hub) => ({
        hubId: hub.id,
        name: hub.companyName,
        healthScore: 45,
        healthStatus: "at_risk" as const,
        expansionPotential: "low" as const,
        lastActivity: hub.lastActivity,
      }));

    const now = Date.now();
    return {
      clients: atRiskClients,
      dataStaleTimestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastCalculatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastRefreshedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    };
  }

  return api.get<PortfolioClientsResponse>("/leadership/at-risk");
}

/**
 * Get expansion candidates
 */
export async function getExpansionCandidates(): Promise<{
  clients: PortfolioClientsResponse["clients"];
  opportunities: ExpansionOpportunity[];
  dataStaleTimestamp: string;
  lastCalculatedAt: string;
  lastRefreshedAt: string;
}> {
  checkAdminAccess();

  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const hubsWithOpportunities = new Set(
      mockExpansionOpportunities
        .filter(
          (o) =>
            o.status === "open" &&
            (o.confidence === "high" || o.confidence === "medium")
        )
        .map((o) => o.hubId)
    );

    const clients = mockHubs
      .filter((h) => hubsWithOpportunities.has(h.id))
      .map((hub) => ({
        hubId: hub.id,
        name: hub.companyName,
        healthScore:
          hub.id === mockClientHubId ? mockRelationshipHealth.score : 65,
        healthStatus:
          hub.id === mockClientHubId
            ? mockRelationshipHealth.status
            : ("stable" as const),
        expansionPotential: "high" as const,
        lastActivity: hub.lastActivity,
      }));

    const opportunities = mockExpansionOpportunities.filter(
      (o) =>
        o.status === "open" &&
        (o.confidence === "high" || o.confidence === "medium")
    );

    const now = Date.now();
    return {
      clients,
      opportunities,
      dataStaleTimestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastCalculatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      lastRefreshedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    };
  }

  return api.get("/leadership/expansion");
}

/**
 * Trigger portfolio metrics refresh
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
