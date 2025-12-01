/**
 * Project Empty State - Displayed when no projects exist
 */

import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectEmptyStateProps {
  onCreateProject: () => void;
}

export function ProjectEmptyState({ onCreateProject }: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--gradient-blue))]/10 mb-4">
        <FolderPlus className="w-8 h-8 text-[hsl(var(--bold-royal-blue))]" />
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
        No projects yet
      </h3>
      <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mb-6">
        Create your first project to start tracking work. Projects help organize
        documents, videos, messages, and meetings into distinct workstreams.
      </p>
      <Button
        onClick={onCreateProject}
        className="bg-[hsl(var(--bold-royal-blue))] hover:bg-[hsl(var(--bold-royal-blue))]/90"
      >
        <FolderPlus className="w-4 h-4 mr-2" />
        Create Project
      </Button>
    </div>
  );
}
