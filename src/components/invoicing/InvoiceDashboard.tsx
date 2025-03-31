
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InvoiceContent from "./InvoiceContent";
import InvoiceHistoryTab from "./history/InvoiceHistoryTab";

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

  return (
    <div className="container px-4 py-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <InvoiceContent 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsCreatingInvoice={setIsCreatingInvoice}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Payment Tracking</h3>
            <p className="text-muted-foreground">
              Track payments received against your invoices.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <InvoiceHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceDashboard;
