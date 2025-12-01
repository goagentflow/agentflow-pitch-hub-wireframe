/**
 * Stale Data Warning - Warning banner when portfolio data is old
 */

import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaleDataWarningProps {
  dataStaleTimestamp: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

// Stale threshold: 24 hours
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function isStale(isoDate: string): boolean {
  const now = new Date();
  const date = new Date(isoDate);
  return now.getTime() - date.getTime() > STALE_THRESHOLD_MS;
}

function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "less than an hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function StaleDataWarning({
  dataStaleTimestamp,
  onRefresh,
  isRefreshing = false,
}: StaleDataWarningProps) {
  if (!isStale(dataStaleTimestamp)) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">
          Data last updated {formatTimeAgo(dataStaleTimestamp)}. Consider refreshing for
          the latest metrics.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex-shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
      >
        {isRefreshing ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-1" />
        )}
        Refresh
      </Button>
    </div>
  );
}
