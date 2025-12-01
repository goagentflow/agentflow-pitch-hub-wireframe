/**
 * Performance Narrative Card - Display for performance summaries and recommendations
 */

import { Loader2, TrendingUp, Lightbulb, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PerformanceNarrative } from "@/types";

interface PerformanceNarrativeCardProps {
  narrative: PerformanceNarrative;
}

// Stale threshold: 24 hours
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function isStale(isoDate?: string): boolean {
  if (!isoDate) return false;
  const now = new Date();
  const date = new Date(isoDate);
  return now.getTime() - date.getTime() > STALE_THRESHOLD_MS;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function PerformanceNarrativeCard({
  narrative,
}: PerformanceNarrativeCardProps) {
  // Queued state
  if (narrative.status === "queued") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--bold-royal-blue))] mb-4" />
            <h3 className="font-medium text-[hsl(var(--dark-grey))] mb-1">
              Generating Performance Summary
            </h3>
            <p className="text-sm text-[hsl(var(--medium-grey))]">
              We're analyzing your project data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (narrative.status === "error") {
    return (
      <Card className="border-[hsl(var(--soft-coral))]/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-[hsl(var(--soft-coral))]">
              Unable to generate performance summary. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready state
  const stale = isStale(narrative.generatedAt);

  return (
    <div className="space-y-4">
      {/* Stale data warning */}
      {stale && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">This summary is over 24 hours old. Consider refreshing for latest data.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--medium-grey))]">
          <Calendar className="w-4 h-4" />
          <span>{narrative.period}</span>
        </div>
        <div className="flex items-center gap-2">
          {stale && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200">
              Stale
            </Badge>
          )}
          {narrative.generatedAt && (
            <span className="text-xs text-[hsl(var(--medium-grey))]">
              Generated {formatDate(narrative.generatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Summaries */}
      {narrative.summaries && narrative.summaries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--bold-royal-blue))]" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {narrative.summaries.map((summary, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-[hsl(var(--dark-grey))]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--bold-royal-blue))] mt-2 flex-shrink-0" />
                  {summary}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {narrative.recommendations && narrative.recommendations.length > 0 && (
        <Card className="bg-[hsl(var(--sage-green))]/5 border-[hsl(var(--sage-green))]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[hsl(var(--sage-green))]" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {narrative.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-[hsl(var(--dark-grey))]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--sage-green))] mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
