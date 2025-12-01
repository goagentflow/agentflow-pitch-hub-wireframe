/**
 * Decision Queue service
 *
 * State machine for decision items with audit trail.
 * Invalid transitions return 409 Conflict.
 */

import type {
  DecisionItem,
  CreateDecisionRequest,
  UpdateDecisionRequest,
  DecisionTransition,
  PaginatedList,
  PaginationParams,
  EntityId,
} from "@/types";
import { isValidDecisionTransition } from "@/types";
import { api, isMockApiEnabled, simulateDelay, ApiRequestError } from "../api";
import { mockDecisions } from "../mock-data-client-hub";

export interface DecisionFilterParams {
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

  return api.get<PaginatedList<DecisionItem>>(
    `/hubs/${hubId}/decision-queue`,
    queryParams
  );
}

/**
 * Get single decision with history
 */
export async function getDecision(
  hubId: string,
  decisionId: string
): Promise<DecisionItem> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    const decision = mockDecisions.find(
      (d) => d.id === decisionId && d.hubId === hubId
    );
    if (!decision) {
      throw new ApiRequestError(
        { code: "NOT_FOUND", message: "Decision not found" },
        404
      );
    }
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
      description: data.description,
      dueDate: data.dueDate,
      requestedBy: "user-staff-1",
      requestedByName: "Hamish Nicklin",
      assignee: data.assignee,
      assigneeName: data.assignee ? "Alex Torres" : undefined,
      status: "open",
      relatedResource: data.relatedResource,
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

    const decision = mockDecisions.find(
      (d) => d.id === decisionId && d.hubId === hubId
    );
    if (!decision) {
      throw new ApiRequestError(
        { code: "NOT_FOUND", message: "Decision not found" },
        404
      );
    }

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
