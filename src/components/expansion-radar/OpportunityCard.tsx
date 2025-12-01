/**
 * Opportunity Card - Display an expansion opportunity with evidence
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateExpansionOpportunity } from "@/hooks";
import { EvidenceCard } from "./EvidenceCard";
import type { ExpansionOpportunity, ExpansionStatus, ExpansionConfidence } from "@/types";

interface OpportunityCardProps {
  hubId: string;
  opportunity: ExpansionOpportunity;
}

const confidenceColors: Record<ExpansionConfidence, string> = {
  high: "bg-[hsl(var(--sage-green))] text-white",
  medium: "bg-[hsl(var(--bold-royal-blue))] text-white",
  low: "bg-[hsl(var(--medium-grey))] text-white",
};

const statusLabels: Record<ExpansionStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  won: "Won",
  lost: "Lost",
};

export function OpportunityCard({ hubId, opportunity }: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const updateMutation = useUpdateExpansionOpportunity(hubId, opportunity.id);

  const handleStatusChange = async (newStatus: ExpansionStatus) => {
    try {
      await updateMutation.mutateAsync({ status: newStatus });
    } catch {
      // Error handled by mutation
    }
  };

  const isTerminal = opportunity.status === "won" || opportunity.status === "lost";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[hsl(var(--dark-grey))] mb-1">
              {opportunity.title}
            </h4>
            {opportunity.description && (
              <p className="text-sm text-[hsl(var(--medium-grey))] line-clamp-2">
                {opportunity.description}
              </p>
            )}
          </div>
          <Badge className={confidenceColors[opportunity.confidence]}>
            {opportunity.confidence} confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--medium-grey))]">Status:</span>
              {isTerminal ? (
                <Badge
                  variant="outline"
                  className={
                    opportunity.status === "won"
                      ? "border-[hsl(var(--sage-green))] text-[hsl(var(--sage-green))]"
                      : "border-[hsl(var(--medium-grey))] text-[hsl(var(--medium-grey))]"
                  }
                >
                  {statusLabels[opportunity.status]}
                </Badge>
              ) : (
                <Select
                  value={opportunity.status}
                  onValueChange={(v) => handleStatusChange(v as ExpansionStatus)}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    {updateMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <span className="text-xs text-[hsl(var(--medium-grey))]">
              {opportunity.evidence.length} evidence items
            </span>
          </div>

          {/* Evidence toggle */}
          {opportunity.evidence.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[hsl(var(--bold-royal-blue))]"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Evidence
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Evidence
                  </>
                )}
              </Button>

              {expanded && (
                <div className="space-y-2 pt-2 border-t">
                  {opportunity.evidence.map((ev) => (
                    <EvidenceCard key={ev.id} evidence={ev} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Notes */}
          {opportunity.notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-[hsl(var(--medium-grey))]">
                <span className="font-medium">Notes:</span> {opportunity.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
