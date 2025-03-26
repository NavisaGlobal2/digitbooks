
import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpensesContent from "@/components/expenses/ExpensesContent";
import BankStatementUploadDialog from "@/components/expenses/BankStatementUploadDialog";
import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";

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
    toast.success("Bank statement processed successfully! Transactions have been added to your expenses.");
  };
  
  return (
    <DashboardContainer>
      <header className="bg-white border-b px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Expenses</h1>
          
          {expenses.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50"
                onClick={handleConnectBank}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Connect Bank</span>
                <span className="sm:hidden">Bank</span>
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleAddExpense}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="p-4 sm:p-6">
        <ExpensesContent
          expenses={expenses}
          deleteExpense={handleDeleteExpense}
          getTotalExpenses={getTotalExpenses}
          getExpensesByCategory={getExpensesByCategory}
          onConnectBank={handleConnectBank}
          onAddExpense={handleAddExpense}
        />
      </main>

      {/* Bank Statement Upload Dialog */}
      <BankStatementUploadDialog
        open={showBankUploadDialog}
        onOpenChange={setShowBankUploadDialog}
        onStatementProcessed={handleStatementProcessed}
      />
      
      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
      />
    </DashboardContainer>
  );
};

export default ExpensesPage;
