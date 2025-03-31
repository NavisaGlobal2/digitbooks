
import React from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatNaira } from '@/utils/invoice';
import { Invoice, PaymentRecord } from '@/types/invoice';

interface PaymentHistoryItemProps {
  invoice: Invoice;
  onDownloadReceipt: (receiptUrl?: string) => void;
}

export const PaymentHistoryItem = ({ invoice, onDownloadReceipt }: PaymentHistoryItemProps) => {
  const getTotalPaid = (payments?: PaymentRecord[]) => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getRemainingAmount = (invoice: Invoice) => {
    const totalPaid = getTotalPaid(invoice.payments);
    return invoice.amount - totalPaid;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
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
                  onClick={() => onDownloadReceipt(payment.receiptUrl)}
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
  );
};
