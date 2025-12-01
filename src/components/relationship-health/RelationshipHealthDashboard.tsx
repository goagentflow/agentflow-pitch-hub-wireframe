/**
 * Relationship Health Dashboard - Full view of relationship health for a hub
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRelationshipHealth } from "@/hooks";
import { HealthScoreCard } from "./HealthScoreCard";
import { HealthDriversList } from "./HealthDriversList";

interface RelationshipHealthDashboardProps {
  hubId: string;
}

export function RelationshipHealthDashboard({
  hubId,
}: RelationshipHealthDashboardProps) {
  const { data: health, isLoading, error } = useRelationshipHealth(hubId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load relationship health data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-12 h-12 text-[hsl(var(--medium-grey))] mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
          Calculating Health Score
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto">
          We're analyzing your relationship data. This usually takes a few moments
          after hub conversion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HealthScoreCard
        score={health.score}
        status={health.status}
        trend={health.trend}
        lastCalculatedAt={health.lastCalculatedAt}
      />
      <HealthDriversList drivers={health.drivers} />
    </div>
  );
}
