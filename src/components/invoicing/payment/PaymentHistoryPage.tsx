
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { PaymentRecord } from '@/types/invoice';
import { toast } from 'sonner';
import { Clock, CreditCard, Download, ChevronLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNaira } from '@/utils/invoice/formatters';
import { downloadReceipt } from '@/utils/invoice/documentActions';

interface PaymentHistoryProps {
  onBack: () => void;
}

interface PaymentWithInvoice {
  id: string;
  paymentDate: Date;
  amount: number;
  method: string;
  reference?: string;
  receiptUrl?: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
}

const PaymentHistoryPage: React.FC<PaymentHistoryProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCollected, setTotalCollected] = useState(0);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // Get payments with invoice information
        const { data, error } = await supabase
          .from('invoice_payments')
          .select(`
            id,
            payment_date,
            amount,
            payment_method,
            reference,
            receipt_url,
            invoice_id,
            invoices (
              invoice_number,
              client_name
            )
          `)
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false });
          
        if (error) {
          throw error;
        }

        // Format payment data
        const formattedPayments = data.map((payment: any) => ({
          id: payment.id,
          paymentDate: new Date(payment.payment_date),
          amount: payment.amount,
          method: payment.payment_method,
          reference: payment.reference,
          receiptUrl: payment.receipt_url,
          invoiceId: payment.invoice_id,
          invoiceNumber: payment.invoices?.invoice_number || 'Unknown',
          clientName: payment.invoices?.client_name || 'Unknown',
        }));

        setPayments(formattedPayments);

        // Calculate total amount collected
        const total = formattedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        setTotalCollected(total);

      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        toast.error("Failed to load payment history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  const handleDownloadReceipt = async (payment: PaymentWithInvoice) => {
    try {
      // Fetch invoice details
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', payment.invoiceId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Create a fake invoice object with the payment
      const invoiceWithPayment = {
        id: invoice.id,
        clientName: invoice.client_name,
        clientEmail: invoice.client_email,
        clientAddress: invoice.client_address,
        invoiceNumber: invoice.invoice_number,
        issuedDate: new Date(invoice.issued_date),
        dueDate: new Date(invoice.due_date),
        amount: invoice.amount,
        status: invoice.status,
        items: invoice.items,
        logoUrl: invoice.logo_url,
        additionalInfo: invoice.additional_info,
        bankDetails: invoice.bank_details,
        paidDate: payment.paymentDate,
        payments: [{
          amount: payment.amount,
          date: payment.paymentDate,
          method: payment.method,
          reference: payment.reference,
          receiptUrl: payment.receiptUrl
        }]
      };
      
      await downloadReceipt(invoiceWithPayment);
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2" 
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-xl font-bold">Payment History</h2>
        </div>

        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-md flex items-center">
          <span className="font-medium mr-2">Total Collected:</span>
          <span className="font-bold">{formatNaira(totalCollected)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No payments recorded yet</h3>
          <p className="mt-2 text-muted-foreground">
            Payments will appear here once invoices are marked as paid
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(payment.paymentDate, 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{payment.invoiceNumber}</TableCell>
                  <TableCell>{payment.clientName}</TableCell>
                  <TableCell className="capitalize">{payment.method}</TableCell>
                  <TableCell>{payment.reference || '-'}</TableCell>
                  <TableCell className="text-right">{formatNaira(payment.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadReceipt(payment)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
