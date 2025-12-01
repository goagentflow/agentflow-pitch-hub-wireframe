/**
 * Celebrate Step - First step of conversion wizard
 * Shows congratulatory message with celebration visual
 */

import { Sparkles } from "lucide-react";

interface CelebrateStepProps {
  companyName: string;
}

export function CelebrateStep({ companyName }: CelebrateStepProps) {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--gradient-blue))] to-[hsl(var(--gradient-purple))] mb-4">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[hsl(var(--bold-royal-blue))] mb-2">
        Congratulations!
      </h3>
      <p className="text-[hsl(var(--dark-grey))] mb-2">
        <span className="font-semibold">{companyName}</span> has chosen to work
        with you!
      </p>
      <p className="text-sm text-[hsl(var(--medium-grey))]">
        Let's convert this pitch into a Client Hub so you can deliver an
        exceptional experience.
      </p>
    </div>
  );
}
