
import React from "react";

interface BudgetAnalysisTableProps {
  analysisData: any[];
  formatCurrency: (value: number) => string;
  getStatusColor: (percentUsed: number) => string;
  totalBudgeted: number;
  totalSpent: number;
}

const BudgetAnalysisTable: React.FC<BudgetAnalysisTableProps> = ({
  analysisData,
  formatCurrency,
  getStatusColor,
  totalBudgeted,
  totalSpent
}) => {
  return (
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
  );
};

export default BudgetAnalysisTable;
