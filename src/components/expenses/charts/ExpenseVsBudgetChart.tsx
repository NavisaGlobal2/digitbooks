
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useBudget } from "@/contexts/BudgetContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useState, useEffect } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

const ExpenseVsBudgetChart = () => {
  const { budgets } = useBudget();
  const { expenses } = useExpenses();
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate data for the last 6 months
    const endDate = new Date();
    const startDate = subMonths(endDate, 5); // 6 months including current
    
    // Get all months in the range
    const months = eachMonthOfInterval({
      start: startDate,
      end: endDate
    });
    
    // Prepare chart data
    const data = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthName = format(month, "MMM");
      
      // Calculate expenses for this month
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      }).reduce((sum, expense) => sum + expense.amount, 0);
      
      // Find budget for this month (assuming one budget per month)
      // This is simplified - you might need to adjust based on your budget structure
      const monthBudget = budgets.find(budget => {
        const budgetStartDate = budget.startDate instanceof Date ? budget.startDate : new Date(budget.startDate);
        const budgetEndDate = budget.endDate instanceof Date ? budget.endDate : new Date(budget.endDate);
        return budgetStartDate <= monthEnd && budgetEndDate >= monthStart;
      });
      
      return {
        name: monthName,
        expenses: Math.round(monthExpenses),
        budget: monthBudget ? Math.round(monthBudget.totalBudget) : 0
      };
    });
    
    setChartData(data);
  }, [expenses, budgets]);

  return (
    <Card className="p-4 h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Expenses vs Budget</h2>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-500 mr-3">Budget</span>
          <div className="w-3 h-3 bg-red-400 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-500">Expenses</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          barGap={0}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#888', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888', fontSize: 12 }}
            tickFormatter={(value) => `₦${value}`}
          />
          <Bar dataKey="budget" fill="#10B981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="expenses" fill="#F87171" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ExpenseVsBudgetChart;
