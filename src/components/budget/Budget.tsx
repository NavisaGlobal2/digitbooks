
import { useState } from "react";
import { useBudget } from "@/contexts/BudgetContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateBudgetDialog } from "@/components/budget/CreateBudgetDialog";
import BudgetList from "./BudgetList";
import BudgetDetail from "./BudgetDetail";
import MobileSidebar from "../dashboard/layout/MobileSidebar";

const Budget = () => {
  const { budgets } = useBudget();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-muted-foreground p-1"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold">Budgeting tools</h1>
          </div>
          
          {budgets.length > 0 && !selectedBudgetId && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <span className="hidden xs:inline">Create budget</span>
              <span className="xs:hidden">Create</span>
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-6">
          {budgets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center px-4">
              <div className="w-32 h-32 sm:w-48 sm:h-48 mb-6 sm:mb-8 flex items-center justify-center bg-green-50 rounded-full">
                <Calculator className="w-16 h-16 sm:w-24 sm:h-24 text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">No budget created</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
                Click on the 'Create budget' button to create your first budget.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                onClick={() => setShowCreateDialog(true)}
              >
                Create budget
              </Button>
            </div>
          ) : (
            <>
              {selectedBudgetId ? (
                <BudgetDetail 
                  budgetId={selectedBudgetId} 
                  onBack={() => setSelectedBudgetId(null)} 
                />
              ) : (
                <BudgetList 
                  onSelectBudget={setSelectedBudgetId}
                  onCreateBudget={() => setShowCreateDialog(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      <CreateBudgetDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default Budget;
