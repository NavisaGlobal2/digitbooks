
import { InvoiceStatus } from "@/types/invoice";

interface StatusBadgeProps {
  status: InvoiceStatus;
}

const InvoiceStatusBadge = ({ status }: StatusBadgeProps) => {
  const statusStyles = {
    pending: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700"
  };
  
  const statusText = {
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {statusText[status]}
    </span>
  );
};

export default InvoiceStatusBadge;
