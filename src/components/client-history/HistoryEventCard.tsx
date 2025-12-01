/**
 * History Event Card - Individual event in the relationship timeline
 */

import {
  MessageSquare,
  Calendar,
  FileText,
  CheckCircle2,
  Milestone,
  Sparkles,
} from "lucide-react";
import type { InstitutionalMemoryEvent, HistoryEventType, EventSignificance } from "@/types";

interface HistoryEventCardProps {
  event: InstitutionalMemoryEvent;
  isFirst?: boolean;
  isLast?: boolean;
}

const eventTypeConfig: Record<
  HistoryEventType,
  { icon: typeof MessageSquare; color: string; bgColor: string; label: string }
> = {
  message: {
    icon: MessageSquare,
    color: "text-[hsl(var(--bold-royal-blue))]",
    bgColor: "bg-[hsl(var(--bold-royal-blue))]/10",
    label: "Message",
  },
  meeting: {
    icon: Calendar,
    color: "text-[hsl(var(--sage-green))]",
    bgColor: "bg-[hsl(var(--sage-green))]/10",
    label: "Meeting",
  },
  document: {
    icon: FileText,
    color: "text-[hsl(var(--soft-coral))]",
    bgColor: "bg-[hsl(var(--soft-coral))]/10",
    label: "Document",
  },
  decision: {
    icon: CheckCircle2,
    color: "text-[hsl(var(--dark-grey))]",
    bgColor: "bg-[hsl(var(--light-grey))]",
    label: "Decision",
  },
  milestone: {
    icon: Milestone,
    color: "text-[hsl(var(--bold-royal-blue))]",
    bgColor: "bg-[hsl(var(--bold-royal-blue))]/10",
    label: "Milestone",
  },
  conversion: {
    icon: Sparkles,
    color: "text-[hsl(var(--sage-green))]",
    bgColor: "bg-[hsl(var(--sage-green))]/10",
    label: "Became Client",
  },
};

const significanceStyles: Record<EventSignificance, string> = {
  high: "border-l-4 border-l-[hsl(var(--bold-royal-blue))]",
  medium: "border-l-4 border-l-[hsl(var(--light-grey))]",
  low: "",
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HistoryEventCard({
  event,
  isFirst = false,
  isLast = false,
}: HistoryEventCardProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center z-10`}
        >
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-[hsl(var(--light-grey))] min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 pb-6 ${isLast ? "pb-0" : ""} ${significanceStyles[event.significance]}`}
      >
        <div className="bg-white border border-[hsl(var(--light-grey))] rounded-lg p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-[hsl(var(--dark-grey))]">
              {event.title}
            </h4>
            <span className="text-xs text-[hsl(var(--medium-grey))] whitespace-nowrap">
              {formatDate(event.date)}
            </span>
          </div>
          <p className="text-sm text-[hsl(var(--medium-grey))]">
            {event.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}
            >
              {config.label}
            </span>
            {event.significance === "high" && (
              <span className="text-xs text-[hsl(var(--bold-royal-blue))]">
                Key moment
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
