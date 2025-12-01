/**
 * Client Decision Queue - "Waiting on you" items list for clients
 *
 * Features:
 * - Filter by status (pending vs completed)
 * - Approve/decline actions with confirmation
 * - Clear empty state
 */

import { useState } from "react";
import { ClipboardCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDecisions, useUpdateDecision } from "@/hooks";
import type { DecisionStatus } from "@/types";
import { DecisionItemCard } from "./DecisionItemCard";

interface ClientDecisionQueueProps {
  hubId: string;
}

export function ClientDecisionQueue({ hubId }: ClientDecisionQueueProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: allDecisions, isLoading, error } = useDecisions(hubId);

  const pendingDecisions = allDecisions?.items.filter(
    (d) => d.status === "open" || d.status === "in_review"
  ) || [];

  const completedDecisions = allDecisions?.items.filter(
    (d) => d.status === "approved" || d.status === "declined"
  ) || [];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load decisions. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pending" | "completed")}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Needs Decision
            {pendingDecisions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingDecisions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            {completedDecisions.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {completedDecisions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingDecisions.length === 0 ? (
            <EmptyState type="pending" />
          ) : (
            <div className="space-y-3">
              {pendingDecisions.map((decision) => (
                <DecisionItemCardWrapper
                  key={decision.id}
                  hubId={hubId}
                  decision={decision}
                  isUpdating={updatingId === decision.id}
                  onUpdatingChange={(updating) =>
                    setUpdatingId(updating ? decision.id : null)
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedDecisions.length === 0 ? (
            <EmptyState type="completed" />
          ) : (
            <div className="space-y-3">
              {completedDecisions.map((decision) => (
                <DecisionItemCardWrapper
                  key={decision.id}
                  hubId={hubId}
                  decision={decision}
                  isUpdating={false}
                  onUpdatingChange={() => {}}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface DecisionItemCardWrapperProps {
  hubId: string;
  decision: {
    id: string;
    hubId: string;
    title: string;
    description?: string;
    dueDate?: string;
    requestedBy: string;
    requestedByName: string;
    assignee?: string;
    assigneeName?: string;
    status: DecisionStatus;
    relatedResource?: { type: "message" | "document" | "meeting"; id: string };
    createdAt: string;
    updatedAt: string;
    updatedBy?: string;
  };
  isUpdating: boolean;
  onUpdatingChange: (updating: boolean) => void;
}

function DecisionItemCardWrapper({
  hubId,
  decision,
  isUpdating,
  onUpdatingChange,
}: DecisionItemCardWrapperProps) {
  const updateDecision = useUpdateDecision(hubId, decision.id);

  const handleUpdateStatus = async (status: DecisionStatus, reason?: string) => {
    onUpdatingChange(true);
    try {
      await updateDecision.mutateAsync({ status, reason });
    } finally {
      onUpdatingChange(false);
    }
  };

  return (
    <DecisionItemCard
      hubId={hubId}
      decision={decision}
      onUpdateStatus={handleUpdateStatus}
      isUpdating={isUpdating || updateDecision.isPending}
    />
  );
}

function EmptyState({ type }: { type: "pending" | "completed" }) {
  if (type === "pending") {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--sage-green))]/10 flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-6 h-6 text-[hsl(var(--sage-green))]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
          No decisions waiting
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto">
          When your team needs your input on something, it will appear here.
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--light-grey))] flex items-center justify-center mx-auto mb-4">
        <ClipboardCheck className="w-6 h-6 text-[hsl(var(--medium-grey))]" />
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
        No completed decisions yet
      </h3>
      <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto">
        Decisions you approve or decline will appear here for reference.
      </p>
    </div>
  );
}
