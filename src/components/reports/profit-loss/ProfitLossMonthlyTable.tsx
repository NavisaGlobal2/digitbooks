
import React from "react";

interface ProfitLossMonthlyTableProps {
  monthlySummary: any[];
  formatCurrency: (value: number) => string;
}

const ProfitLossMonthlyTable: React.FC<ProfitLossMonthlyTableProps> = ({
  monthlySummary,
  formatCurrency
}) => {
  return (
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
  );
};

export default ProfitLossMonthlyTable;
