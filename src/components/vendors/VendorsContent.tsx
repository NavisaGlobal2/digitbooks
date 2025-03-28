
import { useState, useEffect } from "react";
import { useVendors } from "@/contexts/VendorContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useLocation, useParams } from "react-router-dom";
import VendorDetailView from "./detail/VendorDetailView";
import VendorsTable from "./VendorsTable";
import VendorsEmptyState from "./VendorsEmptyState";

interface VendorsContentProps {
  onAddVendor: () => void;
}

const VendorsContent = ({ onAddVendor }: VendorsContentProps) => {
  const { vendors, isLoading } = useVendors();
  const { expenses } = useExpenses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const location = useLocation();
  const { vendorName } = useParams<{ vendorName: string }>();
  
  // Handle vendor filter from route state or URL parameter
  useEffect(() => {
    // Check if we have a vendor name from the URL
    if (vendorName) {
      const decodedVendorName = decodeURIComponent(vendorName);
      setSelectedVendor(decodedVendorName);
      return;
    }
    
    // Check if we have a vendor filter from route state
    if (location.state?.vendorFilter) {
      setSelectedVendor(location.state.vendorFilter);
    }
  }, [location.state, vendorName]);
  
  const handleBack = () => {
    setSelectedVendor(null);
  };
  
  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (selectedVendor) {
    const vendor = vendors.find(v => v.name === selectedVendor);
    if (vendor) {
      return <VendorDetailView vendorId={vendor.id} onBack={handleBack} />;
    }
  }

  if (vendors.length === 0) {
    return <VendorsEmptyState onAddVendor={onAddVendor} />;
  }

  return (
    <VendorsTable
      vendors={filteredVendors}
      onViewVendor={(vendorId) => {
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor) {
          setSelectedVendor(vendor.name);
        }
      }}
      searchQuery={searchQuery}
      onSearch={setSearchQuery}
    />
  );
};

export default VendorsContent;
