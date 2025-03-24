
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import InvoiceHeader from "@/components/invoicing/InvoiceHeader";
import InvoiceForm from "@/components/invoicing/InvoiceForm";
import InvoiceDashboard from "@/components/invoicing/InvoiceDashboard";

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <InvoiceHeader 
          isCreatingInvoice={isCreatingInvoice} 
          setIsCreatingInvoice={setIsCreatingInvoice} 
        />
        
        <main className="flex-1 overflow-auto">
          {isCreatingInvoice ? (
            <div className="px-6 py-6">
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
      </div>
    </div>
  );
};

export default Invoicing;
