
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { PaymentHistoryItem } from './PaymentHistoryItem';
import { PaymentHistoryEmpty } from './PaymentHistoryEmpty';

interface PaymentHistoryPageProps {
  onBack: () => void;
}

const PaymentHistoryPage = ({ onBack }: PaymentHistoryPageProps) => {
  const { invoicesWithPayments, isLoading, handleDownloadReceipt } = usePaymentHistory();

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
        <PaymentHistoryEmpty />
      ) : (
        <div className="space-y-6">
          {invoicesWithPayments.map(invoice => (
            <PaymentHistoryItem 
              key={invoice.id}
              invoice={invoice}
              onDownloadReceipt={handleDownloadReceipt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
