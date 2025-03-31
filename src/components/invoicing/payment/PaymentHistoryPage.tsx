
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { formatNaira } from '@/utils/invoice';
import { format } from 'date-fns';
import { Invoice } from '@/types/invoice';

interface PaymentHistoryPageProps {
  onBack: () => void;
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
        // Fetch all invoices that have payments
        const { data: invoicesData, error } = await supabase
          .from('invoices')
          .select('*')
          .in('status', ['paid', 'partially-paid'])
          .eq('user_id', user.id);

        if (error) throw error;

        // For each invoice, fetch its payments
        const invoicesWithPaymentsPromises = invoicesData.map(async (invoice) => {
          const { data: payments, error: paymentsError } = await supabase
            .from('invoice_payments')
            .select('*')
            .eq('invoice_id', invoice.id);

          if (paymentsError) {
            console.error("Failed to fetch payments for invoice:", invoice.id, paymentsError);
            return null;
          }

          // Map the payments to our format
          const formattedPayments = payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            date: new Date(payment.payment_date),
            method: payment.payment_method,
            reference: payment.reference || undefined,
            receiptUrl: payment.receipt_url || undefined
          }));

          // Convert DB invoice to our Invoice format
          return {
            id: invoice.id,
            clientName: invoice.client_name,
            clientEmail: invoice.client_email || undefined,
            clientAddress: invoice.client_address || undefined,
            invoiceNumber: invoice.invoice_number,
            issuedDate: new Date(invoice.issued_date),
            dueDate: new Date(invoice.due_date),
            amount: invoice.amount,
            status: invoice.status,
            items: invoice.items || [],
            logoUrl: invoice.logo_url || undefined,
            additionalInfo: invoice.additional_info || undefined,
            bankDetails: invoice.bank_details || {
              accountName: '',
              accountNumber: '',
              bankName: ''
            },
            paidDate: invoice.paid_date ? new Date(invoice.paid_date) : undefined,
            payments: formattedPayments
          };
        });

        const results = await Promise.all(invoicesWithPaymentsPromises);
        setInvoicesWithPayments(results.filter(Boolean) as Invoice[]);
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
                <h4 className="text-sm font-medium mb-3">Payment Records</h4>
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
