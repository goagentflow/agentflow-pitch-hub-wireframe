/**
 * Activity tracking hooks
 *
 * React Query hooks for engagement tracking.
 */

import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  LogEventRequest,
  LeadershipLogEventRequest,
  ActivityEvent,
  PaginatedList,
  PaginationParams,
  LeadershipAccessedMetadata,
} from "@/types";
import { EventType } from "@/types";
import { logEvent, logLeadershipEvent, getEvents } from "@/services";
import { serializeParams } from "@/lib/query-keys";

// Query keys - use serialized params for stable cache keys
export const activityKeys = {
  all: ["activity"] as const,
  events: (hubId: string, params?: PaginationParams) => [...activityKeys.all, hubId, serializeParams(params)] as const,
};

/**
 * Hook to get activity events for a hub
 */
export function useActivityEvents(hubId: string, params?: PaginationParams) {
  return useQuery<PaginatedList<ActivityEvent>>({
    queryKey: activityKeys.events(hubId, params),
    queryFn: () => getEvents(hubId, params),
    enabled: !!hubId,
  });
}

/**
 * Hook to log events
 */
export function useLogEvent(hubId: string) {
  return useMutation<void, Error, LogEventRequest>({
    mutationFn: (event) => logEvent(hubId, event),
  });
}

/**
 * Hook providing convenient event logging helpers
 */
export function useTrackEngagement(hubId: string) {
  const { mutate: log } = useLogEvent(hubId);

  const trackHubViewed = useCallback(
    (section: string) => {
      log({ eventType: EventType.HUB_VIEWED, metadata: { section } });
    },
    [log]
  );

  const trackProposalViewed = useCallback(
    (proposalId: string, slideNum: number) => {
      log({ eventType: EventType.PROPOSAL_VIEWED, metadata: { proposalId, slideNum } });
    },
    [log]
  );

  const trackProposalSlideTime = useCallback(
    (proposalId: string, slideNum: number, seconds: number) => {
      log({ eventType: EventType.PROPOSAL_SLIDE_TIME, metadata: { proposalId, slideNum, seconds } });
    },
    [log]
  );

  const trackVideoWatched = useCallback(
    (videoId: string, watchTime: number, percentComplete: number) => {
      log({ eventType: EventType.VIDEO_WATCHED, metadata: { videoId, watchTime, percentComplete } });
    },
    [log]
  );

  const trackVideoCompleted = useCallback(
    (videoId: string) => {
      log({ eventType: EventType.VIDEO_COMPLETED, metadata: { videoId } });
    },
    [log]
  );

  const trackDocumentViewed = useCallback(
    (documentId: string) => {
      log({ eventType: EventType.DOCUMENT_VIEWED, metadata: { documentId } });
    },
    [log]
  );

  const trackDocumentDownloaded = useCallback(
    (documentId: string) => {
      log({ eventType: EventType.DOCUMENT_DOWNLOADED, metadata: { documentId } });
    },
    [log]
  );

  const trackMeetingJoined = useCallback(
    (meetingId: string) => {
      log({ eventType: EventType.MEETING_JOINED, metadata: { meetingId } });
    },
    [log]
  );

  const trackMessageSent = useCallback(
    (threadId: string) => {
      log({ eventType: EventType.MESSAGE_SENT, metadata: { threadId } });
    },
    [log]
  );

  const trackQuestionnaireCompleted = useCallback(
    (questionnaireId: string) => {
      log({ eventType: EventType.QUESTIONNAIRE_COMPLETED, metadata: { questionnaireId } });
    },
    [log]
  );

  return {
    trackHubViewed,
    trackProposalViewed,
    trackProposalSlideTime,
    trackVideoWatched,
    trackVideoCompleted,
    trackDocumentViewed,
    trackDocumentDownloaded,
    trackMeetingJoined,
    trackMessageSent,
    trackQuestionnaireCompleted,
  };
}

/**
 * Hook to log leadership events (not hub-scoped)
 */
export function useLogLeadershipEvent() {
  return useMutation<void, Error, LeadershipLogEventRequest>({
    mutationFn: logLeadershipEvent,
  });
}

/**
 * Hook for tracking leadership portfolio views
 */
export function useTrackLeadershipView() {
  const { mutate: log } = useLogLeadershipEvent();

  const trackLeadershipAccessed = useCallback(
    (view: LeadershipAccessedMetadata["view"]) => {
      log({ eventType: EventType.LEADERSHIP_ACCESSED, metadata: { view } });
    },
    [log]
  );

  return { trackLeadershipAccessed };
}
