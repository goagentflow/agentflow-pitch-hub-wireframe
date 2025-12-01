/**
 * Relationship Intelligence service
 *
 * Staff-facing intelligence features:
 * - Relationship Health scoring
 * - Expansion Radar (opportunities)
 *
 * Note: Leadership Portfolio views are in leadership.service.ts
 */

import type {
  RelationshipHealth,
  ExpansionOpportunity,
  UpdateExpansionRequest,
  ExpansionOpportunitiesResponse,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay, ApiRequestError } from "./api";
import {
  mockRelationshipHealth,
  mockExpansionOpportunities,
  mockClientHubId,
} from "./mock-data-client-hub";

/**
 * Get relationship health for a hub
 */
export async function getRelationshipHealth(
  hubId: string
): Promise<RelationshipHealth> {
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

/**
 * Get expansion opportunities for a hub
 */
export async function getExpansionOpportunities(
  hubId: string
): Promise<ExpansionOpportunitiesResponse> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const opportunities = mockExpansionOpportunities.filter(
      (o) => o.hubId === hubId
    );

    return {
      opportunities,
      lastCalculatedAt: new Date(
        Date.now() - 6 * 60 * 60 * 1000
      ).toISOString(),
    };
  }

  return api.get<ExpansionOpportunitiesResponse>(
    `/hubs/${hubId}/expansion-opportunities`
  );
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
    if (!opportunity) {
      throw new ApiRequestError(
        { code: "NOT_FOUND", message: "Opportunity not found" },
        404
      );
    }

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
