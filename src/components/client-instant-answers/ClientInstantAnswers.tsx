/**
 * Client Instant Answers - Main AI Q&A interface for clients
 *
 * Features:
 * - Question input with suggested questions as chips
 * - Real-time polling for answer status
 * - Recent answers list
 * - Empty state with onboarding guidance
 * - Supports seeding from QuickAskInput via location.state.answerId
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquareText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateInstantAnswer,
  useInstantAnswer,
  useRecentInstantAnswers,
} from "@/hooks";
import { InstantAnswerInput } from "./InstantAnswerInput";
import { InstantAnswerCard } from "./InstantAnswerCard";

interface ClientInstantAnswersProps {
  hubId: string;
}

// Type for location state from QuickAskInput navigation
interface LocationState {
  answerId?: string;
}

export function ClientInstantAnswers({ hubId }: ClientInstantAnswersProps) {
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Initialize from location state if navigated from QuickAskInput
  const [pendingAnswerId, setPendingAnswerId] = useState<string | null>(
    locationState?.answerId || null
  );

  // Clear location state after seeding to prevent re-seeding on refresh
  useEffect(() => {
    if (locationState?.answerId) {
      window.history.replaceState({}, document.title);
    }
  }, [locationState?.answerId]);

  const createAnswer = useCreateInstantAnswer(hubId);
  const { data: pendingAnswer } = useInstantAnswer(
    hubId,
    pendingAnswerId || "",
    2000
  );
  const { data: recentAnswers, isLoading, error } = useRecentInstantAnswers(hubId);

  const handleSubmit = async (question: string) => {
    try {
      const result = await createAnswer.mutateAsync({ question });
      setPendingAnswerId(result.answerId);
    } catch {
      // Error handled by mutation
    }
  };

  // Clear pending answer when it completes
  if (pendingAnswer?.status === "ready" || pendingAnswer?.status === "error") {
    if (pendingAnswerId) {
      setTimeout(() => setPendingAnswerId(null), 500);
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load instant answers. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const hasAnswers = (recentAnswers && recentAnswers.length > 0) || pendingAnswer;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-[hsl(var(--bold-royal-blue))]" />
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InstantAnswerInput
            onSubmit={handleSubmit}
            isSubmitting={createAnswer.isPending}
            disabled={!!pendingAnswerId && pendingAnswer?.status === "queued"}
          />
          {createAnswer.isError && (
            <p className="text-sm text-[hsl(var(--soft-coral))] mt-2">
              Failed to submit question. Please try again.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Answers Section */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !hasAnswers ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* Show pending answer first */}
          {pendingAnswer && (
            <InstantAnswerCard answer={pendingAnswer} isLatest />
          )}

          {/* Recent answers */}
          {recentAnswers?.map((answer) => (
            <InstantAnswerCard
              key={answer.id}
              answer={answer}
              isLatest={!pendingAnswer && answer.id === recentAnswers[0]?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--bold-royal-blue))]/10 flex items-center justify-center mx-auto mb-4">
        <MessageSquareText className="w-6 h-6 text-[hsl(var(--bold-royal-blue))]" />
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
        Ask me anything about your project
      </h3>
      <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto">
        Get instant answers about project status, timelines, decisions, and more.
        Try clicking one of the suggested questions above.
      </p>
    </div>
  );
}
