
import React from "react";

interface ProfitLossSummaryTableProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  formatCurrency: (value: number) => string;
}

const ProfitLossSummaryTable: React.FC<ProfitLossSummaryTableProps> = ({
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  formatCurrency
}) => {
  return (
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
  );
};

export default ProfitLossSummaryTable;
