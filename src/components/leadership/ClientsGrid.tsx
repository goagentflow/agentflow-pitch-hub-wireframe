/**
 * Clients Grid - Grid of client cards for portfolio view
 */

import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PortfolioClient } from "@/types";
import { ClientCard } from "./ClientCard";

interface ClientsGridProps {
  clients: PortfolioClient[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function ClientsGrid({
  clients,
  isLoading = false,
  emptyMessage = "No clients found",
  emptyDescription = "Try adjusting your filters or check back later.",
}: ClientsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--light-grey))] flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6 text-[hsl(var(--medium-grey))]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--dark-grey))] mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-[hsl(var(--medium-grey))] max-w-sm mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <ClientCard key={client.hubId} client={client} />
      ))}
    </div>
  );
}
