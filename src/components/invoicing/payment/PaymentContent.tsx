import { useState, useEffect } from "react";
import { useInvoices } from "@/contexts/invoice";
import { Invoice } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import PaymentStatsCards from "./PaymentStatsCards";
import PaymentSearchBar from "./PaymentSearchBar";
import PaymentTable from "./PaymentTable";

interface PaymentContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const PaymentContent = ({ searchQuery, setSearchQuery }: PaymentContentProps) => {
  const { invoices } = useInvoices();
  const [filteredPayments, setFilteredPayments] = useState<Invoice[]>([]);
  
  // Filter invoices that have payments
  const invoicesWithPayments = invoices.filter(
    invoice => invoice.payments && invoice.payments.length > 0
  );
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPayments(invoicesWithPayments);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = invoicesWithPayments.filter(invoice => 
      invoice.clientName.toLowerCase().includes(query) ||
      invoice.invoiceNumber.toLowerCase().includes(query)
    );
    
    setFilteredPayments(filtered);
  }, [invoicesWithPayments, searchQuery]);
  
  if (invoicesWithPayments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No Payments Found</h3>
        <p className="text-muted-foreground">
          When you receive payments for your invoices, they will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <PaymentStatsCards invoices={invoicesWithPayments} />
      
      <div>
        <PaymentSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full px-4 sm:px-0">
            <PaymentTable invoices={filteredPayments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentContent;
