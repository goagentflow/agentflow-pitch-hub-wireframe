/**
 * Client History - Institutional memory timeline for clients
 *
 * Features:
 * - Timeline view of relationship events
 * - Filter by event type
 * - Time period filter (defaults to "This year")
 * - Pagination for long histories
 */

import { useState } from "react";
import { History, AlertCircle, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useHistoryEvents } from "@/hooks";
import type { HistoryEventType } from "@/types";
import { HistoryEventCard } from "./HistoryEventCard";

interface ClientHistoryProps {
  hubId: string;
}

type TimePeriod = "all" | "this_year" | "last_6_months" | "last_30_days";

const timePeriodLabels: Record<TimePeriod, string> = {
  all: "All time",
  this_year: "This year",
  last_6_months: "Last 6 months",
  last_30_days: "Last 30 days",
};

const eventTypeLabels: Record<HistoryEventType, string> = {
  message: "Messages",
  meeting: "Meetings",
  document: "Documents",
  decision: "Decisions",
  milestone: "Milestones",
  conversion: "Conversion",
};

function getDateRange(period: TimePeriod): { fromDate?: string; toDate?: string } {
  const now = new Date();
  const toDate = now.toISOString();

  switch (period) {
    case "this_year":
      return {
        fromDate: new Date(now.getFullYear(), 0, 1).toISOString(),
        toDate,
      };
    case "last_6_months":
      return {
        fromDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        toDate,
      };
    case "last_30_days":
      return {
        fromDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        toDate,
      };
    default:
      return {};
  }
}

export function ClientHistory({ hubId }: ClientHistoryProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("this_year");
  const [selectedTypes, setSelectedTypes] = useState<HistoryEventType[]>([]);
  const [page, setPage] = useState(1);

  const dateRange = getDateRange(timePeriod);
  const typeFilter = selectedTypes.length > 0 ? selectedTypes[0] : undefined;

  const { data, isLoading, error } = useHistoryEvents(hubId, {
    ...dateRange,
    type: typeFilter,
    page,
    pageSize: 20,
  });

  const handleTypeToggle = (type: HistoryEventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setTimePeriod("this_year");
    setPage(1);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load history. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const events = data?.items || [];
  const totalPages = data ? Math.ceil(data.total / 20) : 1;
  const hasFilters = selectedTypes.length > 0 || timePeriod !== "this_year";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={timePeriod}
          onValueChange={(v) => {
            setTimePeriod(v as TimePeriod);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(timePeriodLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
              {selectedTypes.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-[hsl(var(--bold-royal-blue))] text-white rounded-full">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[hsl(var(--dark-grey))]">
                Event Types
              </p>
              {(Object.keys(eventTypeLabels) as HistoryEventType[]).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <Label
                    htmlFor={type}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {eventTypeLabels[type]}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Timeline */}
      {events.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <div className="space-y-0">
          {events.map((event, index) => (
            <HistoryEventCard
              key={event.id}
              event={event}
              isFirst={index === 0}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-[hsl(var(--medium-grey))]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  if (hasFilters) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--light-grey))] flex items-center justify-center mx-auto mb-4">
          <Filter className="w-6 h-6 text-[hsl(var(--medium-grey))]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
          No matching events
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto mb-4">
          Try adjusting your filters to see more results.
        </p>
        <Button variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--bold-royal-blue))]/10 flex items-center justify-center mx-auto mb-4">
        <History className="w-6 h-6 text-[hsl(var(--bold-royal-blue))]" />
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
        Your relationship history
      </h3>
      <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto">
        Key moments and milestones in our partnership will appear here as your
        relationship grows.
      </p>
    </div>
  );
}
