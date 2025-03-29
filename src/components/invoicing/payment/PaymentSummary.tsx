
import { cn } from "@/lib/utils";

interface PaymentSummaryProps {
  totalPaid: number;
  invoiceAmount: number;
}

export const PaymentSummary = ({ totalPaid, invoiceAmount }: PaymentSummaryProps) => {
  // Calculate payment status and formatting
  const isPaid = totalPaid >= invoiceAmount;
  const isPartiallyPaid = totalPaid > 0 && totalPaid < invoiceAmount;
  const isOverpaid = totalPaid > invoiceAmount;
  
  const difference = Math.abs(totalPaid - invoiceAmount);
  
  // Determine status color
  const statusColor = isPartiallyPaid ? "text-orange-600" : 
                      isOverpaid ? "text-blue-600" : 
                      "text-green-600";
  
  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Amount Paid:</span>
        <span className={cn("font-bold", statusColor)}>
          ₦{totalPaid.toLocaleString()}
        </span>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-muted-foreground">Invoice Amount:</span>
        <span className="text-sm">₦{invoiceAmount.toLocaleString()}</span>
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm text-muted-foreground">Difference:</span>
        <span className={cn("text-sm", statusColor)}>
          {totalPaid === invoiceAmount ? "None" : 
           isPartiallyPaid ? `-₦${difference.toLocaleString()} (Partially Paid)` :
           `+₦${difference.toLocaleString()} (Overpaid)`}
        </span>
      </div>
    </div>
  );
};
