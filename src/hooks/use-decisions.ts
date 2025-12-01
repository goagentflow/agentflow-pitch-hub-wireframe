/**
 * Decision Queue hooks
 *
 * React Query hooks for decision queue operations.
 * Includes state machine validation via 409 responses.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DecisionItem,
  CreateDecisionRequest,
  UpdateDecisionRequest,
  DecisionTransition,
  PaginatedList,
  PaginationParams,
} from "@/types";
import {
  getDecisions,
  getDecision,
  createDecision,
  updateDecision,
  DecisionFilterParams,
} from "@/services";
import { serializeParams } from "@/lib/query-keys";

// Query keys
export const decisionKeys = {
  all: ["decisions"] as const,
  lists: () => [...decisionKeys.all, "list"] as const,
  list: (hubId: string, params?: PaginationParams & DecisionFilterParams) =>
    [...decisionKeys.lists(), hubId, serializeParams(params)] as const,
  details: () => [...decisionKeys.all, "detail"] as const,
  detail: (hubId: string, decisionId: string) =>
    [...decisionKeys.details(), hubId, decisionId] as const,
};

/**
 * Hook to get decision queue items
 */
export function useDecisions(hubId: string, params?: PaginationParams & DecisionFilterParams) {
  return useQuery<PaginatedList<DecisionItem>>({
    queryKey: decisionKeys.list(hubId, params),
    queryFn: () => getDecisions(hubId, params),
    enabled: !!hubId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get single decision with history
 */
export function useDecision(hubId: string, decisionId: string) {
  return useQuery<DecisionItem>({
    queryKey: decisionKeys.detail(hubId, decisionId),
    queryFn: () => getDecision(hubId, decisionId),
    enabled: !!hubId && !!decisionId,
  });
}

/**
 * Hook to create a decision item
 */
export function useCreateDecision(hubId: string) {
  const queryClient = useQueryClient();

  return useMutation<DecisionItem, Error, CreateDecisionRequest>({
    mutationFn: (data) => createDecision(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: decisionKeys.lists() });
    },
  });
}

/**
 * Hook to update decision (state transition)
 * Returns 409 Conflict error if transition is invalid
 */
export function useUpdateDecision(hubId: string, decisionId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ item: DecisionItem; transition: DecisionTransition }, Error, UpdateDecisionRequest>({
    mutationFn: (data) => updateDecision(hubId, decisionId, data),
    onSuccess: ({ item }) => {
      queryClient.setQueryData(decisionKeys.detail(hubId, decisionId), item);
      queryClient.invalidateQueries({ queryKey: decisionKeys.lists() });
    },
  });
}
