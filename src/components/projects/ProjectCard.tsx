/**
 * Project Card - Display a single project with status and milestones
 */

import { Calendar, User, ChevronRight, Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const statusColors: Record<Project["status"], string> = {
  active: "bg-[hsl(var(--sage-green))] text-white",
  on_hold: "bg-[hsl(var(--gradient-purple))] text-white",
  completed: "bg-[hsl(var(--bold-royal-blue))] text-white",
  cancelled: "bg-[hsl(var(--medium-grey))] text-white",
};

const statusLabels: Record<Project["status"], string> = {
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const completedMilestones = project.milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const totalMilestones = project.milestones.length;

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[hsl(var(--dark-grey))] truncate group-hover:text-[hsl(var(--bold-royal-blue))] transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-[hsl(var(--medium-grey))] mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <Badge className={statusColors[project.status]}>
            {statusLabels[project.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--medium-grey))]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Started {formatDate(project.startDate)}</span>
            </div>
            {project.targetEndDate && (
              <div className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Target {formatDate(project.targetEndDate)}</span>
              </div>
            )}
          </div>

          {/* Lead and milestones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {project.leadName && (
                <div className="flex items-center gap-1 text-xs text-[hsl(var(--medium-grey))]">
                  <User className="w-3.5 h-3.5" />
                  <span>{project.leadName}</span>
                </div>
              )}
            </div>

            {totalMilestones > 0 && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-[hsl(var(--medium-grey))]">
                  {completedMilestones}/{totalMilestones} milestones
                </div>
                <div className="w-16 h-1.5 bg-[hsl(var(--medium-grey))]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[hsl(var(--sage-green))] rounded-full transition-all"
                    style={{
                      width: `${(completedMilestones / totalMilestones) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* View details hint */}
          <div className="flex items-center justify-end text-xs text-[hsl(var(--bold-royal-blue))] opacity-0 group-hover:opacity-100 transition-opacity">
            View details
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
