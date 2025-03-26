
import { useState, useEffect } from "react";
import InvoiceHeader from "@/components/invoicing/InvoiceHeader";
import InvoiceForm from "@/components/invoicing/InvoiceForm";
import InvoiceDashboard from "@/components/invoicing/InvoiceDashboard";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";

const Invoicing = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  
  // Listen for events from child components
  useEffect(() => {
    const handleInvoiceCreated = () => {
      setIsCreatingInvoice(false);
    };
    
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => window.removeEventListener('invoiceCreated', handleInvoiceCreated);
  }, []);
  
  return (
    <DashboardContainer>
      {/* Header */}
      <InvoiceHeader 
        isCreatingInvoice={isCreatingInvoice} 
        setIsCreatingInvoice={setIsCreatingInvoice} 
      />
      
      <main className="flex-1 overflow-auto">
        {isCreatingInvoice ? (
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <InvoiceForm />
          </div>
        ) : (
          <InvoiceDashboard 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsCreatingInvoice={setIsCreatingInvoice}
          />
        )}
      </main>
    </DashboardContainer>
  );
};

export default Invoicing;
