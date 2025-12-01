/**
 * Staff Decisions Section - "Waiting on Client" view for staff
 *
 * Shows all decisions awaiting client action with ability to:
 * - View pending/completed decisions
 * - Create new decision requests
 */

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDecisions, useCreateDecision } from "@/hooks";
import { useHubId } from "@/contexts/hub-context";
import {
  DecisionSummaryCards,
  StaffDecisionCard,
  CreateDecisionDialog,
  DecisionEmptyState,
  getDaysUntilDue,
} from "./staff-decisions";

export function StaffDecisionsSection() {
  const hubId = useHubId();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: allDecisions, isLoading, error } = useDecisions(hubId);
  const createDecision = useCreateDecision(hubId);

  const pendingDecisions =
    allDecisions?.items.filter(
      (d) => d.status === "open" || d.status === "in_review"
    ) || [];

  const completedDecisions =
    allDecisions?.items.filter(
      (d) => d.status === "approved" || d.status === "declined"
    ) || [];

  const overdueCount = pendingDecisions.filter(
    (d) => d.dueDate && getDaysUntilDue(d.dueDate).isOverdue
  ).length;

  const handleCreateDecision = async (data: {
    title: string;
    description?: string;
    dueDate?: string;
  }) => {
    try {
      await createDecision.mutateAsync(data);
      toast({
        title: "Decision request created",
        description: "The client will see this in their Decisions queue.",
      });
      setShowCreateDialog(false);
    } catch {
      toast({
        title: "Failed to create decision",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--dark-grey))]">
            Decisions
          </h1>
          <p className="text-sm text-[hsl(var(--medium-grey))]">
            Items waiting on client approval or decision
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Decision
        </Button>
      </div>

      {/* Summary Cards */}
      <DecisionSummaryCards
        pendingCount={pendingDecisions.length}
        overdueCount={overdueCount}
        completedCount={completedDecisions.length}
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "pending" | "completed")}
      >
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Waiting on Client
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
            <DecisionEmptyState
              type="pending"
              onCreate={() => setShowCreateDialog(true)}
            />
          ) : (
            <div className="space-y-3">
              {pendingDecisions.map((decision) => (
                <StaffDecisionCard key={decision.id} decision={decision} hubId={hubId} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedDecisions.length === 0 ? (
            <DecisionEmptyState type="completed" />
          ) : (
            <div className="space-y-3">
              {completedDecisions.map((decision) => (
                <StaffDecisionCard
                  key={decision.id}
                  decision={decision}
                  hubId={hubId}
                  isCompleted
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Decision Dialog */}
      <CreateDecisionDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateDecision}
        isSubmitting={createDecision.isPending}
      />
    </div>
  );
}
