
import { Invoice, PaymentRecord } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import { ArrowDownCircle, CheckCircle, Clock } from "lucide-react";

interface PaymentStatsCardsProps {
  invoices: Invoice[];
}

const PaymentStatsCards = ({ invoices }: PaymentStatsCardsProps) => {
  // Calculate total payment metrics
  const calculatePaymentStats = () => {
    let totalPaid = 0;
    let totalPartial = 0;
    let totalOverdue = 0;
    
    invoices.forEach(invoice => {
      const paymentTotal = invoice.payments?.reduce(
        (sum, payment) => sum + payment.amount, 0
      ) || 0;
      
      if (invoice.status === 'paid') {
        totalPaid += invoice.amount;
      } else if (invoice.status === 'partially-paid') {
        totalPartial += invoice.amount - paymentTotal;
      } else if (invoice.status === 'overdue') {
        totalOverdue += invoice.amount;
      }
    });
    
    return { totalPaid, totalPartial, totalOverdue };
  };
  
  const { totalPaid, totalPartial, totalOverdue } = calculatePaymentStats();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Total Received</span>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold">{formatNaira(totalPaid)}</span>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <div className="flex items-center gap-2">
          <ArrowDownCircle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Outstanding Partial</span>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold">{formatNaira(totalPartial)}</span>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">Overdue</span>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold">{formatNaira(totalOverdue)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatsCards;
