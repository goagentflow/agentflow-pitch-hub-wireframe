/**
 * Evidence Card - Display a single piece of evidence for an opportunity
 */

import { Mail, FileText, Users, MessageSquare, AlertCircle } from "lucide-react";
import type { Evidence, EvidenceSource } from "@/types";

interface EvidenceCardProps {
  evidence: Evidence;
}

const sourceIcons: Record<EvidenceSource, typeof Mail> = {
  email: Mail,
  meeting_transcript: Users,
  document: FileText,
  chat: MessageSquare,
};

const sourceLabels: Record<EvidenceSource, string> = {
  email: "Email",
  meeting_transcript: "Meeting",
  document: "Document",
  chat: "Chat",
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const Icon = sourceIcons[evidence.source];

  return (
    <div className="p-3 rounded-lg bg-[hsl(var(--warm-cream))] border border-[hsl(var(--gradient-blue))]/10">
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded bg-white">
          <Icon className="w-3.5 h-3.5 text-[hsl(var(--bold-royal-blue))]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[hsl(var(--dark-grey))]">
              {sourceLabels[evidence.source]}
            </span>
            <span className="text-xs text-[hsl(var(--medium-grey))]">
              {formatDate(evidence.date)}
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--medium-grey))] line-clamp-2 italic">
            "{evidence.excerpt}"
          </p>
          {evidence.redacted && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 text-[hsl(var(--gradient-purple))]" />
              <span className="text-xs text-[hsl(var(--gradient-purple))]">
                Some content redacted for privacy
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
