
import { useState } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown, Search, Coins, TrendingUp } from "lucide-react";
import { RevenueTable } from "./RevenueTable";
import RevenueStatsCards from "./RevenueStatsCards";
import RevenueChart from "./RevenueChart";
import { PaymentStatus } from "@/types/revenue";

interface RevenueContentProps {
  onAddRevenue: () => void;
  onImportRevenue: () => void;
  onEditRevenue: (id: string) => void;
  onDeleteRevenue: (id: string) => void;
}

const RevenueContent = ({ 
  onAddRevenue, 
  onImportRevenue, 
  onEditRevenue, 
  onDeleteRevenue 
}: RevenueContentProps) => {
  const { revenues } = useRevenue();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Filter revenues based on search query
  const filteredRevenues = revenues.filter((revenue) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      revenue.description.toLowerCase().includes(searchLower) ||
      revenue.clientName?.toLowerCase().includes(searchLower) ||
      revenue.source.toLowerCase().includes(searchLower)
    );
  });
  
  // Sort revenues by date
  const sortedRevenues = [...filteredRevenues].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Function to handle updating payment status 
  const handleUpdateStatus = (id: string, status: PaymentStatus) => {
    // This would typically call a method from the context to update the status
    console.log(`Update status for ${id} to ${status}`);
    // If there's a context method to update status, it would be called here
  };
  
  if (revenues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 md:gap-8 px-3">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">No revenue entries yet</h2>
          <p className="text-gray-500 mb-4 sm:mb-6">Track your income by recording your first revenue entry.</p>
          
          <div className="flex flex-col gap-3">
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white w-full py-4 sm:py-6 text-sm sm:text-base flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={onAddRevenue}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              New revenue
            </Button>
            
            <Button 
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-50 w-full py-4 sm:py-6 text-sm sm:text-base flex items-center justify-center transition-all duration-300"
              onClick={onImportRevenue}
            >
              Import revenue
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Stats Cards */}
      <RevenueStatsCards />
      
      {/* Revenue Chart */}
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-medium">Revenue Trends</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Last 30 days
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8">
              Last 90 days
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 bg-green-50 text-green-600 border-green-200">
              All time
            </Button>
          </div>
        </div>
        <div className="h-[250px] sm:h-[300px] md:h-[350px]">
          <RevenueChart />
        </div>
      </div>
      
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search revenues..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSortOrder}
            className="px-2.5"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </Button>
          
          <Button 
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-50"
            onClick={onImportRevenue}
          >
            Import
          </Button>
          
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={onAddRevenue}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add revenue
          </Button>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <RevenueTable 
            revenues={sortedRevenues} 
            onUpdateStatus={handleUpdateStatus}
            onDelete={onDeleteRevenue}
          />
        </div>
      </div>
    </div>
  );
};

export default RevenueContent;
