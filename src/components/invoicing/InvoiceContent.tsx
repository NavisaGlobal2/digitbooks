
import { useState, useEffect, useCallback } from "react";
import { useInvoices } from "@/contexts/InvoiceContext";
import InvoiceEmptyState from "./InvoiceEmptyState";
import InvoiceStatCards from "./InvoiceStatCards";
import InvoiceSearchBar from "./InvoiceSearchBar";
import InvoiceTable from "./InvoiceTable";
import { PaymentRecord } from "@/types/invoice";
import { toast } from "sonner";

interface InvoiceContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsCreatingInvoice: (value: boolean) => void;
}

const InvoiceContent = ({ 
  searchQuery, 
  setSearchQuery, 
  setIsCreatingInvoice 
}: InvoiceContentProps) => {
  const { invoices, markInvoiceAsPaid } = useInvoices();
  const [filteredInvoices, setFilteredInvoices] = useState(invoices);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInvoices(invoices);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = invoices.filter(invoice => 
      invoice.clientName.toLowerCase().includes(query) ||
      invoice.invoiceNumber.toLowerCase().includes(query)
    );
    
    setFilteredInvoices(filtered);
  }, [invoices, searchQuery]);
  
  const handleMarkAsPaid = useCallback((invoiceId: string, payments: PaymentRecord[]) => {
    try {
      markInvoiceAsPaid(invoiceId, payments);
      toast.success("Payment recorded successfully");
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.error("Failed to record payment");
    }
  }, [markInvoiceAsPaid]);
  
  if (invoices.length === 0) {
    return <InvoiceEmptyState onCreateInvoice={() => setIsCreatingInvoice(true)} />;
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <InvoiceStatCards invoices={invoices} />
      
      <div>
        <InvoiceSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onCreateInvoice={() => setIsCreatingInvoice(true)}
        />
        
        <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full px-4 sm:px-0">
            <InvoiceTable 
              invoices={filteredInvoices}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceContent;
