
import { useState, useEffect, useCallback } from "react";
import { useInvoices } from "@/contexts/InvoiceContext";
import InvoiceEmptyState from "./InvoiceEmptyState";
import InvoiceStatCards from "./InvoiceStatCards";
import InvoiceSearchBar from "./InvoiceSearchBar";
import InvoiceTable from "./InvoiceTable";
import { PaymentRecord } from "@/types/invoice";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InvoiceContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsCreatingInvoice: (value: boolean) => void;
}

const InvoiceContent = ({ 
  searchQuery, 
  setSearchQuery, 
  setIsCreatingInvoice,
}: InvoiceContentProps) => {
  const { invoices, markInvoiceAsPaid, isLoading } = useInvoices();
  const [filteredInvoices, setFilteredInvoices] = useState(invoices);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();
  
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
  
  const handleMarkAsPaid = useCallback(async (invoiceId: string, payments: PaymentRecord[]) => {
    if (isProcessingPayment) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Add a delay to ensure proper state updates and prevent UI glitches
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await markInvoiceAsPaid(invoiceId, payments);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast.error("Failed to record payment");
    } finally {
      // Add a delay before resetting the processing state
      setTimeout(() => {
        setIsProcessingPayment(false);
      }, 500);
    }
  }, [markInvoiceAsPaid, isProcessingPayment]);

  const handleViewPaymentHistory = () => {
    navigate("/payment-history");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div>
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  // Empty state
  if (invoices.length === 0) {
    return <InvoiceEmptyState onCreateInvoice={() => setIsCreatingInvoice(true)} />;
  }
  
  // Normal content
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
        <Button
          variant="outline"
          onClick={handleViewPaymentHistory}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Payment History
        </Button>
      </div>

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
              isProcessingPayment={isProcessingPayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceContent;
