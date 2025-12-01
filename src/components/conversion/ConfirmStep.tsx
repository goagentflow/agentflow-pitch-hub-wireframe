/**
 * Confirm Step - Final confirmation before conversion
 * Shows summary and handles error display
 */

import { AlertCircle, CheckCircle, FolderPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfirmStepProps {
  companyName: string;
  projectName: string;
  error?: string;
}

export function ConfirmStep({ companyName, projectName, error }: ConfirmStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
          Ready to Convert
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))]">
          Please confirm the following changes
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--warm-cream))]">
          <CheckCircle className="w-5 h-5 text-[hsl(var(--sage-green))] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--dark-grey))]">
              Hub Type Change
            </p>
            <p className="text-xs text-[hsl(var(--medium-grey))]">
              <span className="font-medium">{companyName}</span> will become a
              Client Hub
            </p>
          </div>
        </div>

        {projectName && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--warm-cream))]">
            <FolderPlus className="w-5 h-5 text-[hsl(var(--bold-royal-blue))] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--dark-grey))]">
                First Project
              </p>
              <p className="text-xs text-[hsl(var(--medium-grey))]">
                Creating project: <span className="font-medium">{projectName}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--warm-cream))]">
          <CheckCircle className="w-5 h-5 text-[hsl(var(--sage-green))] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--dark-grey))]">
              Content Preserved
            </p>
            <p className="text-xs text-[hsl(var(--medium-grey))]">
              All documents, videos, messages, and meetings will be retained
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-center text-[hsl(var(--medium-grey))]">
        This action can be undone by an administrator if needed.
      </p>
    </div>
  );
}
