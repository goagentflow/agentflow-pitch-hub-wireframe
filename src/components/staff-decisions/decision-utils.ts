/**
 * Utility functions for staff decisions
 */

import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { DecisionStatus } from "@/types";

export const statusConfig: Record<
  DecisionStatus,
  { label: string; icon: typeof Clock; color: string; bgColor: string }
> = {
  open: {
    label: "Waiting",
    icon: Clock,
    color: "text-[hsl(var(--soft-coral))]",
    bgColor: "bg-[hsl(var(--soft-coral))]/10",
  },
  in_review: {
    label: "In Review",
    icon: Clock,
    color: "text-[hsl(var(--bold-royal-blue))]",
    bgColor: "bg-[hsl(var(--bold-royal-blue))]/10",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-[hsl(var(--sage-green))]",
    bgColor: "bg-[hsl(var(--sage-green))]/10",
  },
  declined: {
    label: "Declined",
    icon: XCircle,
    color: "text-[hsl(var(--medium-grey))]",
    bgColor: "bg-[hsl(var(--light-grey))]",
  },
};

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getDaysUntilDue(dueDate?: string): { text: string; isOverdue: boolean } {
  if (!dueDate) return { text: "", isOverdue: false };

  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
  if (diffDays === 0) return { text: "Due today", isOverdue: false };
  if (diffDays === 1) return { text: "Due tomorrow", isOverdue: false };
  return { text: `Due in ${diffDays}d`, isOverdue: false };
}

export function toISODate(dateString: string): string | undefined {
  if (!dateString) return undefined;
  return new Date(`${dateString}T00:00:00Z`).toISOString();
}
