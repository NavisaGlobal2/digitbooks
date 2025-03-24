
import { Banknote } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface RevenueEmptyStateProps {
  onAddRevenue: () => void;
  onImportRevenue: () => void;
}

const RevenueEmptyState = ({ onAddRevenue, onImportRevenue }: RevenueEmptyStateProps) => {
  return (
    <EmptyState
      icon={<Banknote className="w-20 h-20 text-gray-400" strokeWidth={1.5} />}
      title="No revenue created"
      description="Click on the 'New revenue' button to create your first revenue entry."
      primaryAction={{
        label: "New revenue",
        onClick: onAddRevenue,
      }}
      secondaryAction={{
        label: "Import revenue",
        onClick: onImportRevenue,
      }}
    />
  );
};

export default RevenueEmptyState;
