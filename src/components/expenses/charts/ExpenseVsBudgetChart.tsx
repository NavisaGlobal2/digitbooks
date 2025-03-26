
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

// Sample data for the bar chart - this would be replaced by actual data
const data = [
  { name: "Jan", budget: 4000, expenses: 2400 },
  { name: "Feb", budget: 3000, expenses: 2800 },
  { name: "Mar", budget: 3500, expenses: 2200 },
  { name: "Apr", budget: 4000, expenses: 1800 },
  { name: "May", budget: 3000, expenses: 2800 },
  { name: "Jun", budget: 3500, expenses: 2200 }
];

const chartConfig = {
  budget: {
    label: "Budget",
    color: "#10B981" // green-500
  },
  expenses: {
    label: "Expenses",
    color: "#F87171" // red-400
  }
};

const ExpenseVsBudgetChart = () => {
  return (
    <Card className="p-4 h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Expenses vs Budget</h2>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-500 mr-3">Budget</span>
          <div className="w-3 h-3 bg-red-400 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-500">Expenses</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          barGap={0}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#888', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888', fontSize: 12 }}
            tickFormatter={(value) => `₦${value}`}
          />
          <Bar dataKey="budget" fill="#10B981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="expenses" fill="#F87171" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ExpenseVsBudgetChart;
