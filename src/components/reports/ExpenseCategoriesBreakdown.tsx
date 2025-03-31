
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from "recharts";
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

  // Format the data for the horizontal bar chart
  const chartData = sortedData.map((item, index) => ({
    ...item,
    formattedCategory: formatCategoryName(item.category),
    color: COLORS[index % COLORS.length],
    formattedAmount: formatNaira(item.amount)
  }));

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <XAxis type="number" tickFormatter={(value) => formatNaira(value)} />
                <YAxis 
                  type="category" 
                  dataKey="formattedCategory" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => formatNaira(value as number)}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                {chartData.map((entry, index) => (
                  <Bar 
                    key={`bar-${index}`}
                    dataKey="amount" 
                    fill={entry.color}
                    name={entry.formattedCategory}
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList 
                      dataKey="percentage" 
                      position="right" 
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                      style={{ fill: '#6B7280', fontSize: 12 }}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-right text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-right text-sm font-medium text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0 border-gray-100">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{formatCategoryName(item.category)}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">{formatNaira(item.amount)}</td>
                    <td className="py-2 text-right">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoriesBreakdown;
