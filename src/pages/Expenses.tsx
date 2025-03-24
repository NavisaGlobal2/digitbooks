
import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpensesContent from "@/components/expenses/ExpensesContent";
import BankStatementUploadDialog from "@/components/expenses/BankStatementUploadDialog";

const ExpensesPage = () => {
  const { expenses, deleteExpense, getTotalExpenses, getExpensesByCategory } = useExpenses();
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showBankUploadDialog, setShowBankUploadDialog] = useState(false);
  
  const handleAddExpense = () => {
    setShowExpenseDialog(true);
  };
  
  const handleConnectBank = () => {
    setShowBankUploadDialog(true);
  };
  
  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted successfully");
  };

  const handleStatementProcessed = () => {
    // This function would be called after successful statement processing
    // Here you could refresh data or perform other actions
    toast.info("Statement processed. You can now see your transactions in the expenses list.");
  };
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Expenses</h1>
            
            {expenses.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50"
                  onClick={handleConnectBank}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Connect Bank
                </Button>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleAddExpense}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
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

      {/* Bank Statement Upload Dialog */}
      <BankStatementUploadDialog
        open={showBankUploadDialog}
        onOpenChange={setShowBankUploadDialog}
        onStatementProcessed={handleStatementProcessed}
      />
    </div>
  );
};

export default ExpensesPage;
