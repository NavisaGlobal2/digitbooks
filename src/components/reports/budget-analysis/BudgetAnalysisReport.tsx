
import React, { useEffect, useState, useRef } from "react";
import { ReportActions } from "../income-statement/ReportActions";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useBudget } from "@/contexts/BudgetContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface BudgetAnalysisReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const BudgetAnalysisReport: React.FC<BudgetAnalysisReportProps> = ({
  onBack,
  period,
  dateRange,
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
    <div className="space-y-6" id="report-container">
      <ReportActions
        onBack={onBack}
        title="Budget Analysis"
        period={period}
        dateRange={dateRange}
        reportRef={reportRef}
      />

      <div
        ref={reportRef}
        className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none"
        id="budget-report-content"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Budget Analysis</h1>
          <p className="text-muted-foreground">
            {period}
            {dateRange && (
              <span className="block text-sm">
                {format(dateRange.startDate, "MMM d, yyyy")} - {format(dateRange.endDate, "MMM d, yyyy")}
              </span>
            )}
          </p>
          {selectedBudget && (
            <p className="text-sm font-medium mt-2">
              Budget: {selectedBudget.name} ({format(new Date(selectedBudget.startDate), "MMM d, yyyy")} - {format(new Date(selectedBudget.endDate), "MMM d, yyyy")})
            </p>
          )}
        </div>

        {selectedBudget ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Total Budgeted</span>
                    <span className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
                    <span className={`text-sm ${totalSpent <= totalBudgeted ? 'text-green-600' : 'text-red-600'}`}>
                      {totalSpent <= totalBudgeted 
                        ? `${((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget used` 
                        : `${((totalSpent - totalBudgeted) / totalBudgeted * 100).toFixed(1)}% over budget`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Budget vs. Actual by Category</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysisData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      interval={0}
                    />
                    <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                    <Legend />
                    <Bar name="Budgeted Amount" dataKey="budgeted" fill="#8884d8" />
                    <Bar name="Actual Spent" dataKey="actual" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto">
              <h3 className="text-lg font-medium mb-4">Budget Analysis Details</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Budgeted</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Actual</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Variance</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">% Used</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-200 px-4 py-2">{item.category}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(item.budgeted)}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(item.actual)}</td>
                      <td className={`border border-gray-200 px-4 py-2 text-right ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.variance)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {item.percentUsed.toFixed(1)}%
                      </td>
                      <td className={`border border-gray-200 px-4 py-2 text-center ${getStatusColor(item.percentUsed)}`}>
                        {item.percentUsed <= 70 ? '✅ Good' : item.percentUsed <= 90 ? '⚠️ Watch' : '❗ Over'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-green-50 font-medium">
                    <td className="border border-gray-200 px-4 py-2">Total</td>
                    <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(totalBudgeted)}</td>
                    <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(totalSpent)}</td>
                    <td className={`border border-gray-200 px-4 py-2 text-right ${totalBudgeted - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalBudgeted - totalSpent)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : '0'}%
                    </td>
                    <td className={`border border-gray-200 px-4 py-2 text-center ${getStatusColor(totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0)}`}>
                      {totalSpent <= totalBudgeted ? '✅ Within Budget' : '❗ Over Budget'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No budget data available for the selected period.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetAnalysisReport;
