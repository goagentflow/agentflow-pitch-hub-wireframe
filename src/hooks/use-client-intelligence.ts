/**
 * Client Intelligence hooks
 *
 * React Query hooks for AI-powered client features:
 * - Instant Answers (async Q&A)
 * - Meeting Prep & Follow-Up
 * - Performance Narratives
 * - History & Risk Alerts
 *
 * Uses polling pattern for async job completion.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  InstantAnswerJob,
  InstantAnswerRequest,
  MeetingPrep,
  MeetingFollowUp,
  PerformanceNarrative,
  GeneratePerformanceRequest,
  InstitutionalMemoryEvent,
  RiskAlert,
  AcknowledgeAlertRequest,
  AcknowledgeAlertResponse,
  PaginatedList,
  PaginationParams,
  HistoryFilterParams,
} from "@/types";
import {
  createInstantAnswer,
  getInstantAnswer,
  getRecentInstantAnswers,
  generateMeetingPrep,
  getMeetingPrep,
  generateMeetingFollowUp,
  getMeetingFollowUp,
  generatePerformanceNarrative,
  getPerformanceNarrative,
  getLatestPerformanceNarrative,
  getHistoryEvents,
  getRiskAlerts,
  acknowledgeRiskAlert,
} from "@/services";
import { serializeParams } from "@/lib/query-keys";

// ============================================================================
// Query Keys
// ============================================================================

export const instantAnswerKeys = {
  all: ["instant-answers"] as const,
  lists: () => [...instantAnswerKeys.all, "list"] as const,
  list: (hubId: string) => [...instantAnswerKeys.lists(), hubId] as const,
  details: () => [...instantAnswerKeys.all, "detail"] as const,
  detail: (hubId: string, answerId: string) => [...instantAnswerKeys.details(), hubId, answerId] as const,
};

export const meetingIntelligenceKeys = {
  all: ["meeting-intelligence"] as const,
  prep: (meetingId: string) => [...meetingIntelligenceKeys.all, "prep", meetingId] as const,
  followUp: (meetingId: string) => [...meetingIntelligenceKeys.all, "follow-up", meetingId] as const,
};

export const performanceKeys = {
  all: ["performance"] as const,
  details: () => [...performanceKeys.all, "detail"] as const,
  detail: (hubId: string, narrativeId: string) => [...performanceKeys.details(), hubId, narrativeId] as const,
  latest: (hubId: string) => [...performanceKeys.all, "latest", hubId] as const,
};

export const historyKeys = {
  all: ["history"] as const,
  events: (hubId: string, params?: PaginationParams & HistoryFilterParams) =>
    [...historyKeys.all, "events", hubId, serializeParams(params)] as const,
  alerts: (hubId: string) => [...historyKeys.all, "alerts", hubId] as const,
};

// ============================================================================
// Instant Answers Hooks
// ============================================================================

/**
 * Hook to submit instant answer question
 * Returns job info - poll getInstantAnswer until status !== "queued"
 */
export function useCreateInstantAnswer(hubId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ answerId: string; status: "queued"; createdAt: string; expiresAt: string; pollIntervalHint: number }, Error, InstantAnswerRequest>({
    mutationFn: (data) => createInstantAnswer(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instantAnswerKeys.list(hubId) });
    },
  });
}

/**
 * Hook to poll instant answer status
 * Polls automatically while status === "queued"
 */
export function useInstantAnswer(hubId: string, answerId: string, pollInterval?: number) {
  return useQuery<InstantAnswerJob>({
    queryKey: instantAnswerKeys.detail(hubId, answerId),
    queryFn: () => getInstantAnswer(hubId, answerId),
    enabled: !!hubId && !!answerId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "queued") {
        return pollInterval ?? data.pollIntervalHint ?? 2000;
      }
      return false;
    },
  });
}

/**
 * Hook to get recent instant answers (cached)
 */
export function useRecentInstantAnswers(hubId: string, limit?: number) {
  return useQuery<InstantAnswerJob[]>({
    queryKey: instantAnswerKeys.list(hubId),
    queryFn: () => getRecentInstantAnswers(hubId, limit),
    enabled: !!hubId,
    staleTime: 60 * 1000,
  });
}

// ============================================================================
// Meeting Intelligence Hooks
// ============================================================================

/**
 * Hook to generate meeting prep
 */
export function useGenerateMeetingPrep(hubId: string, meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ prepId: string; status: "queued" }, Error>({
    mutationFn: () => generateMeetingPrep(hubId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingIntelligenceKeys.prep(meetingId) });
    },
  });
}

/**
 * Hook to get meeting prep (polls while queued)
 */
export function useMeetingPrep(hubId: string, meetingId: string) {
  return useQuery<MeetingPrep>({
    queryKey: meetingIntelligenceKeys.prep(meetingId),
    queryFn: () => getMeetingPrep(hubId, meetingId),
    enabled: !!hubId && !!meetingId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "queued") {
        return data.pollIntervalHint ?? 2000;
      }
      return false;
    },
  });
}

/**
 * Hook to generate meeting follow-up
 */
export function useGenerateMeetingFollowUp(hubId: string, meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ followUpId: string; status: "queued" }, Error>({
    mutationFn: () => generateMeetingFollowUp(hubId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingIntelligenceKeys.followUp(meetingId) });
    },
  });
}

/**
 * Hook to get meeting follow-up (polls while queued)
 */
export function useMeetingFollowUp(hubId: string, meetingId: string) {
  return useQuery<MeetingFollowUp>({
    queryKey: meetingIntelligenceKeys.followUp(meetingId),
    queryFn: () => getMeetingFollowUp(hubId, meetingId),
    enabled: !!hubId && !!meetingId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "queued") {
        return data.pollIntervalHint ?? 2000;
      }
      return false;
    },
  });
}

// ============================================================================
// Performance Narrative Hooks
// ============================================================================

/**
 * Hook to generate performance narrative
 */
export function useGeneratePerformanceNarrative(hubId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ narrativeId: string; status: "queued" }, Error, GeneratePerformanceRequest | undefined>({
    mutationFn: (data) => generatePerformanceNarrative(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.latest(hubId) });
    },
  });
}

/**
 * Hook to get performance narrative (polls while queued)
 */
export function usePerformanceNarrative(hubId: string, narrativeId: string) {
  return useQuery<PerformanceNarrative>({
    queryKey: performanceKeys.detail(hubId, narrativeId),
    queryFn: () => getPerformanceNarrative(hubId, narrativeId),
    enabled: !!hubId && !!narrativeId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "queued") {
        return data.pollIntervalHint ?? 2000;
      }
      return false;
    },
  });
}

/**
 * Hook to get latest performance narrative
 */
export function useLatestPerformanceNarrative(hubId: string) {
  return useQuery<PerformanceNarrative | null>({
    queryKey: performanceKeys.latest(hubId),
    queryFn: () => getLatestPerformanceNarrative(hubId),
    enabled: !!hubId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// History & Risk Alerts Hooks
// ============================================================================

/**
 * Hook to get institutional memory events
 */
export function useHistoryEvents(hubId: string, params?: PaginationParams & HistoryFilterParams) {
  return useQuery<PaginatedList<InstitutionalMemoryEvent>>({
    queryKey: historyKeys.events(hubId, params),
    queryFn: () => getHistoryEvents(hubId, params),
    enabled: !!hubId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to get risk alerts
 */
export function useRiskAlerts(hubId: string) {
  return useQuery<{ alerts: RiskAlert[]; acknowledgedCount: number }>({
    queryKey: historyKeys.alerts(hubId),
    queryFn: () => getRiskAlerts(hubId),
    enabled: !!hubId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to acknowledge a risk alert
 */
export function useAcknowledgeRiskAlert(hubId: string, alertId: string) {
  const queryClient = useQueryClient();

  return useMutation<AcknowledgeAlertResponse, Error, AcknowledgeAlertRequest | undefined>({
    mutationFn: (data) => acknowledgeRiskAlert(hubId, alertId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.alerts(hubId) });
    },
  });
}
