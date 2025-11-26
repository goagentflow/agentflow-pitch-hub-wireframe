import { HubLayout } from "@/components/HubLayout";
import { OverviewSection } from "@/components/OverviewSection";
import { ProposalSection } from "@/components/ProposalSection";
import { useLocation } from "react-router-dom";

export default function HubDetail() {
  const location = useLocation();
  const path = location.pathname;

  const renderSection = () => {
    if (path.includes('/proposal')) return <ProposalSection />;
    return <OverviewSection />;
  };

  return (
    <HubLayout>
      {renderSection()}
    </HubLayout>
  );
}
