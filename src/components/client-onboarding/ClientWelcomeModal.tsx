/**
 * Client Welcome Modal - One-time welcome for clients accessing a converted hub
 *
 * Shows on first visit after hub conversion. Dismissal stored in localStorage.
 * Introduces new client hub features with visual highlights.
 */

import { useState, useEffect } from "react";
import {
  MessageSquareText,
  ClipboardCheck,
  BarChart3,
  History,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClientWelcomeModalProps {
  hubId: string;
  hubName: string;
  onDismiss?: () => void;
}

const STORAGE_KEY_PREFIX = "agentflow_client_welcome_dismissed_";

const features = [
  {
    icon: MessageSquareText,
    title: "Instant Answers",
    description: "Ask questions about your project and get instant AI-powered responses.",
    color: "text-[hsl(var(--bold-royal-blue))]",
    bgColor: "bg-[hsl(var(--bold-royal-blue))]/10",
  },
  {
    icon: ClipboardCheck,
    title: "Decision Queue",
    description: "See items waiting for your input in one clear list.",
    color: "text-[hsl(var(--sage-green))]",
    bgColor: "bg-[hsl(var(--sage-green))]/10",
  },
  {
    icon: BarChart3,
    title: "Performance",
    description: "Track project progress with clear summaries and insights.",
    color: "text-[hsl(var(--soft-coral))]",
    bgColor: "bg-[hsl(var(--soft-coral))]/10",
  },
  {
    icon: History,
    title: "History",
    description: "Access your complete relationship history and key milestones.",
    color: "text-[hsl(var(--dark-grey))]",
    bgColor: "bg-[hsl(var(--light-grey))]",
  },
];

export function ClientWelcomeModal({
  hubId,
  hubName,
  onDismiss,
}: ClientWelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const storageKey = `${STORAGE_KEY_PREFIX}${hubId}`;

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, new Date().toISOString());
    setIsOpen(false);
    onDismiss?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[hsl(var(--bold-royal-blue))]/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[hsl(var(--bold-royal-blue))]" />
          </div>
          <DialogTitle className="text-xl">
            Welcome to your Client Hub!
          </DialogTitle>
          <DialogDescription className="text-base">
            Now that we're working together on {hubName}, you have access to
            new features designed to keep you informed and in control.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 p-3 rounded-lg border border-[hsl(var(--light-grey))]"
            >
              <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-[hsl(var(--dark-grey))]">
                  {feature.title}
                </h4>
                <p className="text-xs text-[hsl(var(--medium-grey))] mt-0.5">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleDismiss} className="w-full">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
