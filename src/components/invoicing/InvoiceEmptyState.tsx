
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface InvoiceEmptyStateProps {
  onCreateInvoice: () => void;
}

const InvoiceEmptyState = ({ onCreateInvoice }: InvoiceEmptyStateProps) => {
  return (
    <EmptyState
      icon={<FileText className="w-20 h-20 text-blue-500" strokeWidth={1.5} />}
      title="No invoices created"
      description="Create your first invoice to start tracking payments from your clients."
      primaryAction={{
        label: "Create invoice",
        onClick: onCreateInvoice,
      }}
    />
  );
};

export default InvoiceEmptyState;
