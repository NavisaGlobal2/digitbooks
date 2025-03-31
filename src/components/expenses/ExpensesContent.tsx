
import { useState } from "react";
import { Expense } from "@/types/expense";
import ExpenseStatsCards from "./ExpenseStatsCards";
import ExpenseEmptyState from "./ExpenseEmptyState";
import ExpenseTabs from "./ExpenseTabs";
import ExpenseVsBudgetChart from "./charts/ExpenseVsBudgetChart";
import ExpenseBreakdownChart from "./charts/ExpenseBreakdownChart";
import ExpenseFilters from "./filters/ExpenseFilters";
import ConnectBankBanner from "./ConnectBankBanner";
import BillsSection from "@/components/dashboard/BillsSection";
import ExpensesTable from "./ExpensesTable";
import { DateRange } from "react-day-picker";

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
  const [activeTab, setActiveTab] = useState("expenses");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Get category totals
  const categoryTotals = getExpensesByCategory();
  
  // Get total monthly expenses
  const totalExpenses = getTotalExpenses();
  
  // Calculate top spending categories and percentages
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => {
      const percentage = totalExpenses > 0 
        ? `${((amount / totalExpenses) * 100).toFixed(1)}%` 
        : "0%";
      
      return { 
        category: category as any, 
        amount,
        percentage
      };
    });
    
  // Count card expenses
  const cardExpensesCount = expenses.filter(e => e.paymentMethod === 'card').length;

  // Get unique vendors from expenses
  const uniqueVendors = Array.from(new Set(expenses.map(e => e.vendor)));

  // Render content based on active tab
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "bills":
        return <BillsSection />;
      case "vendors":
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Vendors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {uniqueVendors.map((vendor, index) => (
                <div key={index} className="border rounded p-3 hover:shadow-md transition">
                  <div className="font-medium">{vendor}</div>
                  <div className="text-sm text-gray-500">
                    {expenses.filter(e => e.vendor === vendor).length} transactions
                  </div>
                </div>
              ))}
              {uniqueVendors.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No vendors found
                </div>
              )}
            </div>
          </div>
        );
      case "expenses":
      default:
        return (
          <>
            {/* Stats cards */}
            <ExpenseStatsCards
              totalExpenses={totalExpenses}
              expensesCount={expenses.length}
              topCategories={topCategories}
              cardExpensesCount={cardExpensesCount}
            />
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <ExpenseVsBudgetChart />
              <ExpenseBreakdownChart data={topCategories} />
            </div>
            
            {/* Connect Bank Banner */}
            <ConnectBankBanner onConnectBank={onConnectBank} />
            
            {/* Filters */}
            <ExpenseFilters 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onPaymentMethodChange={setSelectedPaymentMethod}
              onDateRangeChange={setDateRange}
              selectedCategory={selectedCategory}
              selectedPaymentMethod={selectedPaymentMethod}
              selectedDateRange={dateRange}
            />
            
            {/* Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full px-4 sm:px-0">
                <ExpensesTable 
                  expenses={expenses} 
                  onDeleteExpense={deleteExpense}
                  filters={{
                    category: selectedCategory === "all" ? undefined : selectedCategory,
                    paymentMethod: selectedPaymentMethod === "all" ? undefined : selectedPaymentMethod,
                    dateRange: dateRange?.from && dateRange?.to ? 
                      { start: dateRange.from, end: dateRange.to } : undefined
                  }}
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {expenses.length === 0 ? (
        <ExpenseEmptyState 
          onAddExpense={onAddExpense} 
          onConnectBank={onConnectBank} 
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Expense Tabs */}
          <ExpenseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Render content based on active tab */}
          {renderActiveTabContent()}
        </div>
      )}
    </>
  );
};

export default ExpensesContent;
