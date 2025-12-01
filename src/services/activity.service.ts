/**
 * Activity service
 *
 * Operations for engagement tracking and activity logging.
 * Events use strict enum types for reliable analytics.
 */

import type {
  LogEventRequest,
  LeadershipLogEventRequest,
  ActivityEvent,
  PaginatedList,
  PaginationParams,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay } from "./api";

// In-memory event store for mock mode
const mockEvents: ActivityEvent[] = [];

/**
 * Log an engagement event
 * Uses discriminated union to enforce correct metadata for each event type
 */
export async function logEvent(hubId: string, event: LogEventRequest): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(50); // Fast for tracking

    const storedEvent: ActivityEvent = {
      id: `event-${Date.now()}`,
      eventType: event.eventType,
      hubId,
      userId: localStorage.getItem("userRole") === "staff" ? "user-staff-1" : "user-client-1",
      userName: localStorage.getItem("userRole") === "staff" ? "Hamish Nicklin" : "Sarah Mitchell",
      userEmail:
        localStorage.getItem("userRole") === "staff"
          ? "hamish@goagentflow.com"
          : "sarah@whitmorelaw.co.uk",
      timestamp: new Date().toISOString(),
      metadata: event.metadata,
    };

    mockEvents.push(storedEvent);

    // Log to console in development for debugging
    if (import.meta.env.DEV) {
      console.log("[Analytics]", event.eventType, event.metadata);
    }

    return;
  }

  return api.post(`/hubs/${hubId}/events`, event);
}

/**
 * Log a leadership event (not hub-scoped)
 * Used for tracking admin portfolio view usage
 */
export async function logLeadershipEvent(event: LeadershipLogEventRequest): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(50);

    // Log to console in development for debugging
    if (import.meta.env.DEV) {
      console.log("[Analytics:Leadership]", event.eventType, event.metadata);
    }

    return;
  }

  return api.post("/leadership/events", event);
}

/**
 * Get activity events for a hub (staff only)
 * Used for engagement analytics dashboards
 */
export async function getEvents(
  hubId: string,
  params?: PaginationParams
): Promise<PaginatedList<ActivityEvent>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const filtered = mockEvents.filter((e) => e.hubId === hubId);

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
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

  return api.get<PaginatedList<ActivityEvent>>(`/hubs/${hubId}/events`, queryParams);
}

/**
 * Get events for the current session (for debugging)
 */
export function getSessionEvents(): ActivityEvent[] {
  return [...mockEvents];
}

/**
 * Clear session events (for testing)
 */
export function clearSessionEvents(): void {
  mockEvents.length = 0;
}
