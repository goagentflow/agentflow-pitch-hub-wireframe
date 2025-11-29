/**
 * Meeting service
 *
 * Operations for meeting scheduling via Microsoft Graph.
 * Recordings and transcripts require Teams Premium licensing.
 */

import type {
  Meeting,
  ScheduleMeetingRequest,
  UpdateMeetingRequest,
  PaginatedList,
  PaginationParams,
  MeetingFilterParams,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay } from "./api";
import { mockMeetings } from "./mock-data";

/**
 * Get meetings for a hub
 */
export async function getMeetings(
  hubId: string,
  params?: PaginationParams & MeetingFilterParams
): Promise<PaginatedList<Meeting>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    let filtered = mockMeetings.filter((m) => m.hubId === hubId);

    // Apply projectId filter
    if (params?.projectId) {
      if (params.projectId === "unassigned") {
        filtered = filtered.filter((m) => !m.projectId);
      } else {
        filtered = filtered.filter((m) => m.projectId === params.projectId);
      }
    }

    if (params?.status) {
      filtered = filtered.filter((m) => m.status === params.status);
    }
    if (params?.fromDate) {
      filtered = filtered.filter((m) => new Date(m.startTime) >= new Date(params.fromDate!));
    }
    if (params?.toDate) {
      filtered = filtered.filter((m) => new Date(m.startTime) <= new Date(params.toDate!));
    }

    return {
      items: filtered,
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: filtered.length,
        totalPages: 1,
      },
    };
  }

  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.projectId) queryParams.projectId = params.projectId;
  if (params?.status) queryParams.status = params.status;
  if (params?.fromDate) queryParams.fromDate = params.fromDate;
  if (params?.toDate) queryParams.toDate = params.toDate;

  return api.get<PaginatedList<Meeting>>(`/hubs/${hubId}/meetings`, queryParams);
}

/**
 * Get single meeting by ID
 */
export async function getMeeting(hubId: string, meetingId: string): Promise<Meeting> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    if (!meeting) throw new Error("Meeting not found");
    return meeting;
  }

  return api.get<Meeting>(`/hubs/${hubId}/meetings/${meetingId}`);
}

/**
 * Schedule a new meeting
 */
export async function scheduleMeeting(
  hubId: string,
  data: ScheduleMeetingRequest
): Promise<Meeting> {
  if (isMockApiEnabled()) {
    await simulateDelay(800);

    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      hubId,
      title: data.title,
      description: data.description || null,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "scheduled",
      organizer: {
        email: "hamish@goagentflow.com",
        name: "Hamish Nicklin",
        isOrganizer: true,
        isClient: false,
        responseStatus: "accepted",
      },
      attendees: data.attendeeEmails.map((email) => ({
        email,
        name: email.split("@")[0],
        isOrganizer: false,
        isClient: true,
        responseStatus: "none",
      })),
      joinUrl: "https://teams.microsoft.com/l/meetup-join/...",
      agenda: data.agenda || null,
      teamNotes: null,
      recording: null,
      transcript: null,
      aiSummary: null,
    };

    mockMeetings.push(newMeeting);
    return newMeeting;
  }

  return api.post<Meeting>(`/hubs/${hubId}/meetings`, data);
}

/**
 * Update meeting details
 */
export async function updateMeeting(
  hubId: string,
  meetingId: string,
  data: UpdateMeetingRequest
): Promise<Meeting> {
  if (isMockApiEnabled()) {
    await simulateDelay(500);

    const index = mockMeetings.findIndex((m) => m.id === meetingId);
    if (index === -1) throw new Error("Meeting not found");

    // Handle attendee update
    if (data.attendeeEmails) {
      mockMeetings[index].attendees = data.attendeeEmails.map((email) => ({
        email,
        name: email.split("@")[0],
        isOrganizer: false,
        isClient: true,
        responseStatus: "none",
      }));
    }

    // Handle other fields
    const { attendeeEmails, ...rest } = data;
    mockMeetings[index] = { ...mockMeetings[index], ...rest };
    return mockMeetings[index];
  }

  return api.patch<Meeting>(`/hubs/${hubId}/meetings/${meetingId}`, data);
}

/**
 * Update meeting agenda
 */
export async function updateMeetingAgenda(
  hubId: string,
  meetingId: string,
  agenda: string
): Promise<Meeting> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const meeting = mockMeetings.find((m) => m.id === meetingId);
    if (!meeting) throw new Error("Meeting not found");
    meeting.agenda = agenda;
    return meeting;
  }

  return api.patch<Meeting>(`/hubs/${hubId}/meetings/${meetingId}/agenda`, { agenda });
}

/**
 * Update meeting team notes
 */
export async function updateMeetingNotes(
  hubId: string,
  meetingId: string,
  notes: string
): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    if (meeting) meeting.teamNotes = notes;
    return;
  }

  return api.patch(`/hubs/${hubId}/meetings/${meetingId}/notes`, { notes });
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(hubId: string, meetingId: string): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(500);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    if (meeting) meeting.status = "cancelled";
    return;
  }

  return api.delete(`/hubs/${hubId}/meetings/${meetingId}`);
}

/**
 * Get meeting recording URL (requires Teams Premium)
 * Returns null if recording not available
 */
export async function getMeetingRecording(
  hubId: string,
  meetingId: string
): Promise<string | null> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    return meeting?.recording?.recordingUrl || null;
  }

  const result = await api.get<{ url: string | null }>(`/hubs/${hubId}/meetings/${meetingId}/recording`);
  return result.url;
}

/**
 * Get meeting transcript (requires Teams Premium)
 * Returns null if transcript not available
 */
export async function getMeetingTranscript(
  hubId: string,
  meetingId: string
): Promise<string | null> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    return meeting?.transcript?.content || null;
  }

  const result = await api.get<{ content: string | null }>(`/hubs/${hubId}/meetings/${meetingId}/transcript`);
  return result.content;
}

/**
 * Get client-facing meetings (portal view)
 */
export async function getPortalMeetings(
  hubId: string,
  params?: PaginationParams
): Promise<PaginatedList<Meeting>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);
    const filtered = mockMeetings.filter(
      (m) => m.hubId === hubId && m.status !== "cancelled"
    );

    return {
      items: filtered,
      pagination: { page: 1, pageSize: 20, totalItems: filtered.length, totalPages: 1 },
    };
  }

  return api.get<PaginatedList<Meeting>>(`/hubs/${hubId}/portal/meetings`);
}
