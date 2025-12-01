/**
 * UpcomingCard - Shows next meeting and upcoming milestones
 *
 * "What should I prepare for?" at a glance.
 * Displays next scheduled meeting with join button.
 * Meeting prep link deferred to v2.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  AlertTriangle,
  CalendarCheck,
} from "lucide-react";
import { usePortalMeetings, useProjects } from "@/hooks";
import { getCurrentMilestone, formatDaysUntil } from "@/lib/projectStatus";
import type { Meeting, Project, ProjectMilestone } from "@/types";

interface UpcomingCardProps {
  hubId: string;
}

/**
 * Format meeting datetime for display
 */
function formatMeetingTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const dateStr = start.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const startTimeStr = start.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTimeStr = end.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr} · ${startTimeStr} - ${endTimeStr}`;
}

/**
 * Get relative time description
 */
function getRelativeTime(startTime: string): string {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return "Started";
  if (diffHours < 1) return "Starting soon";
  if (diffHours < 24) return `In ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return formatDaysUntil(startTime);
}

function NextMeetingSection({ meeting }: { meeting: Meeting }) {
  const relativeTime = getRelativeTime(meeting.startTime);
  const isStartingSoon =
    new Date(meeting.startTime).getTime() - Date.now() < 1000 * 60 * 60; // < 1 hour

  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-[hsl(var(--bold-royal-blue))]" aria-hidden="true" />
          <span
            className={`text-sm font-medium ${
              isStartingSoon
                ? "text-[hsl(var(--soft-coral))]"
                : "text-[hsl(var(--medium-grey))]"
            }`}
          >
            {relativeTime}
          </span>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-[hsl(var(--dark-grey))]">{meeting.title}</h4>
        <p className="text-sm text-[hsl(var(--medium-grey))] mt-1">
          {formatMeetingTime(meeting.startTime, meeting.endTime)}
        </p>
      </div>

      {meeting.joinUrl && (
        <Button
          variant="default"
          size="sm"
          className="w-full bg-[hsl(var(--bold-royal-blue))] hover:bg-[hsl(var(--bold-royal-blue))]/90"
          asChild
        >
          <a
            href={meeting.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Join meeting: ${meeting.title}`}
          >
            Join Meeting
            <ExternalLink className="h-3.5 w-3.5 ml-2" aria-hidden="true" />
          </a>
        </Button>
      )}
    </div>
  );
}

function UpcomingMilestoneItem({
  milestone,
  projectName,
}: {
  milestone: ProjectMilestone;
  projectName: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[hsl(var(--dark-grey))] truncate">
          {milestone.name}
        </p>
        <p className="text-xs text-[hsl(var(--medium-grey))] truncate">{projectName}</p>
      </div>
      <div className="text-xs text-[hsl(var(--medium-grey))] ml-2 shrink-0">
        {formatDaysUntil(milestone.targetDate)}
      </div>
    </div>
  );
}

export function UpcomingCard({ hubId }: UpcomingCardProps) {
  // Fetch next upcoming meeting (limit to 1)
  const {
    data: meetingsData,
    isLoading: meetingsLoading,
    error: meetingsError,
  } = usePortalMeetings(hubId, { pageSize: 5 });

  // Fetch active projects for milestone deadlines
  const {
    data: projectsData,
    isLoading: projectsLoading,
  } = useProjects(hubId, { status: "active", pageSize: 5 });

  const isLoading = meetingsLoading || projectsLoading;

  // Get next upcoming meeting (scheduled, not cancelled, in the future)
  // Sort by startTime ascending to ensure we get the earliest meeting first
  const upcomingMeetings = (
    meetingsData?.items?.filter(
      (m) =>
        m.status === "scheduled" &&
        new Date(m.startTime) > new Date()
    ) || []
  ).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const nextMeeting = upcomingMeetings[0];

  // Get upcoming milestones from active projects
  const upcomingMilestones: { milestone: ProjectMilestone; projectName: string }[] = [];
  const projects = projectsData?.items || [];

  projects.forEach((project: Project) => {
    const currentMilestone = getCurrentMilestone(project.milestones);
    if (currentMilestone) {
      upcomingMilestones.push({
        milestone: currentMilestone,
        projectName: project.name,
      });
    }
  });

  // Sort milestones by target date
  upcomingMilestones.sort(
    (a, b) =>
      new Date(a.milestone.targetDate).getTime() -
      new Date(b.milestone.targetDate).getTime()
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state (meetings)
  if (meetingsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-[hsl(var(--medium-grey))]">
            <AlertTriangle className="h-5 w-5" />
            <span>Unable to load upcoming events</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - nothing upcoming
  if (!nextMeeting && upcomingMilestones.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[hsl(var(--medium-grey))]/10">
              <CalendarCheck className="h-6 w-6 text-[hsl(var(--medium-grey))]" />
            </div>
            <div>
              <h3 className="font-semibold text-[hsl(var(--dark-grey))]">
                Nothing coming up
              </h3>
              <p className="text-sm text-[hsl(var(--medium-grey))]">
                No meetings or deadlines scheduled
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
          <div className="flex items-center gap-2">
            <Calendar
              className="h-5 w-5 text-[hsl(var(--bold-royal-blue))]"
              aria-hidden="true"
            />
            <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
              Coming Up Next
            </h3>
          </div>

          {/* Next meeting */}
          {nextMeeting && <NextMeetingSection meeting={nextMeeting} />}

          {/* Upcoming milestones */}
          {upcomingMilestones.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[hsl(var(--dark-grey))] mb-2">
                Upcoming Deadlines
              </h4>
              <div>
                {upcomingMilestones.slice(0, 3).map(({ milestone, projectName }) => (
                  <UpcomingMilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    projectName={projectName}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
