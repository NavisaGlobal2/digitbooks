
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import InvoiceHeader from "@/components/invoicing/InvoiceHeader";
import InvoiceForm from "@/components/invoicing/InvoiceForm";
import InvoiceDashboard from "@/components/invoicing/InvoiceDashboard";

const Invoicing = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  
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
        
        <main className="flex-1 overflow-auto px-6 py-6">
          {isCreatingInvoice ? (
            <InvoiceForm />
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
