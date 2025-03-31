
import React, { useEffect, useState, useRef } from "react";
import { ReportActions } from "../income-statement/ReportActions";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useRevenue } from "@/contexts/RevenueContext";
import { RevenueBreakdown } from "@/hooks/useFinancialReports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RevenueSummaryReportProps {
  onBack: () => void;
  period: string;
  dateRange: { startDate: Date; endDate: Date } | null;
}

const RevenueSummaryReport: React.FC<RevenueSummaryReportProps> = ({
  onBack,
  period,
  dateRange,
}) => {
  const { revenues } = useRevenue();
  const [revenueData, setRevenueData] = useState<RevenueBreakdown[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const reportRef = useRef<HTMLDivElement>(null);
  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#10b981"];

  useEffect(() => {
    if (!revenues.length) return;

    // Filter revenues by date range if provided
    let filteredRevenues = [...revenues];
    
    if (dateRange) {
      filteredRevenues = revenues.filter(revenue => {
        const revenueDate = new Date(revenue.date);
        return (
          revenueDate >= dateRange.startDate &&
          revenueDate <= dateRange.endDate
        );
      });
    }

    // Calculate total revenue
    const total = filteredRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    setTotalRevenue(total);

    // Group revenues by source
    const revenuesBySource = filteredRevenues.reduce((acc: Record<string, number>, revenue) => {
      const source = revenue.source;
      acc[source] = (acc[source] || 0) + revenue.amount;
      return acc;
    }, {});

    // Convert to RevenueBreakdown format and sort by amount (descending)
    const breakdownData: RevenueBreakdown[] = Object.entries(revenuesBySource).map(([source, amount]) => ({
      source,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }));

    breakdownData.sort((a, b) => b.amount - a.amount);
    setRevenueData(breakdownData);
  }, [revenues, dateRange]);

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Prepare report data for storage
  const reportData = {
    totalRevenue,
    revenueBreakdown: revenueData
  };

  return (
    <div className="space-y-6" id="report-container">
      <ReportActions
        onBack={onBack}
        title="Revenue Summary"
        period={period}
        dateRange={dateRange}
        reportRef={reportRef}
        reportData={reportData}
      />

      <div 
        ref={reportRef} 
        className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none" 
        id="revenue-summary-report-content"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Revenue Summary</h1>
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
                <h2 className="text-lg font-medium">Total Revenue</h2>
                <span className="text-2xl font-bold">{formatCurrency(totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>

          {revenueData.length > 0 ? (
            <>
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Revenue Sources Breakdown</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={formatCurrency} />
                      <YAxis type="category" dataKey="source" width={90} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), "Amount"]}
                        labelFormatter={(label) => `Source: ${label}`}
                      />
                      <Bar dataKey="amount" fill="#22c55e" radius={[0, 4, 4, 0]}>
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-8 overflow-x-auto">
                <h3 className="text-lg font-medium mb-4">Revenue Sources Detail</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Source</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Amount</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></div>
                            {item.source}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{item.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50 font-medium">
                      <td className="border border-gray-200 px-4 py-2">Total</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatCurrency(totalRevenue)}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No revenue data available for the selected period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueSummaryReport;
