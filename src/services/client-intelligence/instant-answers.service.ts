/**
 * Instant Answers service
 *
 * AI-powered Q&A using async job pattern:
 * POST creates job → GET polls for result
 */

import type { InstantAnswerRequest, InstantAnswerJob } from "@/types";
import { api, isMockApiEnabled, simulateDelay, ApiRequestError } from "../api";
import { mockInstantAnswers } from "../mock-data-client-hub";

/**
 * Submit an instant answer question (creates async job)
 * Poll using pollIntervalHint until status !== "queued"
 */
export async function createInstantAnswer(
  hubId: string,
  data: InstantAnswerRequest
): Promise<{
  answerId: string;
  status: "queued";
  createdAt: string;
  expiresAt: string;
  pollIntervalHint: number;
}> {
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
 * Poll using pollIntervalHint until status !== "queued"
 */
export async function getInstantAnswer(
  hubId: string,
  answerId: string
): Promise<InstantAnswerJob> {
  if (isMockApiEnabled()) {
    await simulateDelay(100);

    const answer = mockInstantAnswers.find(
      (a) => a.id === answerId && a.hubId === hubId
    );
    if (!answer) {
      throw new ApiRequestError(
        { code: "NOT_FOUND", message: "Answer not found or expired" },
        404
      );
    }
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
