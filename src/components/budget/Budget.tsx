
import { useState } from "react";
import { useBudget } from "@/contexts/BudgetContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateBudgetDialog } from "@/components/budget/CreateBudgetDialog";
import BudgetList from "@/components/budget/BudgetList";
import BudgetDetail from "@/components/budget/BudgetDetail";
import { Skeleton } from "@/components/ui/skeleton";

const Budget = () => {
  const { budgets, loading } = useBudget();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const handleSelectBudget = (id: string) => {
    setSelectedBudgetId(id);
  };

  const handleBackToBudgets = () => {
    setSelectedBudgetId(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Budgeting tools</h1>
          
          {budgets.length > 0 && !selectedBudgetId && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              Create budget
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          ) : selectedBudgetId ? (
            <BudgetDetail 
              budgetId={selectedBudgetId} 
              onBack={handleBackToBudgets} 
            />
          ) : budgets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
              <div className="w-48 h-48 mb-8 flex items-center justify-center bg-green-50 rounded-full">
                <Calculator className="w-24 h-24 text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold mb-2">No budget created</h2>
              <p className="text-muted-foreground mb-8">
                Click on the 'Create budget' button to create your first budget.
              </p>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setShowCreateDialog(true)}
              >
                Create budget
              </Button>
            </div>
          ) : (
            <BudgetList 
              onSelectBudget={handleSelectBudget} 
              onCreateBudget={() => setShowCreateDialog(true)} 
            />
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
