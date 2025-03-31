
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BudgetAnalysisChartProps {
  analysisData: any[];
  formatCurrency: (value: number) => string;
}

const BudgetAnalysisChart: React.FC<BudgetAnalysisChartProps> = ({ 
  analysisData,
  formatCurrency 
}) => {
  return (
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
  );
};

export default BudgetAnalysisChart;
