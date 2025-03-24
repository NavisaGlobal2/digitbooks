
import { useState, useEffect } from "react";
import { useInvoices } from "@/contexts/InvoiceContext";
import InvoiceEmptyState from "./InvoiceEmptyState";
import InvoiceStatCards from "./InvoiceStatCards";
import InvoiceSearchBar from "./InvoiceSearchBar";
import InvoiceTable from "./InvoiceTable";

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
  const { invoices, updateInvoiceStatus } = useInvoices();
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
  
  const handleMarkAsPaid = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, 'paid');
  };
  
  if (invoices.length === 0) {
    return <InvoiceEmptyState onCreateInvoice={() => setIsCreatingInvoice(true)} />;
  }
  
  return (
    <div className="space-y-8">
      <InvoiceStatCards invoices={invoices} />
      
      <div>
        <InvoiceSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onCreateInvoice={() => setIsCreatingInvoice(true)}
        />
        
        <InvoiceTable 
          invoices={filteredInvoices}
          onMarkAsPaid={handleMarkAsPaid}
        />
      </div>
    </div>
  );
};

export default InvoiceContent;
