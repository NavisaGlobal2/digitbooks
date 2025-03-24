
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Sample data for the sales trend chart
const salesTrendData = [
  { name: "Jan", value: 80000 },
  { name: "Feb", value: 20000 },
  { name: "Mar", value: 40000 },
  { name: "Apr", value: 120000 },
  { name: "May", value: 20000 },
  { name: "Jun", value: 50000 },
  { name: "Jul", value: 85000 },
  { name: "Aug", value: 65000 },
  { name: "Sep", value: 85000 },
  { name: "Oct", value: 50000 },
  { name: "Nov", value: 85000 },
  { name: "Dec", value: 190000 }
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#9b87f5"
  }
};

const SalesTrendsChart = () => {
  return (
    <Card className="p-6 border-none shadow-sm mt-5">
      <h2 className="text-lg font-semibold mb-4">Sales trends</h2>
      <div className="h-[250px]">
        <ChartContainer
          config={chartConfig}
          className="w-full aspect-auto h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesTrendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E4DD" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#828179' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#828179' }}
                tickFormatter={(value) => `$${(value / 1000)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p>${payload[0].value.toLocaleString()}</p>
                    </div>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value"
                stroke="#9b87f5"
                strokeWidth={2}
                dot={{ r: 4, fill: "#9b87f5", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#9b87f5", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default SalesTrendsChart;
