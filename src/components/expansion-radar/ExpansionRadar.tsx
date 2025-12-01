/**
 * Expansion Radar - Full view of expansion opportunities for a hub
 */

import { Radar, AlertCircle, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExpansionOpportunities } from "@/hooks";
import { OpportunityCard } from "./OpportunityCard";

interface ExpansionRadarProps {
  hubId: string;
}

export function ExpansionRadar({ hubId }: ExpansionRadarProps) {
  const { data, isLoading, error } = useExpansionOpportunities(hubId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load expansion opportunities. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const opportunities = data?.opportunities ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-[hsl(var(--bold-royal-blue))]" />
          <h2 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
            Expansion Radar
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-[hsl(var(--medium-grey))]" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Expansion Radar detects cross-sell opportunities by analyzing
                  emails, meetings, and documents for unmet needs.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {opportunities.length > 0 && (
          <span className="text-sm text-[hsl(var(--medium-grey))]">
            {opportunities.length} opportunities
          </span>
        )}
      </div>

      {/* Opportunities list */}
      {opportunities.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--gradient-blue))]/10 mb-4">
            <Radar className="w-8 h-8 text-[hsl(var(--bold-royal-blue))]" />
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
            No expansion opportunities detected yet
          </h3>
          <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto">
            As we analyze communications and project activity, we'll surface
            potential opportunities for additional services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              hubId={hubId}
              opportunity={opportunity}
            />
          ))}
        </div>
      )}

      {/* Last calculated timestamp */}
      {data?.lastCalculatedAt && (
        <p className="text-xs text-[hsl(var(--medium-grey))] text-right">
          Last analyzed:{" "}
          {new Date(data.lastCalculatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
