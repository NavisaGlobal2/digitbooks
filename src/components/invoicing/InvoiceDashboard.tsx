
import { useState, useEffect } from "react";
import InvoiceTabs from "./InvoiceTabs";
import InvoiceContent from "./InvoiceContent";
import ClientContent from "./ClientContent";
import ClientForm from "../clients/ClientForm";

interface InvoiceDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsCreatingInvoice: (value: boolean) => void;
}

const InvoiceDashboard = ({ 
  activeTab, 
  setActiveTab, 
  setIsCreatingInvoice 
}: InvoiceDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  
  useEffect(() => {
    const handleInvoiceCreated = () => {
      setIsCreatingInvoice(false);
    };
    
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => {
      window.removeEventListener('invoiceCreated', handleInvoiceCreated);
    };
  }, [setIsCreatingInvoice]);
  
  return (
    <div className="flex flex-col h-full">
      <InvoiceTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 py-4 sm:py-6">
        {activeTab === "invoices" && (
          <InvoiceContent 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsCreatingInvoice={setIsCreatingInvoice}
          />
        )}
        
        {activeTab === "clients" && (
          <ClientContent 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsAddingClient={setIsAddingClient}
          />
        )}
      </div>
      
      <ClientForm open={isAddingClient} onOpenChange={setIsAddingClient} />
    </div>
  );
};

export default InvoiceDashboard;
