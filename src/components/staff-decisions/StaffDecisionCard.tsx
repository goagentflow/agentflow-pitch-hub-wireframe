/**
 * Staff Decision Card - Individual decision item for staff view
 */

import { Link } from "react-router-dom";
import { FileText, MessageSquare, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DecisionItem, DecisionRelatedResource } from "@/types";
import { statusConfig, formatDate, getDaysUntilDue } from "./decision-utils";

interface StaffDecisionCardProps {
  decision: DecisionItem;
  hubId: string;
  isCompleted?: boolean;
}

const resourceConfig = {
  document: { icon: FileText, label: "Document", path: "documents" },
  message: { icon: MessageSquare, label: "Message", path: "messages" },
  meeting: { icon: Calendar, label: "Meeting", path: "meetings" },
};

function getResourceUrl(hubId: string, resource: DecisionRelatedResource): string {
  const config = resourceConfig[resource.type];
  return `/hub/${hubId}/${config.path}`;
}

export function StaffDecisionCard({
  decision,
  hubId,
  isCompleted = false,
}: StaffDecisionCardProps) {
  const status = statusConfig[decision.status];
  const dueInfo = getDaysUntilDue(decision.dueDate);
  const StatusIcon = status.icon;
  const relatedResource = decision.relatedResource;

  return (
    <Card className={isCompleted ? "opacity-70" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-[hsl(var(--dark-grey))]">
                {decision.title}
              </h4>
              <Badge
                variant="outline"
                className={`${status.bgColor} ${status.color}`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            {!isCompleted && decision.description && (
              <p className="text-sm text-[hsl(var(--medium-grey))] line-clamp-2 mb-2">
                {decision.description}
              </p>
            )}
            {relatedResource && (
              <div className="mb-2">
                <Link to={getResourceUrl(hubId, relatedResource)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-[hsl(var(--bold-royal-blue))] hover:bg-[hsl(var(--bold-royal-blue))]/5"
                  >
                    {(() => {
                      const config = resourceConfig[relatedResource.type];
                      const ResourceIcon = config.icon;
                      return (
                        <>
                          <ResourceIcon className="w-3 h-3 mr-1" />
                          View {config.label}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </>
                      );
                    })()}
                  </Button>
                </Link>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--medium-grey))]">
              {isCompleted ? (
                <>
                  <span>
                    {decision.status === "approved" ? "Approved" : "Declined"}{" "}
                    {formatDate(decision.updatedAt)}
                  </span>
                  {decision.assigneeName && (
                    <span>By {decision.assigneeName}</span>
                  )}
                </>
              ) : (
                <>
                  <span>Requested {formatDate(decision.createdAt)}</span>
                  {decision.assigneeName && (
                    <span>Assigned to {decision.assigneeName}</span>
                  )}
                  {decision.dueDate && (
                    <span
                      className={
                        dueInfo.isOverdue
                          ? "text-[hsl(var(--soft-coral))] font-medium"
                          : ""
                      }
                    >
                      {dueInfo.text}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
