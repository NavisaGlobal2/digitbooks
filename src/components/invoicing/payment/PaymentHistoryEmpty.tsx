
import React from 'react';
import { FileText } from 'lucide-react';

export const PaymentHistoryEmpty = () => {
  return (
    <div className="text-center py-10 border rounded-lg">
      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-medium mb-1">No payment records found</h3>
      <p className="text-gray-500">Payments for your invoices will appear here</p>
    </div>
  );
};
