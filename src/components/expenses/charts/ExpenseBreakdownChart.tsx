
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ExpenseCategory } from "@/types/expense";
import { getCategoryLabel } from "@/utils/expenseCategories";
import { useNavigate } from "react-router-dom";

interface ExpenseBreakdownChartProps {
  data: { category: ExpenseCategory; amount: number; percentage: string }[];
}

const COLORS = ["#10B981", "#F87171", "#1E293B", "#93C5FD", "#9CA3AF"];

const ExpenseBreakdownChart = ({ data }: ExpenseBreakdownChartProps) => {
  const navigate = useNavigate();
  
  const handleSeeBreakdown = () => {
    navigate('/expenses?tab=breakdown');
  };

  return (
    <Card className="p-4 h-[350px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Expense Breakdown</h2>
        <button 
          onClick={handleSeeBreakdown}
          className="text-green-500 text-sm font-medium flex items-center hover:text-green-600 transition-colors"
        >
          See breakdown
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      <div className="flex h-[280px]">
        <div className="w-1/2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₦${value.toLocaleString()}`, "Amount"]}
                labelFormatter={(name) => `Category: ${name}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-1/2 pl-4 flex flex-col justify-center">
          {data.map((item, index) => (
            <div key={index} className="flex items-center mb-3">
              <div 
                className="w-3 h-3 rounded-sm mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className="flex justify-between w-full">
                <span className="text-sm">{getCategoryLabel(item.category)}</span>
                <span className="text-sm font-medium">{item.percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ExpenseBreakdownChart;
