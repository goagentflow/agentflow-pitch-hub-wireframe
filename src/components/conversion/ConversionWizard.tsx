/**
 * Conversion Wizard - Multi-step dialog for converting pitch to client hub
 *
 * Steps:
 * 1. Celebrate - Congratulations screen
 * 2. Preview - What changes after conversion
 * 3. First Project - Optional initial project setup
 * 4. Confirm - Final confirmation
 */

import { useState } from "react";
import { PartyPopper, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConvertToClientHub } from "@/hooks";
import { CelebrateStep } from "./CelebrateStep";
import { PreviewStep } from "./PreviewStep";
import { ProjectStep } from "./ProjectStep";
import { ConfirmStep } from "./ConfirmStep";

interface ConversionWizardProps {
  hubId: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type WizardStep = "celebrate" | "preview" | "project" | "confirm";

const STEPS: WizardStep[] = ["celebrate", "preview", "project", "confirm"];

export function ConversionWizard({
  hubId,
  companyName,
  open,
  onOpenChange,
  onSuccess,
}: ConversionWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("celebrate");
  const [projectName, setProjectName] = useState("");
  const convertMutation = useConvertToClientHub(hubId);

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleConfirm = async () => {
    try {
      await convertMutation.mutateAsync(
        projectName ? { initialProjectName: projectName } : undefined
      );
      onOpenChange(false);
      onSuccess?.();
      // Reset state for next use
      setCurrentStep("celebrate");
      setProjectName("");
    } catch {
      // Error is handled by mutation state
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setCurrentStep("celebrate");
      setProjectName("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--bold-royal-blue))]">
            <PartyPopper className="w-5 h-5" />
            Convert to Client Hub
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 py-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentIndex
                  ? "bg-[hsl(var(--bold-royal-blue))]"
                  : "bg-[hsl(var(--medium-grey))] opacity-30"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="py-4">
          {currentStep === "celebrate" && (
            <CelebrateStep companyName={companyName} />
          )}
          {currentStep === "preview" && <PreviewStep />}
          {currentStep === "project" && (
            <ProjectStep
              projectName={projectName}
              onProjectNameChange={setProjectName}
            />
          )}
          {currentStep === "confirm" && (
            <ConfirmStep
              companyName={companyName}
              projectName={projectName}
              error={convertMutation.error?.message}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep || convertMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleConfirm}
              disabled={convertMutation.isPending}
              className="bg-[hsl(var(--bold-royal-blue))] hover:bg-[hsl(var(--bold-royal-blue))]/90"
            >
              {convertMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert Hub"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-[hsl(var(--bold-royal-blue))] hover:bg-[hsl(var(--bold-royal-blue))]/90"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
