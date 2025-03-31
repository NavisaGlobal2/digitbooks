
import React, { useEffect, useState, useRef } from "react";
import { ReportActions } from "../income-statement/ReportActions";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useRevenue } from "@/contexts/RevenueContext";
import { useExpenses } from "@/contexts/ExpenseContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Net Profit</span>
                  <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Profit & Loss Trends</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlySummary}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue" 
                    stackId="1" 
                    stroke="#22c55e"
                    fill="#22c55e" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Expenses" 
                    stackId="2" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    name="Profit" 
                    stackId="3" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">Profit & Loss Summary</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Amount</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Total Revenue</td>
                  <td className="border border-gray-200 px-4 py-2 text-right text-green-600">{formatCurrency(totalRevenue)}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">100%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Total Expenses</td>
                  <td className="border border-gray-200 px-4 py-2 text-right text-red-600">{formatCurrency(totalExpenses)}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>
                <tr className="bg-green-50 font-medium">
                  <td className="border border-gray-200 px-4 py-2">Net Profit</td>
                  <td className={`border border-gray-200 px-4 py-2 text-right ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </td>
                  <td className={`border border-gray-200 px-4 py-2 text-right ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 overflow-x-auto">
            <h3 className="text-lg font-medium mb-4">Monthly Breakdown</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Month</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Revenue</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Expenses</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Profit</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((month, index) => {
                  const monthMargin = month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0;
                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-200 px-4 py-2">{month.month}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(month.revenue)}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(month.expenses)}</td>
                      <td className={`border border-gray-200 px-4 py-2 text-right ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(month.profit)}
                      </td>
                      <td className={`border border-gray-200 px-4 py-2 text-right ${monthMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthMargin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
