/**
 * Preview Step - Shows what changes after conversion
 * Before/after comparison of features
 */

import { Check, Archive, Plus } from "lucide-react";

interface ChangeItem {
  icon: typeof Check;
  text: string;
  type: "add" | "archive" | "keep";
}

const changes: ChangeItem[] = [
  { icon: Plus, text: "Projects for managing multiple workstreams", type: "add" },
  { icon: Plus, text: "Relationship Health scoring", type: "add" },
  { icon: Plus, text: "Expansion Radar for opportunities", type: "add" },
  { icon: Plus, text: "Client Decision Queue", type: "add" },
  { icon: Plus, text: "Instant Answers for clients", type: "add" },
  { icon: Archive, text: "Proposal archived to Documents", type: "archive" },
  { icon: Check, text: "All existing content preserved", type: "keep" },
];

export function PreviewStep() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))]">
          What Changes?
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))]">
          Your Client Hub unlocks new features for ongoing service delivery
        </p>
      </div>

      <div className="space-y-2">
        {changes.map((change, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              change.type === "add"
                ? "bg-[hsl(var(--sage-green))]/10"
                : change.type === "archive"
                ? "bg-[hsl(var(--gradient-purple))]/10"
                : "bg-[hsl(var(--warm-cream))]"
            }`}
          >
            <change.icon
              className={`w-4 h-4 ${
                change.type === "add"
                  ? "text-[hsl(var(--sage-green))]"
                  : change.type === "archive"
                  ? "text-[hsl(var(--rich-violet))]"
                  : "text-[hsl(var(--bold-royal-blue))]"
              }`}
            />
            <span className="text-sm text-[hsl(var(--dark-grey))]">
              {change.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
