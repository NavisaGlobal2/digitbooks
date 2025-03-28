
import { useState } from "react";
import { Search } from "lucide-react";
import { useVendors } from "@/contexts/VendorContext";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorsTable from "./VendorsTable";
import VendorDetailView from "./VendorDetailView";
import VendorsEmptyState from "./VendorsEmptyState";

interface VendorsContentProps {
  onAddVendor: () => void;
}

const VendorsContent = ({ onAddVendor }: VendorsContentProps) => {
  const { vendors, isLoading } = useVendors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (vendors.length === 0) {
    return <VendorsEmptyState onAddVendor={onAddVendor} />;
  }
  
  // If a vendor is selected, show the detail view
  if (selectedVendorId) {
    return (
      <VendorDetailView
        vendorId={selectedVendorId}
        onBack={() => setSelectedVendorId(null)}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            type="search"
            placeholder="Search vendors..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <VendorsTable 
            vendors={filteredVendors} 
            onSelectVendor={(id) => setSelectedVendorId(id)}
          />
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4">
          <VendorsTable 
            vendors={filteredVendors.sort((a, b) => {
              if (!a.lastTransaction) return 1;
              if (!b.lastTransaction) return -1;
              return b.lastTransaction.getTime() - a.lastTransaction.getTime();
            })}
            onSelectVendor={(id) => setSelectedVendorId(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorsContent;
