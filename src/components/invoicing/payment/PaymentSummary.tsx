
import { cn } from "@/lib/utils";

interface PaymentSummaryProps {
  totalPaid: number;
  invoiceAmount: number;
}

export const PaymentSummary = ({ totalPaid, invoiceAmount }: PaymentSummaryProps) => {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Amount Paid:</span>
        <span className={cn(
          "font-bold",
          totalPaid < invoiceAmount ? "text-orange-600" : 
          totalPaid > invoiceAmount ? "text-blue-600" : "text-green-600"
        )}>
          ₦{totalPaid.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-muted-foreground">Invoice Amount:</span>
        <span className="text-sm">₦{invoiceAmount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm text-muted-foreground">Difference:</span>
        <span className={cn(
          "text-sm",
          totalPaid < invoiceAmount ? "text-orange-600" : 
          totalPaid > invoiceAmount ? "text-blue-600" : "text-green-600"
        )}>
          {totalPaid === invoiceAmount ? "None" : 
           totalPaid < invoiceAmount ? `-₦${(invoiceAmount - totalPaid).toLocaleString()} (Partially Paid)` :
           `+₦${(totalPaid - invoiceAmount).toLocaleString()} (Overpaid)`}
        </span>
      </div>
    </div>
  );
};
