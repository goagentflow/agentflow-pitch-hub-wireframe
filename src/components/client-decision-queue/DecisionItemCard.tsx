/**
 * Decision Item Card - Individual decision with status and actions
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  Calendar,
  User,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { DecisionItem, DecisionStatus } from "@/types";

interface DecisionItemCardProps {
  hubId: string;
  decision: DecisionItem;
  onUpdateStatus: (status: DecisionStatus, reason?: string) => Promise<void>;
  isUpdating?: boolean;
}

const statusConfig: Record<
  DecisionStatus,
  { label: string; color: string; bgColor: string }
> = {
  open: {
    label: "Needs Decision",
    color: "text-[hsl(var(--soft-coral))]",
    bgColor: "bg-[hsl(var(--soft-coral))]/10",
  },
  in_review: {
    label: "In Review",
    color: "text-[hsl(var(--bold-royal-blue))]",
    bgColor: "bg-[hsl(var(--bold-royal-blue))]/10",
  },
  approved: {
    label: "Approved",
    color: "text-[hsl(var(--sage-green))]",
    bgColor: "bg-[hsl(var(--sage-green))]/10",
  },
  declined: {
    label: "Declined",
    color: "text-[hsl(var(--medium-grey))]",
    bgColor: "bg-[hsl(var(--light-grey))]",
  },
};

const resourceIcons = {
  document: FileText,
  message: MessageSquare,
  meeting: Calendar,
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDueDateStatus(dueDate?: string): { label: string; isOverdue: boolean } {
  if (!dueDate) return { label: "", isOverdue: false };

  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
  if (diffDays === 0) return { label: "Due today", isOverdue: false };
  if (diffDays === 1) return { label: "Due tomorrow", isOverdue: false };
  return { label: `Due in ${diffDays}d`, isOverdue: false };
}

function getResourceUrl(
  hubId: string,
  resource: { type: "document" | "message" | "meeting"; id: string }
): string {
  const routeMap: Record<string, string> = {
    document: "documents",
    message: "messages",
    meeting: "meetings",
  };
  return `/portal/${hubId}/${routeMap[resource.type]}`;
}

export function DecisionItemCard({
  hubId,
  decision,
  onUpdateStatus,
  isUpdating = false,
}: DecisionItemCardProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [reason, setReason] = useState("");

  const status = statusConfig[decision.status];
  const dueStatus = getDueDateStatus(decision.dueDate);
  const ResourceIcon = decision.relatedResource
    ? resourceIcons[decision.relatedResource.type]
    : null;

  const handleApprove = async () => {
    await onUpdateStatus("approved", reason || undefined);
    setShowApproveDialog(false);
    setReason("");
  };

  const handleDecline = async () => {
    await onUpdateStatus("declined", reason || undefined);
    setShowDeclineDialog(false);
    setReason("");
  };

  const canApprove = decision.status === "open" || decision.status === "in_review";
  const canDecline = decision.status === "open" || decision.status === "in_review";
  const isTerminal = decision.status === "approved" || decision.status === "declined";

  return (
    <>
      <Card className={isTerminal ? "opacity-60" : ""}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-[hsl(var(--dark-grey))] mb-1">
                {decision.title}
              </h4>
              {decision.description && (
                <p className="text-sm text-[hsl(var(--medium-grey))] line-clamp-2">
                  {decision.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className={`${status.bgColor} ${status.color}`}>
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-[hsl(var(--medium-grey))] mb-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>From {decision.requestedByName}</span>
            </div>
            {decision.dueDate && (
              <div className={`flex items-center gap-1 ${dueStatus.isOverdue ? "text-[hsl(var(--soft-coral))]" : ""}`}>
                <Clock className="w-3 h-3" />
                <span>{dueStatus.label}</span>
              </div>
            )}
            {ResourceIcon && decision.relatedResource && (
              <Link
                to={getResourceUrl(hubId, decision.relatedResource)}
                className="flex items-center gap-1 text-[hsl(var(--bold-royal-blue))] hover:underline"
              >
                <ResourceIcon className="w-3 h-3" aria-hidden="true" />
                <span className="capitalize">View {decision.relatedResource.type}</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>

          {!isTerminal && (
            <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--light-grey))]">
              <Button
                size="sm"
                onClick={() => setShowApproveDialog(true)}
                disabled={!canApprove || isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeclineDialog(true)}
                disabled={!canDecline || isUpdating}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Decision</DialogTitle>
            <DialogDescription>
              You're approving: {decision.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="approve-reason">Add a note (optional)</Label>
            <Textarea
              id="approve-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Any additional comments..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Decision</DialogTitle>
            <DialogDescription>
              You're declining: {decision.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="decline-reason">Reason for declining</Label>
            <Textarea
              id="decline-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDecline} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
