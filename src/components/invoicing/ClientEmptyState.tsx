
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface ClientEmptyStateProps {
  onAddClient: () => void;
}

const ClientEmptyState = ({ onAddClient }: ClientEmptyStateProps) => {
  return (
    <EmptyState
      icon={<Users className="w-20 h-20 text-blue-500" strokeWidth={1.5} />}
      title="No clients added yet"
      description="Add your first client to start creating invoices for them."
      primaryAction={{
        label: "Add client",
        onClick: onAddClient,
      }}
    />
  );
};

export default ClientEmptyState;
