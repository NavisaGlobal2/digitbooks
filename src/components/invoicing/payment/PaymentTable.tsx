
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface PaymentTableProps {
  invoices: Invoice[];
}

interface PaymentRecord {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  receipt_url: string | null;
}

const PaymentTable = ({ invoices }: PaymentTableProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Get database payments when viewing details
  useEffect(() => {
    const fetchPaymentsFromDatabase = async () => {
      if (!user || !selectedInvoiceId || !isDetailsOpen) return;
      
      setIsLoading(true);
      
      try {
        // Use type casting for the table name until proper types are set up
        const { data, error } = await supabase
          .from('invoice_payments' as any)
          .select('*')
          .eq('invoice_id', selectedInvoiceId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // If we have payment data in the database, update our local invoice with it
        if (data && data.length > 0) {
          // This just updates the UI for the payment details dialog
          // The actual state is managed in the InvoiceContext
          const payments = data.map((payment: PaymentRecord) => ({
            amount: payment.amount,
            date: new Date(payment.payment_date),
            method: payment.payment_method,
            reference: payment.reference || '',
            receiptUrl: payment.receipt_url || null
          }));
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        toast.error("Failed to load payment details from database");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentsFromDatabase();
  }, [user, selectedInvoiceId, isDetailsOpen]);

  const handleViewDetails = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailsOpen(true);
  };

  const selectedInvoice = invoices.find(invoice => invoice.id === selectedInvoiceId);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              // Calculate total paid amount
              const totalPaid = invoice.payments?.reduce(
                (sum, payment) => sum + payment.amount, 0
              ) || 0;
              
              // Calculate balance
              const balance = invoice.amount - totalPaid;
              
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>
                    {invoice.paidDate 
                      ? format(new Date(invoice.paidDate), "dd/MM/yyyy")
                      : format(new Date(invoice.issuedDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'partially-paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {invoice.status === 'paid' 
                        ? 'Paid' 
                        : invoice.status === 'partially-paid'
                          ? 'Partial'
                          : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatNaira(invoice.amount)}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatNaira(totalPaid)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-amber-600">
                    {formatNaira(balance)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(invoice.id)}
                      title="View payment details"
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedInvoice && (
        <PaymentDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          invoice={selectedInvoice}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default PaymentTable;
