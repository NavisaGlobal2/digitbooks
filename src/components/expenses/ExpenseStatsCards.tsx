
import { Receipt, PieChart, TrendingUp, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseCategory } from "@/types/expense";
import { formatNaira } from "@/utils/invoice/formatters";
import { getCategoryLabel } from "@/utils/expenseCategories";

interface ExpenseStatsCardsProps {
  totalExpenses: number;
  expensesCount: number;
  topCategories: { category: ExpenseCategory; amount: number }[];
  cardExpensesCount: number;
}

const ExpenseStatsCards = ({ 
  totalExpenses, 
  expensesCount, 
  topCategories,
  cardExpensesCount 
}: ExpenseStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <Receipt className="h-4 w-4" />
            <span className="text-sm font-medium">Total Expenses</span>
          </div>
          <h3 className="text-3xl font-bold">{formatNaira(totalExpenses)}</h3>
          <p className="text-sm text-gray-500 mt-1">{expensesCount} expense(s)</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <PieChart className="h-4 w-4" />
            <span className="text-sm font-medium">Top Category</span>
          </div>
          <h3 className="text-2xl font-bold truncate">
            {topCategories.length > 0 ? getCategoryLabel(topCategories[0].category) : "N/A"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {topCategories.length > 0 ? formatNaira(topCategories[0].amount) : "₦0.00"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">This Month</span>
          </div>
          <h3 className="text-3xl font-bold">{formatNaira(totalExpenses)}</h3>
          <p className="text-sm text-gray-500 mt-1">vs. ₦0 last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-medium">Payment Method</span>
          </div>
          <h3 className="text-3xl font-bold">{cardExpensesCount}</h3>
          <p className="text-sm text-gray-500 mt-1">Card transactions</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseStatsCards;
