
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Phone, Mail, PieChart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Expense } from "@/types/expense";
import { formatNaira } from "@/utils/invoice/formatters";
import { useNavigate } from "react-router-dom";

interface VendorSectionProps {
  vendors: string[];
  expenses: Expense[];
}

const VendorsSection = ({ vendors, expenses }: VendorSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => 
    vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate vendor spending
  const vendorSpending = vendors.reduce((acc, vendor) => {
    const vendorExpenses = expenses.filter(e => e.vendor === vendor);
    const totalSpent = vendorExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { ...acc, [vendor]: totalSpent };
  }, {} as Record<string, number>);

  // Navigate to vendors page with filter for specific vendor
  const handleViewTransactions = (vendorName: string) => {
    navigate("/vendors", { state: { vendorFilter: vendorName } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search vendors..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{vendor}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-1 space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <PieChart className="h-4 w-4 mr-2" />
                    <span>Total spent: {formatNaira(vendorSpending[vendor] || 0)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Contact details not available</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Email not available</span>
                  </div>
                  <div className="mt-4">
                    <button 
                      className="text-sm text-green-500 font-medium"
                      onClick={() => handleViewTransactions(vendor)}
                    >
                      View transactions
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No vendors found matching your search criteria.</p>
          </div>
        )}
      </div>
      
      {filteredVendors.length === 0 && searchQuery === "" && (
        <div className="text-center py-8">
          <p className="text-gray-500">No vendors found. Add expenses with vendor information to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default VendorsSection;
