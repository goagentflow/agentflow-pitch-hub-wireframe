/**
 * Project List - Grid display of all projects with filtering
 */

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks";
import { ProjectCard } from "./ProjectCard";
import { ProjectEmptyState } from "./ProjectEmptyState";
import { CreateProjectDialog } from "./CreateProjectDialog";
import type { ProjectStatus } from "@/types";

interface ProjectListProps {
  hubId: string;
  onSelectProject?: (projectId: string) => void;
}

export function ProjectList({ hubId, onSelectProject }: ProjectListProps) {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data, isLoading } = useProjects(hubId, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const projects = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-[hsl(var(--dark-grey))]">
            Projects
          </h2>
          {projects.length > 0 && (
            <span className="text-sm text-[hsl(var(--medium-grey))]">
              ({projects.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[hsl(var(--medium-grey))]" />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ProjectStatus | "all")}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create button */}
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[hsl(var(--bold-royal-blue))] hover:bg-[hsl(var(--bold-royal-blue))]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects grid or empty state */}
      {projects.length === 0 ? (
        <ProjectEmptyState onCreateProject={() => setShowCreateDialog(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject?.(project.id)}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateProjectDialog
        hubId={hubId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
