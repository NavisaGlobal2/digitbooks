
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { formatNaira } from '@/utils/invoice';
import { format } from 'date-fns';
import { Invoice, PaymentRecord } from '@/types/invoice';

interface PaymentHistoryPageProps {
  onBack: () => void;
}

interface DbInvoice {
  id: string;
  client_name: string;
  invoice_number: string;
  issued_date: string;
  due_date: string;
  amount: number;
  status: string;
  items: any;
  logo_url?: string;
  additional_info?: string;
  bank_details: any;
}

interface DbPayment {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  receipt_url?: string;
}

const PaymentHistoryPage = ({ onBack }: PaymentHistoryPageProps) => {
  const [invoicesWithPayments, setInvoicesWithPayments] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        // Fetch all invoices that have payments (both paid and partially-paid)
        const { data: invoicesData, error } = await supabase
          .from('invoices')
          .select('*')
          .in('status', ['paid', 'partially-paid'])
          .eq('user_id', user.id);

        if (error) throw error;

        // For each invoice, fetch its payments
        const invoicesWithPaymentsPromises = invoicesData.map(async (invoice: DbInvoice) => {
          const { data: payments, error: paymentsError } = await supabase
            .from('invoice_payments')
            .select('*')
            .eq('invoice_id', invoice.id);

          if (paymentsError) {
            console.error("Failed to fetch payments for invoice:", invoice.id, paymentsError);
            return null;
          }

          // Map the payments to our format
          const formattedPayments: PaymentRecord[] = payments.map((payment: DbPayment) => ({
            amount: payment.amount,
            date: new Date(payment.payment_date),
            method: payment.payment_method,
            reference: payment.reference || undefined,
            receiptUrl: payment.receipt_url || undefined
          }));

          // Parse JSON fields from the database
          const parsedItems = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
          const parsedBankDetails = typeof invoice.bank_details === 'string' ? 
            JSON.parse(invoice.bank_details) : 
            invoice.bank_details;

          // Convert DB invoice to our Invoice format with type assertion
          const formattedInvoice = {
            id: invoice.id,
            clientName: invoice.client_name,
            clientEmail: undefined,
            clientAddress: undefined,
            invoiceNumber: invoice.invoice_number,
            issuedDate: new Date(invoice.issued_date),
            dueDate: new Date(invoice.due_date),
            amount: invoice.amount,
            status: invoice.status,
            items: parsedItems,
            logoUrl: invoice.logo_url || undefined,
            additionalInfo: invoice.additional_info || undefined,
            bankDetails: parsedBankDetails,
            paidDate: undefined, // This field doesn't exist in the database
            payments: formattedPayments
          } as Invoice;

          return formattedInvoice;
        });

        const results = await Promise.all(invoicesWithPaymentsPromises);
        
        // Sort by payment date (most recent first)
        const sortedInvoices = results
          .filter(Boolean) as Invoice[]
          .sort((a, b) => {
            // Get the most recent payment date for each invoice
            const latestPaymentA = a.payments && a.payments.length > 0 
              ? Math.max(...a.payments.map(p => p.date.getTime())) 
              : a.issuedDate.getTime();
              
            const latestPaymentB = b.payments && b.payments.length > 0 
              ? Math.max(...b.payments.map(p => p.date.getTime())) 
              : b.issuedDate.getTime();
              
            return latestPaymentB - latestPaymentA;
          });
          
        setInvoicesWithPayments(sortedInvoices);
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        toast.error("Failed to load payment history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  const handleDownloadReceipt = async (receiptUrl?: string) => {
    if (!receiptUrl) {
      toast.error("No receipt available for this payment");
      return;
    }

    try {
      window.open(receiptUrl, '_blank');
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  const getTotalPaid = (payments?: PaymentRecord[]) => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getRemainingAmount = (invoice: Invoice) => {
    const totalPaid = getTotalPaid(invoice.payments);
    return invoice.amount - totalPaid;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Payment History</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading payment history...</div>
      ) : invoicesWithPayments.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-1">No payment records found</h3>
          <p className="text-gray-500">Payments for your invoices will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {invoicesWithPayments.map(invoice => (
            <div key={invoice.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{invoice.clientName}</h3>
                    <p className="text-sm text-gray-500">Invoice: {invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNaira(invoice.amount)}</div>
                    <p className="text-sm text-gray-500">
                      {format(invoice.issuedDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Payment Records</h4>
                  {invoice.status === 'partially-paid' && (
                    <div className="text-sm text-amber-600 font-medium">
                      Remaining: {formatNaira(getRemainingAmount(invoice))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {invoice.payments?.map((payment, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{formatNaira(payment.amount)}</div>
                        <div className="text-sm text-gray-500">
                          {payment.method} • {format(payment.date, 'MMM d, yyyy')}
                        </div>
                        {payment.reference && (
                          <div className="text-xs text-gray-500">Ref: {payment.reference}</div>
                        )}
                      </div>
                      {payment.receiptUrl && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadReceipt(payment.receiptUrl)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-2 flex justify-end">
                    <div className="bg-gray-50 px-3 py-1.5 rounded-md">
                      <span className="text-sm text-gray-500">Total paid: </span>
                      <span className="font-medium">{formatNaira(getTotalPaid(invoice.payments))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
