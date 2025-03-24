import { useState } from "react";
import { useRevenue } from "@/contexts/RevenueContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, ArrowLeft, Wallet, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { RevenueDialog } from "@/components/revenue/RevenueDialog";
import { ImportRevenueDialog } from "@/components/revenue/ImportRevenueDialog";
import { RevenueStats } from "@/components/revenue/RevenueStats";
import { RevenueTable } from "@/components/revenue/RevenueTable";
import { toast } from "sonner";

const Revenue = () => {
  const { 
    revenues, 
    updateRevenueStatus, 
    deleteRevenue,
    getTotalReceivables,
    getOutstandingReceivables
  } = useRevenue();
  
  const [showNewRevenueDialog, setShowNewRevenueDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRevenues = revenues.filter(revenue => 
    revenue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    revenue.revenueNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteRevenue(id);
    toast.success("Revenue deleted successfully");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Revenue tracking</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowNewRevenueDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New revenue
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {revenues.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
              <div className="w-48 h-48 mb-8 flex items-center justify-center bg-green-50 rounded-full">
                <Wallet className="w-24 h-24 text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold mb-2">No revenue created</h2>
              <p className="text-muted-foreground mb-8">
                Click on the 'New revenue' button to create your first revenue entry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => setShowNewRevenueDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New revenue
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import revenue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <RevenueStats 
                totalReceivables={getTotalReceivables()}
                outstandingReceivables={getOutstandingReceivables()}
              />
              
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search revenues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <RevenueTable 
                revenues={filteredRevenues}
                onUpdateStatus={updateRevenueStatus}
                onDelete={handleDelete}
              />
            </div>
          )}
        </main>
      </div>

      <RevenueDialog 
        open={showNewRevenueDialog} 
        onOpenChange={setShowNewRevenueDialog} 
      />
      
      <ImportRevenueDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
};

export default Revenue;