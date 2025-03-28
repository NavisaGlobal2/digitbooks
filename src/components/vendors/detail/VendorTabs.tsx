
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTabContent from "./OverviewTabContent";
import TransactionsTabContent from "./TransactionsTabContent";
import DocumentsTabContent from "./DocumentsTabContent";
import { Expense } from "@/types/expense";

interface VendorTabsProps {
  vendorName: string;
  totalSpent: number;
  vendorExpenses: Expense[];
}

const VendorTabs = ({ vendorName, totalSpent, vendorExpenses }: VendorTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4">
        <OverviewTabContent 
          vendorName={vendorName}
          transactionCount={vendorExpenses.length}
          totalSpent={totalSpent}
        />
      </TabsContent>
      
      <TabsContent value="transactions" className="mt-4">
        <TransactionsTabContent transactions={vendorExpenses} />
      </TabsContent>
      
      <TabsContent value="documents" className="mt-4">
        <DocumentsTabContent />
      </TabsContent>
    </Tabs>
  );
};

export default VendorTabs;
