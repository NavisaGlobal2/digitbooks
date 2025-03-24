
import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpensesContent from "@/components/expenses/ExpensesContent";

const ExpensesPage = () => {
  const { expenses, deleteExpense, getTotalExpenses, getExpensesByCategory } = useExpenses();
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  const handleAddExpense = () => {
    setShowExpenseDialog(true);
  };
  
  const handleConnectBank = () => {
    toast.info("Bank connection functionality coming soon!");
  };
  
  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted successfully");
  };
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Expenses</h1>
            
            {expenses.length > 0 && (
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleAddExpense}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            )}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <ExpensesContent
            expenses={expenses}
            deleteExpense={handleDeleteExpense}
            getTotalExpenses={getTotalExpenses}
            getExpensesByCategory={getExpensesByCategory}
            onConnectBank={handleConnectBank}
          />
        </main>
      </div>
    </div>
  );
};

export default ExpensesPage;
