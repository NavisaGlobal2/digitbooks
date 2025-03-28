
import { useState, useEffect } from "react";
import { useVendors } from "@/contexts/VendorContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useLocation, useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  // Handle vendor filter from route state or URL parameter
  useEffect(() => {
    // Check if we have a vendor name from the URL
    if (vendorName) {
      const decodedVendorName = decodeURIComponent(vendorName);
      // Verify the vendor exists before selecting it
      const vendorExists = vendors.some(v => v.name === decodedVendorName);
      
      if (vendorExists) {
        setSelectedVendor(decodedVendorName);
      } else {
        // If vendor doesn't exist, navigate back to the main vendors page
        navigate('/vendors');
      }
      return;
    }
    
    // Check if we have a vendor filter from route state
    if (location.state?.vendorFilter) {
      setSelectedVendor(location.state.vendorFilter);
    }
  }, [location.state, vendorName, vendors, navigate]);
  
  const handleBack = () => {
    setSelectedVendor(null);
    navigate('/vendors');
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
          navigate(`/vendors/${encodeURIComponent(vendor.name)}`);
        }
      }}
      searchQuery={searchQuery}
      onSearch={setSearchQuery}
    />
  );
};

export default VendorsContent;
