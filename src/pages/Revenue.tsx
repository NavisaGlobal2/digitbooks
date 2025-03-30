
import { useState } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import { toast } from "sonner";
import { PieChart, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RevenueContent from "@/components/revenue/RevenueContent";
import AddRevenueDialog from "@/components/revenue/AddRevenueDialog";
import ImportRevenueDialog from "@/components/revenue/ImportRevenueDialog";
import EditRevenueDialog from "@/components/revenue/EditRevenueDialog";
import { Revenue } from "@/types/revenue";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";

const RevenuePage = () => {
  const { addRevenue, deleteRevenue } = useRevenue();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editRevenueId, setEditRevenueId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleAddRevenue = () => {
    setShowAddDialog(true);
  };
  
  const handleImportRevenue = () => {
    setShowImportDialog(true);
  };
  
  const handleEditRevenue = (id: string) => {
    setEditRevenueId(id);
  };
  
  const handleDeleteRevenue = (id: string) => {
    deleteRevenue(id);
    toast.success("Revenue deleted successfully");
  };

  const handleRevenueAdded = (revenue: Omit<Revenue, "id">) => {
    addRevenue(revenue);
    toast.success("Revenue added successfully");
    setShowAddDialog(false);
  };
  
  const handleRevenuesImported = (revenues: Omit<Revenue, "id">[]) => {
    revenues.forEach(revenue => {
      addRevenue(revenue);
    });
    toast.success(`${revenues.length} revenues imported successfully`);
    setShowImportDialog(false);
  };

  const handleNavigateToReports = () => {
    navigate("/reports");
  };
  
  return (
    <DashboardContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PieChart className="h-6 w-6 text-green-500" />
            <h1 className="text-2xl font-semibold">Revenue Tracking</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline" 
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={handleNavigateToReports}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Revenue Reports
            </Button>
          </div>
        </div>
        
        <RevenueContent
          onAddRevenue={handleAddRevenue}
          onImportRevenue={handleImportRevenue}
          onEditRevenue={handleEditRevenue}
          onDeleteRevenue={handleDeleteRevenue}
        />
      </div>

      {/* Add Revenue Dialog */}
      <AddRevenueDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onRevenueAdded={handleRevenueAdded}
      />
      
      {/* Import Revenue Dialog */}
      <ImportRevenueDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onRevenuesImported={handleRevenuesImported}
      />
      
      {/* Edit Revenue Dialog */}
      <EditRevenueDialog
        open={editRevenueId !== null}
        onOpenChange={(open) => {
          if (!open) setEditRevenueId(null);
        }}
        revenueId={editRevenueId}
      />
    </DashboardContainer>
  );
};

export default RevenuePage;
