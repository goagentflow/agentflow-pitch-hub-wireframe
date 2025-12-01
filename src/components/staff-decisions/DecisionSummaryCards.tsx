/**
 * Decision Summary Cards - Quick stats for staff decisions view
 */

import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DecisionSummaryCardsProps {
  pendingCount: number;
  overdueCount: number;
  completedCount: number;
}

export function DecisionSummaryCards({
  pendingCount,
  overdueCount,
  completedCount,
}: DecisionSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--soft-coral))]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[hsl(var(--soft-coral))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--dark-grey))]">
                {pendingCount}
              </p>
              <p className="text-sm text-[hsl(var(--medium-grey))]">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--soft-coral))]/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--soft-coral))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--soft-coral))]">
                {overdueCount}
              </p>
              <p className="text-sm text-[hsl(var(--medium-grey))]">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--sage-green))]/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--sage-green))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--dark-grey))]">
                {completedCount}
              </p>
              <p className="text-sm text-[hsl(var(--medium-grey))]">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
