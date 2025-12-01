/**
 * Performance Narratives service
 *
 * AI-generated performance summaries using async job pattern.
 */

import type { PerformanceNarrative, GeneratePerformanceRequest } from "@/types";
import { api, isMockApiEnabled, simulateDelay, ApiRequestError } from "../api";
import { mockPerformanceNarrative } from "../mock-data-client-hub";

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
 * Poll using pollIntervalHint until status !== "queued"
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

    throw new ApiRequestError(
      { code: "NOT_FOUND", message: "Narrative not found or expired" },
      404
    );
  }

  return api.get<PerformanceNarrative>(
    `/hubs/${hubId}/performance/${narrativeId}`
  );
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

  return api.get<PerformanceNarrative | null>(
    `/hubs/${hubId}/performance/latest`
  );
}
