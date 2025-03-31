
import React, { useEffect, useState, useRef } from "react";
import { ReportActions } from "../income-statement/ReportActions";
import { Card, CardContent } from "@/components/ui/card";
import ExpenseCategoriesBreakdown from "../ExpenseCategoriesBreakdown";
import { format } from "date-fns";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ExpenseBreakdown } from "@/hooks/useFinancialReports";

interface ExpenseSummaryReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  onDirectGeneration?: () => void;
}

const ExpenseSummaryReport: React.FC<ExpenseSummaryReportProps> = ({
  onBack,
  period,
  dateRange,
  onDirectGeneration
}) => {
  const { expenses } = useExpenses();
  const [expenseData, setExpenseData] = useState<ExpenseBreakdown[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expenses.length) return;

    // Filter expenses by date range if provided
    let filteredExpenses = [...expenses];
    
    if (dateRange) {
      filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate >= dateRange.startDate &&
          expenseDate <= dateRange.endDate
        );
      });
    }

    // Calculate total expenses
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(total);

    // Group expenses by category
    const expensesByCategory = filteredExpenses.reduce((acc: Record<string, number>, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});

    // Convert to ExpenseBreakdown format
    const breakdownData: ExpenseBreakdown[] = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }));

    setExpenseData(breakdownData);
  }, [expenses, dateRange]);

  return (
    <div className="space-y-6" id="report-container">
      <ReportActions
        onBack={onBack}
        title="Expense Summary"
        period={period}
        dateRange={dateRange}
        reportRef={reportRef}
        onDirectGeneration={onDirectGeneration}
      />

      <div 
        ref={reportRef} 
        className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none" 
        id="expense-report-content"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Expense Summary</h1>
          <p className="text-muted-foreground">
            {period}
            {dateRange && (
              <span className="block text-sm">
                {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
              </span>
            )}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Total Expenses</h2>
                <span className="text-2xl font-bold">₦{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          {expenseData.length > 0 ? (
            <ExpenseCategoriesBreakdown data={expenseData} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expense data available for the selected period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummaryReport;
