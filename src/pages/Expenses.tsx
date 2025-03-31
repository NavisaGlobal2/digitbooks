
import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { toast } from "sonner";
import { Plus, Upload, ArrowLeft, Bell } from "lucide-react";
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
      <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold">Expense tracking</h1>
          </div>
          
          <div className="flex items-center ml-auto gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-gray-500"
            >
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleAddExpense}
              size="sm"
            >
              <span className="hidden sm:inline">Add expense</span>
              <span className="sm:hidden">Add</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-green-500 text-green-500 hover:bg-green-50"
              onClick={handleConnectBank}
              size="sm"
            >
              <span className="hidden sm:inline">Upload statement</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>
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
