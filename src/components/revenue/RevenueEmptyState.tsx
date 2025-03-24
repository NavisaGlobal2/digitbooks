
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RevenueEmptyStateProps {
  onAddRevenue: () => void;
  onImportRevenue: () => void;
}

const RevenueEmptyState = ({ onAddRevenue, onImportRevenue }: RevenueEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="relative w-64 h-64 mb-4">
        <img 
          src="/lovable-uploads/35ddc339-fafd-45de-8980-30bddf13d586.png" 
          alt="Revenue illustration" 
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold mb-2">No revenue created</h2>
        <p className="text-gray-500 mb-6">
          Start tracking your income by adding your first revenue entry or by importing existing data.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 h-12 flex-1 shadow-md transition-all duration-300"
            onClick={onAddRevenue}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Revenue
          </Button>
          
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-50 px-6 py-2 h-12 flex-1 transition-all duration-300"
            onClick={onImportRevenue}
          >
            <Upload className="h-5 w-5 mr-2" />
            Import Revenue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RevenueEmptyState;
