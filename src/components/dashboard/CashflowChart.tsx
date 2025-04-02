
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
import { useCashflowData, CashflowDataPoint } from "@/hooks/useCashflowData";

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

interface CashflowChartProps {
  data?: CashflowDataPoint[];
  isLoading?: boolean;
}

const CashflowChart = ({ data: propData, isLoading: propIsLoading }: CashflowChartProps) => {
  const { data: fetchedData, isLoading: fetchedIsLoading } = useCashflowData(6);
  
  // Use provided data or fetch it if not provided
  const data = propData || fetchedData;
  const isLoading = propIsLoading !== undefined ? propIsLoading : fetchedIsLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-dashed border-green-500"></div>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-muted-foreground text-center">
        <div>
          <p>No cashflow data available</p>
          <p className="text-xs mt-1">Try adding some revenues and expenses</p>
        </div>
      </div>
    );
  }
  
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
            tickFormatter={(value) => `₦${value.toLocaleString()}`}
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
