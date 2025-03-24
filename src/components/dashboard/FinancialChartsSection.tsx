
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Sample data for the pie charts
const expenseData = [
  { name: "Salaries", value: 35000, percentage: "31.5%", color: "#10B981" },
  { name: "Rent", value: 25000, percentage: "31.5%", color: "#F87171" },
  { name: "Utilities", value: 15000, percentage: "31.5%", color: "#1E293B" },
  { name: "Marketing", value: 10000, percentage: "31.5%", color: "#93C5FD" },
  { name: "Travel", value: 5000, percentage: "31.5%", color: "#9CA3AF" }
];

const revenueData = [
  { name: "Salaries", value: 45000, percentage: "31.5%", color: "#10B981" },
  { name: "Rent", value: 25000, percentage: "31.5%", color: "#F87171" },
  { name: "Utilities", value: 20000, percentage: "31.5%", color: "#1E293B" },
  { name: "Marketing", value: 15000, percentage: "31.5%", color: "#93C5FD" },
  { name: "Travel", value: 10000, percentage: "31.5%", color: "#9CA3AF" }
];

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
  salaries: {
    label: "Salaries",
    color: "#10B981"
  },
  rent: {
    label: "Rent",
    color: "#F87171"
  },
  utilities: {
    label: "Utilities",
    color: "#1E293B"
  },
  marketing: {
    label: "Marketing",
    color: "#93C5FD"
  },
  travel: {
    label: "Travel",
    color: "#9CA3AF"
  }
};

interface ChartItemProps {
  title: string;
  data: typeof expenseData;
}

const PieChartCard: React.FC<ChartItemProps> = ({ title, data }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };
  
  return (
    <Card className="p-6 border-none shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke={activeIndex === index ? "#FFF" : "transparent"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                    <p className="font-semibold">{data.name}</p>
                    <p>${data.value.toLocaleString()}</p>
                    <p>{data.percentage}</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{item.percentage}</span>
              <span className="text-sm font-medium">-</span>
              <span className="text-sm">${item.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const SalesTrends = () => {
  const [activePoint, setActivePoint] = useState<{
    date: string;
    amount: string;
  } | null>(null);
  
  return (
    <Card className="p-6 border-none shadow-sm mt-5">
      <h2 className="text-lg font-semibold mb-4">Sales trends</h2>
      <div className="h-[250px]">
        <ChartContainer
          config={chartConfig}
          className="w-full aspect-auto h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={1000} height={250}>
              {/* This component will be replaced with a line chart in future updates */}
              <text x={200} y={120} fill="#333" textAnchor="middle">
                Sales trend chart will be implemented in the next update
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};

const FinancialChartsSection = () => {
  const [filterPeriod, setFilterPeriod] = useState("Last six month");

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Financial breakdown</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-sm">
            {filterPeriod}
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-5 mb-5">
        <PieChartCard title="Expense breakdown" data={expenseData} />
        <PieChartCard title="Revenue sources" data={revenueData} />
      </div>
      
      <SalesTrends />
    </div>
  );
};

export default FinancialChartsSection;
