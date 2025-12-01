/**
 * Project Step - Optional first project creation
 * Guided setup for initial project in client hub
 */

import { FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectStepProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export function ProjectStep({ projectName, onProjectNameChange }: ProjectStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--gradient-blue))]/10 mb-3">
          <FolderPlus className="w-6 h-6 text-[hsl(var(--bold-royal-blue))]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
          Create Your First Project
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))]">
          Projects help organize work into distinct workstreams
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-[hsl(var(--dark-grey))]">
          Project Name
        </Label>
        <Input
          id="project-name"
          placeholder="e.g., Website Redesign, Q1 Campaign"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="border-[hsl(var(--medium-grey))]/30"
        />
        <p className="text-xs text-[hsl(var(--medium-grey))]">
          Leave blank to skip — you can create projects later
        </p>
      </div>

      <div className="p-3 rounded-lg bg-[hsl(var(--warm-cream))] border border-[hsl(var(--gradient-blue))]/20">
        <p className="text-xs text-[hsl(var(--medium-grey))]">
          <strong className="text-[hsl(var(--dark-grey))]">Tip:</strong> Projects
          let you group documents, videos, messages, and meetings. This makes it
          easy to track progress and keep clients informed about specific
          initiatives.
        </p>
      </div>
    </div>
  );
}
