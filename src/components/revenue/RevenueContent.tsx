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
  
  const filteredRevenues = revenues.filter((revenue) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      revenue.description.toLowerCase().includes(searchLower) ||
      revenue.client_name?.toLowerCase().includes(searchLower) ||
      revenue.source.toLowerCase().includes(searchLower)
    );
  });
  
  const sortedRevenues = [...filteredRevenues].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleUpdateStatus = (id: string, status: PaymentStatus) => {
    console.log(`Update status for ${id} to ${status}`);
  };
  
  if (revenues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">No revenue entries yet</h2>
          <p className="text-gray-500 mb-6">Track your income by recording your first revenue entry.</p>
          
          <div className="flex flex-col gap-3">
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white w-full py-6 text-base flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={onAddRevenue}
            >
              <Plus className="h-5 w-5 mr-2" />
              New revenue
            </Button>
            
            <Button 
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-50 w-full py-6 text-base flex items-center justify-center transition-all duration-300"
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
    <div className="space-y-8">
      <RevenueStatsCards />
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Revenue Trends</h3>
          <div className="flex items-center space-x-2">
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
        <RevenueChart />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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
        
        <div className="flex gap-2 w-full sm:w-auto">
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
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <RevenueTable 
          revenues={sortedRevenues} 
          onUpdateStatus={handleUpdateStatus}
          onDelete={onDeleteRevenue}
          onEdit={onEditRevenue}
        />
      </div>
    </div>
  );
};

export default RevenueContent;
