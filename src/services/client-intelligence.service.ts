/**
 * Client Intelligence service
 *
 * AI-powered features for client hubs using async job pattern:
 * - Instant Answers
 * - Decision Queue
 * - Meeting Prep/Follow-up
 * - Performance Narratives
 * - History (Institutional Memory)
 * - Risk Alerts
 */

import type {
  InstantAnswerRequest,
  InstantAnswerJob,
  DecisionItem,
  CreateDecisionRequest,
  UpdateDecisionRequest,
  DecisionTransition,
  MeetingPrep,
  MeetingFollowUp,
  PerformanceNarrative,
  GeneratePerformanceRequest,
  InstitutionalMemoryEvent,
  HistoryFilterParams,
  RiskAlert,
  AcknowledgeAlertRequest,
  AcknowledgeAlertResponse,
  PaginatedList,
  PaginationParams,
  EntityId,
} from "@/types";
import { isValidDecisionTransition } from "@/types";
import { api, isMockApiEnabled, simulateDelay, ApiRequestError } from "./api";
import {
  mockInstantAnswers,
  mockDecisions,
  mockMeetingPrep,
  mockMeetingFollowUp,
  mockPerformanceNarrative,
  mockHistoryEvents,
  mockRiskAlerts,
} from "./mock-data-client-hub";

// ============================================================================
// Instant Answers (Async Job Pattern)
// ============================================================================

/**
 * Submit an instant answer question (creates async job)
 */
export async function createInstantAnswer(
  hubId: string,
  data: InstantAnswerRequest
): Promise<{ answerId: string; status: "queued"; createdAt: string; expiresAt: string; pollIntervalHint: number }> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    const newAnswer: InstantAnswerJob = {
      id: `answer-${Date.now()}`,
      hubId,
      question: data.question,
      status: "queued",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      pollIntervalHint: 2000,
    };

    mockInstantAnswers.push(newAnswer);

    // Simulate async completion after 2 seconds
    setTimeout(() => {
      const answer = mockInstantAnswers.find((a) => a.id === newAnswer.id);
      if (answer && answer.status === "queued") {
        answer.status = "ready";
        answer.answer = `Based on the project data, ${data.question.toLowerCase()} The team is tracking well against milestones.`;
        answer.source = "Project timeline and meeting notes";
        answer.confidence = "medium";
        answer.completedAt = new Date().toISOString();
      }
    }, 2000);

    return {
      answerId: newAnswer.id,
      status: "queued",
      createdAt: newAnswer.createdAt,
      expiresAt: newAnswer.expiresAt,
      pollIntervalHint: 2000,
    };
  }

  return api.post(`/hubs/${hubId}/instant-answer/requests`, data);
}

/**
 * Get instant answer job status/result
 */
export async function getInstantAnswer(
  hubId: string,
  answerId: string
): Promise<InstantAnswerJob> {
  if (isMockApiEnabled()) {
    await simulateDelay(100);

    const answer = mockInstantAnswers.find((a) => a.id === answerId && a.hubId === hubId);
    if (!answer) throw new Error("Answer not found");
    return answer;
  }

  return api.get<InstantAnswerJob>(`/hubs/${hubId}/instant-answer/${answerId}`);
}

/**
 * Get recent instant answers (cached)
 */
export async function getRecentInstantAnswers(
  hubId: string,
  limit: number = 10
): Promise<InstantAnswerJob[]> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    return mockInstantAnswers
      .filter((a) => a.hubId === hubId && a.status === "ready")
      .slice(0, limit);
  }

  return api.get<InstantAnswerJob[]>(`/hubs/${hubId}/instant-answer/latest`, {
    limit: String(limit),
  });
}

// ============================================================================
// Decision Queue
// ============================================================================

interface DecisionFilterParams {
  status?: string;
  assignee?: string;
}

/**
 * Get decision queue items
 */
export async function getDecisions(
  hubId: string,
  params?: PaginationParams & DecisionFilterParams
): Promise<PaginatedList<DecisionItem>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    let filtered = mockDecisions.filter((d) => d.hubId === hubId);

    if (params?.status) {
      filtered = filtered.filter((d) => d.status === params.status);
    }

    if (params?.assignee) {
      filtered = filtered.filter((d) => d.assignee === params.assignee);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    return {
      items: filtered,
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
  if (params?.status) queryParams.status = params.status;
  if (params?.assignee) queryParams.assignee = params.assignee;

  return api.get<PaginatedList<DecisionItem>>(`/hubs/${hubId}/decision-queue`, queryParams);
}

/**
 * Get single decision with history
 */
export async function getDecision(hubId: string, decisionId: string): Promise<DecisionItem> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    const decision = mockDecisions.find((d) => d.id === decisionId && d.hubId === hubId);
    if (!decision) throw new Error("Decision not found");
    return decision;
  }

  return api.get<DecisionItem>(`/hubs/${hubId}/decision-queue/${decisionId}`);
}

/**
 * Create decision item
 */
export async function createDecision(
  hubId: string,
  data: CreateDecisionRequest
): Promise<DecisionItem> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const now = new Date().toISOString();
    const newDecision: DecisionItem = {
      id: `decision-${Date.now()}`,
      hubId,
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
      requestedBy: "user-staff-1",
      requestedByName: "Hamish Nicklin",
      assignee: data.assignee || null,
      assigneeName: data.assignee ? "Alex Torres" : null,
      status: "open",
      relatedResource: data.relatedResource || null,
      createdAt: now,
      updatedAt: now,
    };

    mockDecisions.push(newDecision);
    return newDecision;
  }

  return api.post<DecisionItem>(`/hubs/${hubId}/decision-queue`, data);
}

/**
 * Update decision (state transition)
 * Returns 409 Conflict if transition is invalid
 */
export async function updateDecision(
  hubId: string,
  decisionId: string,
  data: UpdateDecisionRequest
): Promise<{ item: DecisionItem; transition: DecisionTransition }> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const decision = mockDecisions.find((d) => d.id === decisionId && d.hubId === hubId);
    if (!decision) throw new Error("Decision not found");

    // Validate state transition
    if (!isValidDecisionTransition(decision.status, data.status)) {
      throw new ApiRequestError(
        {
          code: "INVALID_TRANSITION",
          message: `Cannot transition from ${decision.status} to ${data.status}`,
        },
        409
      );
    }

    const now = new Date().toISOString();
    const fromStatus = decision.status;

    decision.status = data.status;
    decision.updatedAt = now;
    decision.updatedBy = "user-staff-1";

    const transition: DecisionTransition = {
      id: `transition-${Date.now()}`,
      decisionId,
      fromStatus,
      toStatus: data.status,
      reason: data.reason,
      comment: data.comment,
      changedBy: "user-staff-1",
      changedByName: "Hamish Nicklin",
      changedAt: now,
    };

    return { item: decision, transition };
  }

  return api.patch(`/hubs/${hubId}/decision-queue/${decisionId}`, data);
}

// ============================================================================
// Meeting Prep/Follow-up (Async)
// ============================================================================

/**
 * Trigger meeting prep generation
 */
export async function generateMeetingPrep(
  hubId: string,
  meetingId: string
): Promise<{ status: "queued" }> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    return { status: "queued" };
  }

  return api.post(`/hubs/${hubId}/meetings/${meetingId}/prep/generate`);
}

/**
 * Get meeting prep
 */
export async function getMeetingPrep(hubId: string, meetingId: string): Promise<MeetingPrep> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    if (meetingId === mockMeetingPrep.meetingId) {
      return mockMeetingPrep;
    }

    // Return queued status for other meetings
    return {
      meetingId,
      status: "queued",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      pollIntervalHint: 2000,
    };
  }

  return api.get<MeetingPrep>(`/hubs/${hubId}/meetings/${meetingId}/prep`);
}

/**
 * Trigger meeting follow-up generation
 */
export async function generateMeetingFollowUp(
  hubId: string,
  meetingId: string
): Promise<{ status: "queued" }> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    return { status: "queued" };
  }

  return api.post(`/hubs/${hubId}/meetings/${meetingId}/follow-up/generate`);
}

/**
 * Get meeting follow-up
 */
export async function getMeetingFollowUp(
  hubId: string,
  meetingId: string
): Promise<MeetingFollowUp> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    if (meetingId === mockMeetingFollowUp.meetingId) {
      return mockMeetingFollowUp;
    }

    return {
      meetingId,
      status: "queued",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      pollIntervalHint: 2000,
    };
  }

  return api.get<MeetingFollowUp>(`/hubs/${hubId}/meetings/${meetingId}/follow-up`);
}

// ============================================================================
// Performance Narratives (Async)
// ============================================================================

/**
 * Generate performance narrative
 */
export async function generatePerformanceNarrative(
  hubId: string,
  data?: GeneratePerformanceRequest
): Promise<{ narrativeId: string; status: "queued" }> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    return {
      narrativeId: mockPerformanceNarrative.id,
      status: "queued",
    };
  }

  return api.post(`/hubs/${hubId}/performance/generate`, data);
}

/**
 * Get performance narrative
 */
export async function getPerformanceNarrative(
  hubId: string,
  narrativeId: string
): Promise<PerformanceNarrative> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    if (narrativeId === mockPerformanceNarrative.id) {
      return mockPerformanceNarrative;
    }

    throw new Error("Narrative not found");
  }

  return api.get<PerformanceNarrative>(`/hubs/${hubId}/performance/${narrativeId}`);
}

/**
 * Get latest performance narrative (cached)
 */
export async function getLatestPerformanceNarrative(
  hubId: string
): Promise<PerformanceNarrative | null> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    if (hubId === mockPerformanceNarrative.hubId) {
      return mockPerformanceNarrative;
    }
    return null;
  }

  return api.get<PerformanceNarrative | null>(`/hubs/${hubId}/performance/latest`);
}

// ============================================================================
// Institutional Memory (History)
// ============================================================================

/**
 * Get history events
 */
export async function getHistoryEvents(
  hubId: string,
  params?: PaginationParams & HistoryFilterParams
): Promise<PaginatedList<InstitutionalMemoryEvent>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    let filtered = mockHistoryEvents.filter((e) => e.hubId === hubId);

    if (params?.type) {
      filtered = filtered.filter((e) => e.type === params.type);
    }

    if (params?.fromDate) {
      filtered = filtered.filter((e) => e.date >= params.fromDate!);
    }

    if (params?.toDate) {
      filtered = filtered.filter((e) => e.date <= params.toDate!);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    return {
      items: filtered,
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
  if (params?.type) queryParams.type = params.type;
  if (params?.fromDate) queryParams.fromDate = params.fromDate;
  if (params?.toDate) queryParams.toDate = params.toDate;

  return api.get<PaginatedList<InstitutionalMemoryEvent>>(`/hubs/${hubId}/history`, queryParams);
}

// ============================================================================
// Risk Alerts
// ============================================================================

/**
 * Get risk alerts
 */
export async function getRiskAlerts(
  hubId: string
): Promise<{ alerts: RiskAlert[]; acknowledgedCount: number }> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    const alerts = mockRiskAlerts.filter((a) => a.hubId === hubId && !a.acknowledgedAt);
    const acknowledgedCount = mockRiskAlerts.filter(
      (a) => a.hubId === hubId && a.acknowledgedAt
    ).length;

    return { alerts, acknowledgedCount };
  }

  return api.get(`/hubs/${hubId}/risk-alerts`);
}

/**
 * Acknowledge risk alert
 */
export async function acknowledgeRiskAlert(
  hubId: string,
  alertId: string,
  data?: AcknowledgeAlertRequest
): Promise<AcknowledgeAlertResponse> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const alert = mockRiskAlerts.find((a) => a.id === alertId && a.hubId === hubId);
    if (!alert) throw new Error("Alert not found");

    const now = new Date().toISOString();
    alert.acknowledgedAt = now;
    alert.acknowledgedBy = "user-staff-1";

    return {
      alert,
      audit: {
        acknowledgedBy: "user-staff-1",
        acknowledgedAt: now,
        comment: data?.comment,
      },
    };
  }

  return api.patch(`/hubs/${hubId}/risk-alerts/${alertId}/acknowledge`, data);
}
