/**
 * Decision Empty State - Empty state for pending/completed decision lists
 */

import { ClipboardCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DecisionEmptyStateProps {
  type: "pending" | "completed";
  onCreate?: () => void;
}

export function DecisionEmptyState({ type, onCreate }: DecisionEmptyStateProps) {
  if (type === "pending") {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--sage-green))]/10 flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-6 h-6 text-[hsl(var(--sage-green))]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
          Nothing waiting on the client
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto mb-4">
          When you need client approval or a decision, create a request and
          they'll see it in their portal.
        </p>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Request Decision
          </Button>
        )}
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
        When clients approve or decline requests, they'll appear here.
      </p>
    </div>
  );
}
