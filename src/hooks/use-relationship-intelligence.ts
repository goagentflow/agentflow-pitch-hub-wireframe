/**
 * Relationship Intelligence hooks
 *
 * React Query hooks for staff-facing intelligence:
 * - Relationship Health scoring
 * - Expansion Radar (opportunities)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  RelationshipHealth,
  ExpansionOpportunity,
  ExpansionOpportunitiesResponse,
  UpdateExpansionRequest,
} from "@/types";
import {
  getRelationshipHealth,
  getExpansionOpportunities,
  updateExpansionOpportunity,
} from "@/services";

// Query keys
export const relationshipKeys = {
  all: ["relationship-intelligence"] as const,
  health: (hubId: string) => [...relationshipKeys.all, "health", hubId] as const,
  expansion: (hubId: string) => [...relationshipKeys.all, "expansion", hubId] as const,
};

/**
 * Hook to get relationship health for a hub
 */
export function useRelationshipHealth(hubId: string) {
  return useQuery<RelationshipHealth>({
    queryKey: relationshipKeys.health(hubId),
    queryFn: () => getRelationshipHealth(hubId),
    enabled: !!hubId,
    staleTime: 5 * 60 * 1000, // 5 minutes - recalculated periodically
  });
}

/**
 * Hook to get expansion opportunities for a hub
 */
export function useExpansionOpportunities(hubId: string) {
  return useQuery<ExpansionOpportunitiesResponse>({
    queryKey: relationshipKeys.expansion(hubId),
    queryFn: () => getExpansionOpportunities(hubId),
    enabled: !!hubId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update expansion opportunity (status, notes)
 */
export function useUpdateExpansionOpportunity(hubId: string, opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation<ExpansionOpportunity, Error, UpdateExpansionRequest>({
    mutationFn: (data) => updateExpansionOpportunity(hubId, opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: relationshipKeys.expansion(hubId) });
    },
  });
}
