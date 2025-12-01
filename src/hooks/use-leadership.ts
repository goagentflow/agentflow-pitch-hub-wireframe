/**
 * Leadership Portfolio hooks
 *
 * React Query hooks for admin-only portfolio views:
 * - Portfolio Overview (aggregated metrics)
 * - Clients Grid (health vs expansion matrix)
 * - At-Risk Clients
 * - Expansion Candidates
 *
 * All hooks require admin permissions (403 if unauthorized).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PortfolioOverview,
  PortfolioClientsResponse,
  PortfolioFilterParams,
  ExpansionOpportunity,
} from "@/types";
import {
  getPortfolioOverview,
  getPortfolioClients,
  getAtRiskClients,
  getExpansionCandidates,
  refreshPortfolioMetrics,
  ApiRequestError,
} from "@/services";
import { serializeParams } from "@/lib/query-keys";

// Query keys
export const leadershipKeys = {
  all: ["leadership"] as const,
  overview: () => [...leadershipKeys.all, "overview"] as const,
  clients: (params?: PortfolioFilterParams) =>
    [...leadershipKeys.all, "clients", serializeParams(params)] as const,
  atRisk: () => [...leadershipKeys.all, "at-risk"] as const,
  expansion: () => [...leadershipKeys.all, "expansion"] as const,
};

/**
 * Hook to get portfolio overview (aggregated metrics)
 * Requires admin permissions - throws 403 if unauthorized
 */
export function usePortfolioOverview() {
  return useQuery<PortfolioOverview>({
    queryKey: leadershipKeys.overview(),
    queryFn: getPortfolioOverview,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on 403 Forbidden
      if (error instanceof ApiRequestError && error.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get clients grid (health vs expansion matrix)
 * Requires admin permissions
 */
export function usePortfolioClients(params?: PortfolioFilterParams) {
  return useQuery<PortfolioClientsResponse>({
    queryKey: leadershipKeys.clients(params),
    queryFn: () => getPortfolioClients(params),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get at-risk clients
 * Requires admin permissions
 */
export function useAtRiskClients() {
  return useQuery<PortfolioClientsResponse>({
    queryKey: leadershipKeys.atRisk(),
    queryFn: getAtRiskClients,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get expansion candidates with opportunities
 * Requires admin permissions
 */
export function useExpansionCandidates() {
  return useQuery<{
    clients: PortfolioClientsResponse["clients"];
    opportunities: ExpansionOpportunity[];
    dataStaleTimestamp: string;
    lastCalculatedAt: string;
    lastRefreshedAt: string;
  }>({
    queryKey: leadershipKeys.expansion(),
    queryFn: getExpansionCandidates,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Default fallback if estimatedCompletionMs is missing
const DEFAULT_REFRESH_DELAY_MS = 5000;

/**
 * Hook to trigger portfolio metrics refresh
 * Requires admin permissions
 */
export function useRefreshPortfolioMetrics() {
  const queryClient = useQueryClient();

  return useMutation<{ status: "queued"; estimatedCompletionMs: number }, Error>({
    mutationFn: refreshPortfolioMetrics,
    onSuccess: (data) => {
      // Use backend-provided ETA or fall back to default
      const delay = data?.estimatedCompletionMs ?? DEFAULT_REFRESH_DELAY_MS;
      // Invalidate all leadership queries after refresh completes
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: leadershipKeys.all });
      }, delay);
    },
  });
}
