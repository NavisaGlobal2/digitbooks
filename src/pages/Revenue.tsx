
import { useState } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { toast } from "sonner";
import { ArrowLeft, PieChart, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RevenueContent from "@/components/revenue/RevenueContent";
import AddRevenueDialog from "@/components/revenue/AddRevenueDialog";
import ImportRevenueDialog from "@/components/revenue/ImportRevenueDialog";
import EditRevenueDialog from "@/components/revenue/EditRevenueDialog";
import { Revenue } from "@/types/revenue";

const RevenuePage = () => {
  const { addRevenue, deleteRevenue } = useRevenue();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editRevenueId, setEditRevenueId] = useState<string | null>(null);
  
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
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-green-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <PieChart className="h-6 w-6 mr-2" />
                <h1 className="text-2xl font-semibold">Revenue Tracking</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => {}}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Revenue Reports
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <RevenueContent
            onAddRevenue={handleAddRevenue}
            onImportRevenue={handleImportRevenue}
            onEditRevenue={handleEditRevenue}
            onDeleteRevenue={handleDeleteRevenue}
          />
        </main>
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
    </div>
  );
};

export default RevenuePage;
