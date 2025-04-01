
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netCashflow: number;
  positive: boolean;
}

interface FinancialOverviewProps {
  data: FinancialData;
  isLoading?: boolean;
}

const FinancialOverview = ({ data, isLoading = false }: FinancialOverviewProps) => {
  return (
    <div className="mb-2 relative">
      {/* Background decorative elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-green-100 opacity-30 blur-xl -z-10"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-blue-100 opacity-30 blur-xl -z-10"></div>
      
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Financial Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        <Card className="overflow-hidden border-none shadow-sm transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-500 w-full"></div>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Total Revenue</span>
              <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                <ArrowDown className="text-green-500 h-5 w-5" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : (
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {formatNaira(data.totalRevenue)}
              </div>
            )}
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">Cash inflow</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
          <div className="h-1.5 bg-gradient-to-r from-purple-400 to-purple-500 w-full"></div>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Total Expenses</span>
              <div className="h-8 w-8 bg-purple-50 rounded-full flex items-center justify-center">
                <ArrowUp className="text-purple-500 h-5 w-5" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : (
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                {formatNaira(data.totalExpenses)}
              </div>
            )}
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">Cash outflow</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-500 w-full"></div>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Net Cashflow</span>
              <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                <TrendingUp className="text-blue-500 h-5 w-5" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : (
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                {formatNaira(data.netCashflow)}
              </div>
            )}
            <div className="flex items-center text-sm">
              <span className={data.positive ? "text-success" : "text-destructive"}>
                {data.positive ? "Positive cashflow" : "Negative cashflow"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
