
import { useState } from "react";
import {
  Bar,
  BarChart,
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
    color: "#FCA5A5" // light red
  }
};

const CashflowChart = () => {
  const [data] = useState(generateRandomData());
  
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full aspect-auto h-full"
    >
      <BarChart data={data}>
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
        <CartesianGrid vertical={false} stroke="#E6E4DD" />
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
        <Bar
          dataKey="inflow"
          fill={chartConfig.inflow.color}
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
        <Bar
          dataKey="outflow"
          fill={chartConfig.outflow.color}
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ChartContainer>
  );
};

export default CashflowChart;
