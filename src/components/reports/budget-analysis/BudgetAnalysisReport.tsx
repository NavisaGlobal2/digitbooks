
import React, { useEffect, useState, useRef } from "react";
import { ReportActions } from "../income-statement/ReportActions";
import { useBudget } from "@/contexts/BudgetContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import BudgetAnalysisHeader from "./BudgetAnalysisHeader";
import BudgetSummaryCards from "./BudgetSummaryCards";
import BudgetAnalysisChart from "./BudgetAnalysisChart";
import BudgetAnalysisTable from "./BudgetAnalysisTable";
import BudgetAnalysisEmptyState from "./BudgetAnalysisEmptyState";

interface BudgetAnalysisReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
  onDirectGeneration?: () => void;
}

const BudgetAnalysisReport: React.FC<BudgetAnalysisReportProps> = ({
  onBack,
  period,
  dateRange,
  onDirectGeneration
}) => {
  const { budgets } = useBudget();
  const { expenses } = useExpenses();
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!budgets.length || !dateRange) return;

    // Find the most relevant budget for the date range
    const relevantBudgets = budgets.filter(budget => {
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);
      
      return (
        (budgetStart <= dateRange.endDate && budgetEnd >= dateRange.startDate) || // Overlapping
        (budgetStart >= dateRange.startDate && budgetEnd <= dateRange.endDate) // Contained
      );
    });

    // Use the first matching budget or the most recent one
    const budget = relevantBudgets.length > 0 
      ? relevantBudgets[0] 
      : budgets.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];

    if (budget) {
      setSelectedBudget(budget);
      
      // Filter expenses for the budget period
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);
      
      const relevantExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= budgetStart && expenseDate <= budgetEnd;
      });

      // Calculate total budgeted and spent
      setTotalBudgeted(budget.totalBudget);
      const spent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalSpent(spent);

      // Group expenses by category
      const expensesByCategory = relevantExpenses.reduce((acc: Record<string, number>, expense) => {
        const category = expense.category;
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {});

      // Create analysis data combining budget categories and actual spending
      const analysisItems = budget.categories.map((budgetCat: any) => {
        const actualSpent = expensesByCategory[budgetCat.name] || 0;
        const variance = budgetCat.amount - actualSpent;
        const percentUsed = budgetCat.amount > 0 ? (actualSpent / budgetCat.amount) * 100 : 0;
        
        return {
          category: budgetCat.name,
          budgeted: budgetCat.amount,
          actual: actualSpent,
          variance: variance,
          percentUsed: percentUsed
        };
      });

      setAnalysisData(analysisItems);
    }
  }, [budgets, expenses, dateRange]);

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed <= 70) return "text-green-600";
    if (percentUsed <= 90) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <ReportActions
        onBack={onBack}
        title="Budget Analysis"
        period={period}
        dateRange={dateRange}
        reportRef={reportRef}
        onDirectGeneration={onDirectGeneration}
      />

      <div
        ref={reportRef}
        id="report-container"
        className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none"
      >
        <BudgetAnalysisHeader 
          period={period}
          dateRange={dateRange}
          selectedBudget={selectedBudget}
        />

        {selectedBudget ? (
          <div className="space-y-6">
            <BudgetSummaryCards 
              totalBudgeted={totalBudgeted}
              totalSpent={totalSpent}
              formatCurrency={formatCurrency}
            />

            <BudgetAnalysisChart 
              analysisData={analysisData}
              formatCurrency={formatCurrency}
            />

            <BudgetAnalysisTable 
              analysisData={analysisData}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              totalBudgeted={totalBudgeted}
              totalSpent={totalSpent}
            />
          </div>
        ) : (
          <BudgetAnalysisEmptyState />
        )}
      </div>
    </div>
  );
};

export default BudgetAnalysisReport;
