/**
 * RecentMessagesCard - Shows latest message threads for client hub overview
 *
 * "What did I miss?" at a glance.
 * Uses usePortalMessages (NOT staff useMessages) per spec.
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  ChevronRight,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { usePortalMessages } from "@/hooks";
import type { MessageThreadSummary } from "@/types";

interface RecentMessagesCardProps {
  hubId: string;
}

const MAX_MESSAGES_DISPLAY = 3;

/**
 * Format relative time since last message
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

function MessageThreadItem({ thread }: { thread: MessageThreadSummary }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/portal/${thread.hubId}/messages`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left p-3 rounded-lg hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--bold-royal-blue))] focus:ring-offset-2"
      aria-label={`${thread.isRead ? "" : "Unread: "}${thread.subject}`}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="pt-1.5">
          {!thread.isRead ? (
            <div
              className="w-2 h-2 rounded-full bg-[hsl(var(--soft-coral))]"
              aria-hidden="true"
            />
          ) : (
            <div className="w-2 h-2" aria-hidden="true" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-sm truncate ${
                thread.isRead
                  ? "text-[hsl(var(--dark-grey))]"
                  : "font-semibold text-[hsl(var(--dark-grey))]"
              }`}
            >
              {thread.subject}
            </p>
            <span className="text-xs text-[hsl(var(--medium-grey))] shrink-0">
              {formatRelativeTime(thread.lastMessageAt)}
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--medium-grey))] mt-0.5 truncate">
            {truncate(thread.lastMessagePreview, 60)}
          </p>
        </div>
      </div>
    </button>
  );
}

export function RecentMessagesCard({ hubId }: RecentMessagesCardProps) {
  const navigate = useNavigate();

  // Use portal messages hook (NOT staff useMessages) per spec Must Do #2
  const { data, isLoading, error } = usePortalMessages(hubId, {
    pageSize: MAX_MESSAGES_DISPLAY + 2, // Fetch extra in case some are archived
  });

  const handleViewAll = () => {
    navigate(`/portal/${hubId}/messages`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-[hsl(var(--medium-grey))]">
            <AlertTriangle className="h-5 w-5" />
            <span>Unable to load messages</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out archived messages and limit display
  const messages = (data?.items || [])
    .filter((m) => !m.isArchived)
    .slice(0, MAX_MESSAGES_DISPLAY);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  // Empty state
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[hsl(var(--medium-grey))]/10">
              <Inbox className="h-6 w-6 text-[hsl(var(--medium-grey))]" />
            </div>
            <div>
              <h3 className="font-semibold text-[hsl(var(--dark-grey))]">
                No messages yet
              </h3>
              <p className="text-sm text-[hsl(var(--medium-grey))]">
                Messages will appear here when you receive them
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail
                className="h-5 w-5 text-[hsl(var(--bold-royal-blue))]"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
                Latest Messages
              </h3>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 text-xs font-medium bg-[hsl(var(--soft-coral))]/10 text-[hsl(var(--soft-coral))] rounded-full"
                  aria-label={`${unreadCount} unread messages`}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          {/* Message list */}
          <div
            className="space-y-1"
            role="list"
            aria-label="Recent message threads"
          >
            {messages.map((thread) => (
              <div key={thread.id} role="listitem">
                <MessageThreadItem thread={thread} />
              </div>
            ))}
          </div>

          {/* View All CTA */}
          <Button variant="outline" className="w-full" onClick={handleViewAll}>
            View All Messages
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
