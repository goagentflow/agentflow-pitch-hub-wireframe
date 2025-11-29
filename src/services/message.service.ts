/**
 * Message service
 *
 * Operations for email thread management via Microsoft Graph.
 * Messages are scoped to hubs using email category labels.
 */

import type {
  MessageThreadSummary,
  MessageThreadDetail,
  Message,
  SendMessageRequest,
  PaginatedList,
  PaginationParams,
  MessageFilterParams,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay } from "./api";
import { mockMessageThreads } from "./mock-data";

// Mock messages for thread detail
const mockMessages: Message[] = [
  {
    id: "msg-1",
    threadId: "thread-1",
    from: { email: "sarah@whitmorelaw.co.uk", name: "Sarah Mitchell" },
    to: [{ email: "hamish@goagentflow.com", name: "Hamish Nicklin" }],
    cc: [],
    subject: "Re: Proposal Questions",
    bodyPreview: "Thanks for clarifying the timeline. One more question about...",
    bodyHtml: "<p>Thanks for clarifying the timeline. One more question about the implementation phase - what's the typical turnaround for the initial designs?</p>",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    attachments: [],
  },
  {
    id: "msg-2",
    threadId: "thread-1",
    from: { email: "hamish@goagentflow.com", name: "Hamish Nicklin" },
    to: [{ email: "sarah@whitmorelaw.co.uk", name: "Sarah Mitchell" }],
    cc: [],
    subject: "Re: Proposal Questions",
    bodyPreview: "Great question! The timeline in the proposal assumes...",
    bodyHtml: "<p>Great question! The timeline in the proposal assumes a 2-week design phase with 2 rounds of revisions. We can adjust based on your needs.</p>",
    sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    attachments: [],
  },
];

/**
 * Get message threads for a hub
 */
export async function getMessageThreads(
  hubId: string,
  params?: PaginationParams & MessageFilterParams
): Promise<PaginatedList<MessageThreadSummary>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    let filtered = mockMessageThreads.filter((t) => t.hubId === hubId);

    // Apply projectId filter
    if (params?.projectId) {
      if (params.projectId === "unassigned") {
        filtered = filtered.filter((t) => !t.projectId);
      } else {
        filtered = filtered.filter((t) => t.projectId === params.projectId);
      }
    }

    if (params?.isArchived !== undefined) {
      filtered = filtered.filter((t) => t.isArchived === params.isArchived);
    }
    if (params?.isRead !== undefined) {
      filtered = filtered.filter((t) => t.isRead === params.isRead);
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
  if (params?.isArchived !== undefined) queryParams.isArchived = String(params.isArchived);
  if (params?.isRead !== undefined) queryParams.isRead = String(params.isRead);

  return api.get<PaginatedList<MessageThreadSummary>>(`/hubs/${hubId}/messages`, queryParams);
}

/**
 * Get thread detail with messages
 */
export async function getMessageThread(
  hubId: string,
  threadId: string
): Promise<MessageThreadDetail> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const summary = mockMessageThreads.find((t) => t.id === threadId);
    if (!summary) throw new Error("Thread not found");

    return {
      ...summary,
      teamNotes: "Follow up on pricing question. Decision expected by end of week.",
      messages: mockMessages.filter((m) => m.threadId === threadId),
    };
  }

  return api.get<MessageThreadDetail>(`/hubs/${hubId}/messages/${threadId}`);
}

/**
 * Send a new message or reply to thread
 */
export async function sendMessage(
  hubId: string,
  data: SendMessageRequest
): Promise<Message> {
  if (isMockApiEnabled()) {
    await simulateDelay(800);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: data.threadId || `thread-${Date.now()}`,
      from: { email: "hamish@goagentflow.com", name: "Hamish Nicklin" },
      to: data.to.map((email) => ({ email, name: email.split("@")[0] })),
      cc: data.cc?.map((email) => ({ email, name: email.split("@")[0] })) || [],
      subject: data.subject,
      bodyPreview: data.bodyHtml.replace(/<[^>]*>/g, "").slice(0, 100),
      bodyHtml: data.bodyHtml,
      sentAt: new Date().toISOString(),
      isRead: true,
      attachments: [],
    };

    mockMessages.unshift(newMessage);
    return newMessage;
  }

  return api.post<Message>(`/hubs/${hubId}/messages`, data);
}

/**
 * Update team notes on a thread
 */
export async function updateTeamNotes(
  hubId: string,
  threadId: string,
  notes: string
): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    return;
  }

  return api.patch(`/hubs/${hubId}/messages/${threadId}/notes`, { notes });
}

/**
 * Archive/unarchive a thread
 */
export async function archiveThread(
  hubId: string,
  threadId: string,
  archive: boolean
): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    const thread = mockMessageThreads.find((t) => t.id === threadId);
    if (thread) thread.isArchived = archive;
    return;
  }

  return api.patch(`/hubs/${hubId}/messages/${threadId}`, { isArchived: archive });
}

/**
 * Get client-facing messages (portal view)
 */
export async function getPortalMessages(
  hubId: string,
  params?: PaginationParams
): Promise<PaginatedList<MessageThreadSummary>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);
    const filtered = mockMessageThreads.filter((t) => t.hubId === hubId && !t.isArchived);

    return {
      items: filtered,
      pagination: { page: 1, pageSize: 20, totalItems: filtered.length, totalPages: 1 },
    };
  }

  return api.get<PaginatedList<MessageThreadSummary>>(`/hubs/${hubId}/portal/messages`);
}

/**
 * Send message from portal
 */
export async function sendPortalMessage(
  hubId: string,
  data: SendMessageRequest
): Promise<Message> {
  if (isMockApiEnabled()) {
    await simulateDelay(800);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: data.threadId || `thread-${Date.now()}`,
      from: { email: "sarah@whitmorelaw.co.uk", name: "Sarah Mitchell" },
      to: data.to.map((email) => ({ email, name: email.split("@")[0] })),
      cc: [],
      subject: data.subject,
      bodyPreview: data.bodyHtml.replace(/<[^>]*>/g, "").slice(0, 100),
      bodyHtml: data.bodyHtml,
      sentAt: new Date().toISOString(),
      isRead: true,
      attachments: [],
    };

    return newMessage;
  }

  return api.post<Message>(`/hubs/${hubId}/portal/messages`, data);
}
