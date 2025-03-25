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
  onAddExpense: () => void;
}

const ExpensesContent = ({ 
  expenses,
  deleteExpense,
  getTotalExpenses,
  getExpensesByCategory,
  onConnectBank,
  onAddExpense
}: ExpensesContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const categoryTotals = getExpensesByCategory();
  
  const totalExpenses = getTotalExpenses();
  
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({ 
      category: category as ExpenseCategory, 
      amount 
    }));
    
  const cardExpensesCount = expenses.filter(e => e.paymentMethod === 'card').length;

  return (
    <>
      {isAddingExpense ? (
        <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Add New Expense</h2>
          <ExpenseForm onCancel={() => setIsAddingExpense(false)} />
        </div>
      ) : (
        <>
          {expenses.length === 0 ? (
            <ExpenseEmptyState 
              onAddExpense={onAddExpense} 
              onConnectBank={onConnectBank} 
            />
          ) : (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
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
                  onAddExpense={onAddExpense}
                />
                
                <div className="overflow-x-auto">
                  <ExpensesTable 
                    expenses={filteredExpenses} 
                    onDeleteExpense={deleteExpense} 
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <AddExpenseDialog 
        open={showExpenseDialog} 
        onOpenChange={setShowExpenseDialog} 
      />
    </>
  );
};

export default ExpensesContent;
