/**
 * Instant Answer Card - Display for a single answer with status handling
 */

import { Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InstantAnswerJob, ConfidenceLevel } from "@/types";

interface InstantAnswerCardProps {
  answer: InstantAnswerJob;
  isLatest?: boolean;
}

const confidenceColors: Record<ConfidenceLevel, string> = {
  high: "bg-[hsl(var(--sage-green))]/10 text-[hsl(var(--sage-green))]",
  medium: "bg-[hsl(var(--bold-royal-blue))]/10 text-[hsl(var(--bold-royal-blue))]",
  low: "bg-[hsl(var(--soft-coral))]/10 text-[hsl(var(--soft-coral))]",
};

// Stale threshold: 24 hours
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function isStale(isoDate: string): boolean {
  const now = new Date();
  const date = new Date(isoDate);
  return now.getTime() - date.getTime() > STALE_THRESHOLD_MS;
}

function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function InstantAnswerCard({ answer, isLatest = false }: InstantAnswerCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  // Queued state - show loading
  if (answer.status === "queued") {
    return (
      <Card className={isLatest ? "border-[hsl(var(--bold-royal-blue))]" : ""}>
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-[hsl(var(--dark-grey))] mb-3">
            {answer.question}
          </p>
          <div className="flex items-center gap-2 text-[hsl(var(--medium-grey))]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Preparing your answer...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (answer.status === "error") {
    return (
      <Card className="border-[hsl(var(--soft-coral))]/50">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-[hsl(var(--dark-grey))] mb-3">
            {answer.question}
          </p>
          <div className="flex items-center gap-2 text-[hsl(var(--soft-coral))]">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              {answer.error || "Unable to find an answer. Please try rephrasing your question."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready state - show answer
  return (
    <Card className={isLatest ? "border-[hsl(var(--bold-royal-blue))]" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-[hsl(var(--dark-grey))]">
            {answer.question}
          </p>
          <div className="flex items-center gap-2">
            {isStale(answer.createdAt) && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200">
                Stale
              </Badge>
            )}
            <span className="text-xs text-[hsl(var(--medium-grey))] whitespace-nowrap">
              {formatTimeAgo(answer.createdAt)}
            </span>
          </div>
        </div>

        <p className="text-sm text-[hsl(var(--dark-grey))] mb-3">
          {answer.answer}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {answer.confidence && (
              <Badge variant="outline" className={confidenceColors[answer.confidence]}>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {answer.confidence} confidence
              </Badge>
            )}
            {answer.source && (
              <span className="text-xs text-[hsl(var(--medium-grey))]">
                Source: {answer.source}
              </span>
            )}
          </div>

          {answer.evidence && answer.evidence.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs"
            >
              {showEvidence ? (
                <>
                  Hide evidence
                  <ChevronUp className="w-3 h-3 ml-1" />
                </>
              ) : (
                <>
                  View evidence
                  <ChevronDown className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {showEvidence && answer.evidence && (
          <div className="mt-3 pt-3 border-t border-[hsl(var(--light-grey))] space-y-2">
            {answer.evidence.map((ev) => (
              <div
                key={ev.id}
                className="text-xs bg-[hsl(var(--light-grey))]/50 p-2 rounded"
              >
                <div className="flex items-center gap-2 text-[hsl(var(--medium-grey))] mb-1">
                  <span className="capitalize">{ev.source.replace("_", " ")}</span>
                  <span>•</span>
                  <span>{new Date(ev.date).toLocaleDateString()}</span>
                  {ev.redacted && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      Redacted
                    </Badge>
                  )}
                </div>
                <p className="text-[hsl(var(--dark-grey))]">{ev.excerpt}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
