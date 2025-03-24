
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Sample data for the chart
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const generateRandomData = () => {
  return MONTHS.map(month => {
    const inflow = Math.floor(Math.random() * 10000) + 2000;
    const outflow = Math.floor(Math.random() * 8000) + 1000;
    
    return {
      name: month,
      inflow,
      outflow,
    };
  });
};

const chartConfig = {
  inflow: {
    label: "Inflow",
    color: "#10B981" // success color
  },
  outflow: {
    label: "Outflow",
    color: "#9b87f5" // purple color for outflow
  }
};

const CashflowChart = () => {
  const [data] = useState(generateRandomData());
  
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full aspect-auto h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(value) => `$${value}`}
          />
          <CartesianGrid vertical={false} stroke="#E6E4DD" strokeDasharray="3 3" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              
              return (
                <ChartTooltipContent
                  label={payload[0].payload.name}
                  payload={payload}
                />
              );
            }}
          />
          <Area 
            type="monotone" 
            dataKey="inflow" 
            stroke="#10B981" 
            fillOpacity={1}
            fill="url(#inflow)" 
          />
          <Area 
            type="monotone" 
            dataKey="outflow" 
            stroke="#9b87f5" 
            fillOpacity={1}
            fill="url(#outflow)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CashflowChart;
