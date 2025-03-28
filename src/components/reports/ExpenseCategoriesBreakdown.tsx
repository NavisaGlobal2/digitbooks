
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ExpenseBreakdown } from "@/hooks/useFinancialReports";
import { formatNaira } from "@/utils/invoice/formatters";

interface ExpenseCategoriesBreakdownProps {
  data: ExpenseBreakdown[];
}

const COLORS = ["#F87171", "#FBBF24", "#60A5FA", "#34D399", "#A78BFA", "#F472B6"];

const ExpenseCategoriesBreakdown = ({ data }: ExpenseCategoriesBreakdownProps) => {
  // Sort data by amount in descending order
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  // Custom name formatting
  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  dataKey="amount"
                  nameKey="category"
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNaira(value as number)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 overflow-x-auto">
            <div className="min-w-[300px]">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs sm:text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-right text-xs sm:text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-right text-xs sm:text-sm font-medium text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0 border-gray-100">
                      <td className="py-1 sm:py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-xs sm:text-sm">{formatCategoryName(item.category)}</span>
                        </div>
                      </td>
                      <td className="py-1 sm:py-2 text-right text-xs sm:text-sm">{formatNaira(item.amount)}</td>
                      <td className="py-1 sm:py-2 text-right text-xs sm:text-sm">{item.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoriesBreakdown;
