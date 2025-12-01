/**
 * History & Alerts service
 *
 * Institutional Memory timeline and Risk Alerts.
 */

import type {
  InstitutionalMemoryEvent,
  HistoryFilterParams,
  RiskAlert,
  AcknowledgeAlertRequest,
  AcknowledgeAlertResponse,
  PaginatedList,
  PaginationParams,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay, ApiRequestError } from "../api";
import { mockHistoryEvents, mockRiskAlerts } from "../mock-data-client-hub";

/**
 * Get history events (Institutional Memory)
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
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

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

  return api.get<PaginatedList<InstitutionalMemoryEvent>>(
    `/hubs/${hubId}/history`,
    queryParams
  );
}

/**
 * Get risk alerts
 */
export async function getRiskAlerts(
  hubId: string
): Promise<{ alerts: RiskAlert[]; acknowledgedCount: number }> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);

    const alerts = mockRiskAlerts.filter(
      (a) => a.hubId === hubId && !a.acknowledgedAt
    );
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

    const alert = mockRiskAlerts.find(
      (a) => a.id === alertId && a.hubId === hubId
    );
    if (!alert) {
      throw new ApiRequestError(
        { code: "NOT_FOUND", message: "Alert not found" },
        404
      );
    }

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
