
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProfitLossTrendsChartProps {
  monthlySummary: any[];
  formatCurrency: (value: number) => string;
}

const ProfitLossTrendsChart: React.FC<ProfitLossTrendsChartProps> = ({ 
  monthlySummary,
  formatCurrency
}) => {
  return (
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
  );
};

export default ProfitLossTrendsChart;
