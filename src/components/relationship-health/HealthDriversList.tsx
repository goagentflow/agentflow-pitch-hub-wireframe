/**
 * Health Drivers List - Shows factors contributing to health score
 */

import {
  Mail,
  Clock,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthDriver, HealthDriverType } from "@/types";

interface HealthDriversListProps {
  drivers: HealthDriver[];
}

const driverIcons: Record<HealthDriverType, typeof Mail> = {
  email_sentiment: Mail,
  response_time: Clock,
  meeting_attendance: Users,
  engagement_level: Activity,
  escalation_frequency: AlertTriangle,
  project_delivery: CheckCircle,
  invoice_status: Receipt,
};

const driverLabels: Record<HealthDriverType, string> = {
  email_sentiment: "Email Sentiment",
  response_time: "Response Time",
  meeting_attendance: "Meeting Attendance",
  engagement_level: "Engagement Level",
  escalation_frequency: "Escalation Frequency",
  project_delivery: "Project Delivery",
  invoice_status: "Invoice Status",
};

function getWeightColor(weight: number): string {
  if (weight >= 0.7) return "bg-[hsl(var(--sage-green))]";
  if (weight >= 0.4) return "bg-[hsl(var(--bold-royal-blue))]";
  return "bg-[hsl(var(--soft-coral))]";
}

function getWeightLabel(weight: number): string {
  if (weight >= 0.7) return "Positive";
  if (weight >= 0.4) return "Neutral";
  return "Needs attention";
}

export function HealthDriversList({ drivers }: HealthDriversListProps) {
  // Sort by weight descending
  const sortedDrivers = [...drivers].sort((a, b) => b.weight - a.weight);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[hsl(var(--dark-grey))]">
          Score Drivers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedDrivers.map((driver, index) => {
            const Icon = driverIcons[driver.type];
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[hsl(var(--warm-cream))]">
                  <Icon className="w-4 h-4 text-[hsl(var(--bold-royal-blue))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[hsl(var(--dark-grey))]">
                      {driverLabels[driver.type]}
                    </span>
                    <span className="text-xs text-[hsl(var(--medium-grey))]">
                      {getWeightLabel(driver.weight)}
                    </span>
                  </div>
                  {/* Weight bar */}
                  <div className="h-1.5 bg-[hsl(var(--medium-grey))]/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getWeightColor(
                        driver.weight
                      )}`}
                      style={{ width: `${driver.weight * 100}%` }}
                    />
                  </div>
                  {driver.excerpt && (
                    <p className="text-xs text-[hsl(var(--medium-grey))] mt-1 italic">
                      "{driver.excerpt}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
