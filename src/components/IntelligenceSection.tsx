/**
 * Intelligence Section - Combined view of Relationship Health + Expansion Radar
 *
 * Consolidates AI-powered intelligence features for staff:
 * - Relationship Health Dashboard (top)
 * - Expansion Radar (bottom)
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp } from "lucide-react";
import { RelationshipHealthDashboard } from "./relationship-health/RelationshipHealthDashboard";
import { ExpansionRadar } from "./expansion-radar/ExpansionRadar";
import { useHubId } from "@/contexts/hub-context";

export function IntelligenceSection() {
  const hubId = useHubId();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--dark-grey))]">
          Intelligence
        </h1>
        <p className="text-sm text-[hsl(var(--medium-grey))]">
          AI-powered insights about this client relationship
        </p>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList>
          <TabsTrigger value="health" className="gap-2">
            <Heart className="w-4 h-4" />
            Relationship Health
          </TabsTrigger>
          <TabsTrigger value="expansion" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Expansion Radar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <RelationshipHealthDashboard hubId={hubId} />
        </TabsContent>

        <TabsContent value="expansion" className="mt-6">
          <ExpansionRadar hubId={hubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
