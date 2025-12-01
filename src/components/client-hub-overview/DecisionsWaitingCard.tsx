/**
 * DecisionsWaitingCard - Prominent card showing pending client decisions
 *
 * Displays pending decisions (open/in_review) sorted by urgency.
 * Most important card on client hub overview - surfaces blockers first.
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { useDecisions } from "@/hooks";
import type { DecisionItem } from "@/types";

interface DecisionsWaitingCardProps {
  hubId: string;
}

const MAX_DISPLAY_COUNT = 3;

/**
 * Sort decisions by urgency: dueDate ascending, fallback to createdAt
 */
function sortByUrgency(decisions: DecisionItem[]): DecisionItem[] {
  return [...decisions].sort((a, b) => {
    // Items with dueDate come first, sorted ascending
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    // Both without dueDate: sort by createdAt ascending
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * Format due date as human-readable urgency string
 */
function formatDueDate(dueDate: string | undefined): string {
  if (!dueDate) return "No due date";

  const target = new Date(dueDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return absDays === 1 ? "1 day overdue" : `${absDays} days overdue`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return `Due ${target.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`;
}

/**
 * Get urgency level for styling and accessibility
 */
function getUrgencyLevel(dueDate: string | undefined): "overdue" | "urgent" | "normal" {
  if (!dueDate) return "normal";

  const target = new Date(dueDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "urgent";
  return "normal";
}

const urgencyStyles = {
  overdue: {
    icon: AlertTriangle,
    iconClass: "text-red-600",
    textClass: "text-red-600 font-medium",
    label: "Overdue",
  },
  urgent: {
    icon: Clock,
    iconClass: "text-amber-600",
    textClass: "text-amber-600 font-medium",
    label: "Urgent",
  },
  normal: {
    icon: Clock,
    iconClass: "text-[hsl(var(--medium-grey))]",
    textClass: "text-[hsl(var(--medium-grey))]",
    label: "",
  },
};

export function DecisionsWaitingCard({ hubId }: DecisionsWaitingCardProps) {
  const navigate = useNavigate();

  // Fetch pending decisions (open or in_review status)
  const { data, isLoading, error } = useDecisions(hubId, {
    pageSize: 10, // Fetch more than we display to ensure we have enough after filtering
  });

  // Filter for pending decisions only (open or in_review)
  const pendingDecisions = (data?.items || []).filter(
    (d) => d.status === "open" || d.status === "in_review"
  );
  const sortedDecisions = sortByUrgency(pendingDecisions);
  const displayDecisions = sortedDecisions.slice(0, MAX_DISPLAY_COUNT);
  const totalPending = pendingDecisions.length;

  const handleViewAll = () => {
    navigate(`/portal/${hubId}/decisions`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Unable to load decisions</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - all caught up
  if (totalPending === 0) {
    return (
      <Card className="border-l-4 border-l-[hsl(var(--sage-green))]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[hsl(var(--sage-green))]/10">
              <CheckCircle2 className="h-6 w-6 text-[hsl(var(--sage-green))]" />
            </div>
            <div>
              <h3 className="font-semibold text-[hsl(var(--dark-grey))]">
                You're all caught up
              </h3>
              <p className="text-sm text-[hsl(var(--medium-grey))]">
                No decisions waiting on you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Decisions waiting state
  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with count - aria-live for accessibility */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
                Decisions Waiting on You
              </h3>
              <span
                className="px-2 py-0.5 text-sm font-medium bg-amber-100 text-amber-800 rounded-full"
                aria-live="polite"
                aria-atomic="true"
              >
                {totalPending}
              </span>
            </div>
          </div>

          {/* Decision list */}
          <div className="space-y-3" role="list" aria-label="Pending decisions">
            {displayDecisions.map((decision) => {
              const urgency = getUrgencyLevel(decision.dueDate);
              const style = urgencyStyles[urgency];
              const UrgencyIcon = style.icon;

              return (
                <div
                  key={decision.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  role="listitem"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[hsl(var(--dark-grey))] truncate">
                      {decision.title}
                    </p>
                    {decision.description && (
                      <p className="text-sm text-[hsl(var(--medium-grey))] truncate">
                        {decision.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-4 shrink-0">
                    <UrgencyIcon
                      className={`h-4 w-4 ${style.iconClass}`}
                      aria-hidden="true"
                    />
                    <span className={`text-sm ${style.textClass}`}>
                      {/* Screen reader gets full context */}
                      <span className="sr-only">
                        {style.label ? `${style.label}: ` : ""}
                      </span>
                      {formatDueDate(decision.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All CTA */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewAll}
          >
            View All Decisions
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
