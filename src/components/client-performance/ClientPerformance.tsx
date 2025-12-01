/**
 * Client Performance - KPI narratives and project performance summaries
 *
 * Features:
 * - Latest performance narrative display
 * - Empty state when no data available
 * - Async polling for generation
 */

import { useState } from "react";
import { BarChart3, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useLatestPerformanceNarrative,
  useGeneratePerformanceNarrative,
  usePerformanceNarrative,
} from "@/hooks";
import { PerformanceNarrativeCard } from "./PerformanceNarrativeCard";

interface ClientPerformanceProps {
  hubId: string;
  projectId?: string;
}

export function ClientPerformance({ hubId, projectId }: ClientPerformanceProps) {
  const [pendingNarrativeId, setPendingNarrativeId] = useState<string | null>(null);

  const {
    data: latestNarrative,
    isLoading,
    error,
    refetch,
  } = useLatestPerformanceNarrative(hubId);

  const generateNarrative = useGeneratePerformanceNarrative(hubId);

  const { data: pendingNarrative } = usePerformanceNarrative(
    hubId,
    pendingNarrativeId || ""
  );

  // Clear pending when it completes
  if (pendingNarrative?.status === "ready" || pendingNarrative?.status === "error") {
    if (pendingNarrativeId) {
      setTimeout(() => {
        setPendingNarrativeId(null);
        refetch();
      }, 500);
    }
  }

  const handleGenerate = async () => {
    try {
      const result = await generateNarrative.mutateAsync({ projectId });
      setPendingNarrativeId(result.narrativeId);
    } catch {
      // Error handled by mutation
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load performance data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  // Show pending narrative if generating
  if (pendingNarrative) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
            Performance
          </h2>
        </div>
        <PerformanceNarrativeCard narrative={pendingNarrative} />
      </div>
    );
  }

  // Empty state
  if (!latestNarrative) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
            Performance
          </h2>
        </div>
        <EmptyState onGenerate={handleGenerate} isGenerating={generateNarrative.isPending} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
          Performance
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={generateNarrative.isPending || !!pendingNarrativeId}
        >
          {generateNarrative.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      <PerformanceNarrativeCard narrative={latestNarrative} />
    </div>
  );
}

function EmptyState({
  onGenerate,
  isGenerating,
}: {
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-[hsl(var(--light-grey))] rounded-lg">
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--bold-royal-blue))]/10 flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-6 h-6 text-[hsl(var(--bold-royal-blue))]" />
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
        Performance Insights
      </h3>
      <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto mb-4">
        Get AI-generated summaries of your project progress and recommendations
        based on recent activity.
      </p>
      <Button onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <BarChart3 className="w-4 h-4 mr-2" />
        )}
        Generate Summary
      </Button>
    </div>
  );
}
