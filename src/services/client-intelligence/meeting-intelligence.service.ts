/**
 * Meeting Intelligence service
 *
 * AI-generated meeting prep and follow-up using async job pattern.
 */

import type { MeetingPrep, MeetingFollowUp } from "@/types";
import { api, isMockApiEnabled, simulateDelay } from "../api";
import { mockMeetingPrep, mockMeetingFollowUp } from "../mock-data-client-hub";

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
 * Poll using pollIntervalHint until status !== "queued"
 */
export async function getMeetingPrep(
  hubId: string,
  meetingId: string
): Promise<MeetingPrep> {
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
 * Poll using pollIntervalHint until status !== "queued"
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

  return api.get<MeetingFollowUp>(
    `/hubs/${hubId}/meetings/${meetingId}/follow-up`
  );
}
