/**
 * Health Score Card - Visual display of relationship health score
 */

import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { HealthStatus, HealthTrend } from "@/types";

interface HealthScoreCardProps {
  score: number;
  status: HealthStatus;
  trend: HealthTrend;
  lastCalculatedAt: string;
}

const statusColors: Record<HealthStatus, { bg: string; text: string; ring: string }> = {
  strong: {
    bg: "bg-[hsl(var(--sage-green))]/10",
    text: "text-[hsl(var(--sage-green))]",
    ring: "ring-[hsl(var(--sage-green))]",
  },
  stable: {
    bg: "bg-[hsl(var(--bold-royal-blue))]/10",
    text: "text-[hsl(var(--bold-royal-blue))]",
    ring: "ring-[hsl(var(--bold-royal-blue))]",
  },
  at_risk: {
    bg: "bg-[hsl(var(--soft-coral))]/10",
    text: "text-[hsl(var(--soft-coral))]",
    ring: "ring-[hsl(var(--soft-coral))]",
  },
};

const statusLabels: Record<HealthStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  at_risk: "At Risk",
};

const TrendIcon = ({ trend }: { trend: HealthTrend }) => {
  if (trend === "improving") {
    return <TrendingUp className="w-4 h-4 text-[hsl(var(--sage-green))]" />;
  }
  if (trend === "declining") {
    return <TrendingDown className="w-4 h-4 text-[hsl(var(--soft-coral))]" />;
  }
  return <Minus className="w-4 h-4 text-[hsl(var(--medium-grey))]" />;
};

function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function HealthScoreCard({
  score,
  status,
  trend,
  lastCalculatedAt,
}: HealthScoreCardProps) {
  const colors = statusColors[status];

  return (
    <Card className={`${colors.bg} border-0`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[hsl(var(--dark-grey))]">
            Relationship Health
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-[hsl(var(--medium-grey))]" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Health score is calculated from email sentiment, response times,
                  meeting attendance, and engagement patterns.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-6">
          {/* Score circle */}
          <div
            className={`relative w-24 h-24 rounded-full ring-4 ${colors.ring} flex items-center justify-center bg-white`}
          >
            <div className="text-center">
              <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
              <span className="text-xs text-[hsl(var(--medium-grey))] block">
                / 100
              </span>
            </div>
          </div>

          {/* Status and trend */}
          <div className="flex-1">
            <div className={`text-lg font-semibold ${colors.text} mb-1`}>
              {statusLabels[status]}
            </div>
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--medium-grey))]">
              <TrendIcon trend={trend} />
              <span className="capitalize">{trend}</span>
            </div>
            <div className="text-xs text-[hsl(var(--medium-grey))] mt-2">
              Updated {formatTimeAgo(lastCalculatedAt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
