
import { useState, useEffect } from "react";
import { useVendors } from "@/contexts/vendor"; // Fixed import from vendor context
import VendorsTable from "./VendorsTable";
import VendorSearchBar from "./VendorSearchBar";
import VendorEmptyState from "./VendorEmptyState";
import VendorStatCards from "./VendorStatCards";

interface VendorsContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsAddingVendor: (value: boolean) => void;
}

const VendorsContent = ({ 
  searchQuery, 
  setSearchQuery, 
  setIsAddingVendor 
}: VendorsContentProps) => {
  const { vendors, isLoading } = useVendors();
  const [filteredVendors, setFilteredVendors] = useState(vendors);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = vendors.filter(vendor => 
      vendor.name.toLowerCase().includes(query) ||
      (vendor.category && vendor.category.toLowerCase().includes(query)) ||
      (vendor.email && vendor.email.toLowerCase().includes(query))
    );
    
    setFilteredVendors(filtered);
  }, [vendors, searchQuery]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    );
  }
  
  if (vendors.length === 0) {
    return <VendorEmptyState onAddVendor={() => setIsAddingVendor(true)} />;
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <VendorStatCards vendors={vendors} />
      
      <div>
        <VendorSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddVendor={() => setIsAddingVendor(true)}
        />
        
        <div className="mt-4">
          <VendorsTable vendors={filteredVendors} />
        </div>
      </div>
    </div>
  );
};

export default VendorsContent;
