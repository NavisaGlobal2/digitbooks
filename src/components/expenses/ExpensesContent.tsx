
import { useState } from "react";
import { Expense, ExpenseCategory } from "@/types/expense";
import ExpenseStatsCards from "./ExpenseStatsCards";
import ExpenseSearch from "./ExpenseSearch";
import ExpensesTable from "./ExpensesTable";
import ExpenseEmptyState from "./ExpenseEmptyState";
import ExpenseForm from "./ExpenseForm";
import AddExpenseDialog from "./AddExpenseDialog";

interface ExpensesContentProps {
  expenses: Expense[];
  deleteExpense: (id: string) => void;
  getTotalExpenses: () => number;
  getExpensesByCategory: () => Record<string, number>;
  onConnectBank: () => void;
}

const ExpensesContent = ({ 
  expenses,
  deleteExpense,
  getTotalExpenses,
  getExpensesByCategory,
  onConnectBank
}: ExpensesContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  const handleAddExpense = () => {
    setShowExpenseDialog(true);
  };
  
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get category totals
  const categoryTotals = getExpensesByCategory();
  
  // Get total monthly expenses
  const totalExpenses = getTotalExpenses();
  
  // Calculate top spending categories
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({ 
      category: category as ExpenseCategory, 
      amount 
    }));
    
  // Count card expenses
  const cardExpensesCount = expenses.filter(e => e.paymentMethod === 'card').length;

  return (
    <>
      {isAddingExpense ? (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <ExpenseForm onCancel={() => setIsAddingExpense(false)} />
        </div>
      ) : (
        <>
          {expenses.length === 0 ? (
            <ExpenseEmptyState 
              onAddExpense={handleAddExpense} 
              onConnectBank={onConnectBank} 
            />
          ) : (
            <div className="space-y-6">
              {/* Stats cards */}
              <ExpenseStatsCards
                totalExpenses={totalExpenses}
                expensesCount={expenses.length}
                topCategories={topCategories}
                cardExpensesCount={cardExpensesCount}
              />
              
              <div>
                <ExpenseSearch
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onAddExpense={handleAddExpense}
                />
                
                <ExpensesTable 
                  expenses={filteredExpenses} 
                  onDeleteExpense={deleteExpense} 
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Add expense dialog */}
      <AddExpenseDialog 
        open={showExpenseDialog} 
        onOpenChange={setShowExpenseDialog} 
      />
    </>
  );
};

export default ExpensesContent;
