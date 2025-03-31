
import { useState, useEffect } from "react";
import InvoiceTabs from "./InvoiceTabs";
import InvoiceContent from "./InvoiceContent";
import ClientContent from "./ClientContent";
import ClientForm from "../clients/ClientForm";
import PaymentHistoryPage from "./payment/PaymentHistoryPage";

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
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  
  useEffect(() => {
    const handleInvoiceCreated = () => {
      setIsCreatingInvoice(false);
    };
    
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => {
      window.removeEventListener('invoiceCreated', handleInvoiceCreated);
    };
  }, [setIsCreatingInvoice]);

  // Reset payment history view when changing tabs
  useEffect(() => {
    setShowPaymentHistory(false);
  }, [activeTab]);
  
  return (
    <div className="flex flex-col h-full">
      <InvoiceTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 py-3 sm:py-4 px-4 sm:px-6">
        {activeTab === "invoices" && !showPaymentHistory && (
          <InvoiceContent 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsCreatingInvoice={setIsCreatingInvoice}
            onViewPaymentHistory={() => setShowPaymentHistory(true)}
          />
        )}
        
        {activeTab === "invoices" && showPaymentHistory && (
          <PaymentHistoryPage 
            onBack={() => setShowPaymentHistory(false)} 
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
