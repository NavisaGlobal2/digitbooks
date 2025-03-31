
import React, { useEffect, useState, useRef } from "react";
import { ReportActions } from "../income-statement/ReportActions";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import ProfitLossHeader from "./ProfitLossHeader";
import ProfitLossSummaryCards from "./ProfitLossSummaryCards";
import ProfitLossTrendsChart from "./ProfitLossTrendsChart";
import ProfitLossSummaryTable from "./ProfitLossSummaryTable";
import ProfitLossMonthlyTable from "./ProfitLossMonthlyTable";
import { format } from "date-fns";

interface ProfitLossReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const ProfitLossReport: React.FC<ProfitLossReportProps> = ({
  onBack,
  period,
  dateRange,
}) => {
  const { revenues } = useRevenue();
  const { expenses } = useExpenses();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dateRange) return;

    // Filter data by date range
    const filteredRevenues = revenues.filter(revenue => {
      const revenueDate = new Date(revenue.date);
      return revenueDate >= dateRange.startDate && revenueDate <= dateRange.endDate;
    });

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
    });

    // Calculate totals
    const revTotal = filteredRevenues.reduce((sum, item) => sum + item.amount, 0);
    const expTotal = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const profit = revTotal - expTotal;
    const margin = revTotal > 0 ? (profit / revTotal) * 100 : 0;

    setTotalRevenue(revTotal);
    setTotalExpenses(expTotal);
    setNetProfit(profit);
    setProfitMargin(margin);

    // Create monthly summary for chart
    const monthlyData = generateMonthlySummary(
      dateRange.startDate, 
      dateRange.endDate, 
      filteredRevenues, 
      filteredExpenses
    );
    
    setMonthlySummary(monthlyData);
  }, [revenues, expenses, dateRange]);

  // Helper function to generate monthly summary
  const generateMonthlySummary = (
    start: Date, 
    end: Date, 
    revenueData: any[], 
    expenseData: any[]
  ) => {
    // Create a map to store monthly data
    const monthlyData = new Map();
    
    // Create entries for each month in the range
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const monthKey = format(currentDate, 'yyyy-MM');
      const monthLabel = format(currentDate, 'MMM yyyy');
      
      monthlyData.set(monthKey, {
        month: monthLabel,
        revenue: 0,
        expenses: 0,
        profit: 0
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Add revenue data
    revenueData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        monthData.revenue += item.amount;
      }
    });
    
    // Add expense data
    expenseData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        monthData.expenses += item.amount;
      }
    });
    
    // Calculate profit for each month
    monthlyData.forEach(data => {
      data.profit = data.revenue - data.expenses;
    });
    
    // Convert map to array
    return Array.from(monthlyData.values());
  };

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6" id="report-container">
      <ReportActions
        onBack={onBack}
        title="Profit & Loss"
        period={period}
        dateRange={dateRange}
        reportRef={reportRef}
      />

      <div
        ref={reportRef}
        className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none"
        id="profit-loss-report-content"
      >
        <ProfitLossHeader period={period} dateRange={dateRange} />

        <div className="space-y-6">
          <ProfitLossSummaryCards 
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            netProfit={netProfit}
            profitMargin={profitMargin}
            formatCurrency={formatCurrency}
          />

          <ProfitLossTrendsChart 
            monthlySummary={monthlySummary}
            formatCurrency={formatCurrency}
          />

          <ProfitLossSummaryTable 
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            netProfit={netProfit}
            profitMargin={profitMargin}
            formatCurrency={formatCurrency}
          />

          <ProfitLossMonthlyTable 
            monthlySummary={monthlySummary}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
