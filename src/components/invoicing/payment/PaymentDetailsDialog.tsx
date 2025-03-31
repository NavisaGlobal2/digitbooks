
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNaira } from "@/utils/invoice/formatters";
import { Invoice, PaymentRecord } from "@/types/invoice";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  isLoading?: boolean;
}

export const PaymentDetailsDialog = ({ 
  open, 
  onOpenChange, 
  invoice,
  isLoading = false
}: PaymentDetailsDialogProps) => {
  const payments = invoice.payments || [];
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = invoice.amount - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payment Details - {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client</p>
              <p className="text-sm">{invoice.clientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice Amount</p>
              <p className="text-sm">{formatNaira(invoice.amount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
              <p className="text-sm font-medium text-green-600">{formatNaira(totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Balance</p>
              <p className={`text-sm font-medium ${balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {formatNaira(balance)}
              </p>
            </div>
          </div>
          
          <h3 className="text-sm font-medium mb-2">Payment History</h3>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : payments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(payment.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell>{payment.reference || "-"}</TableCell>
                      <TableCell className="text-right">{formatNaira(payment.amount)}</TableCell>
                      <TableCell>
                        {payment.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View receipt"
                          >
                            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No payment details available.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
