
import { CreditCard, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice";
import { useRevenue } from "@/contexts/RevenueContext";

const RevenueStatsCards = () => {
  const { revenues, getTotalRevenue } = useRevenue();

  // Calculate monthly revenue (last 30 days)
  const getMonthlyRevenue = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return revenues
      .filter(revenue => new Date(revenue.date) >= thirtyDaysAgo)
      .reduce((total, revenue) => total + revenue.amount, 0);
  };

  // Calculate quarterly revenue (last 90 days)
  const getQuarterlyRevenue = () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    return revenues
      .filter(revenue => new Date(revenue.date) >= ninetyDaysAgo)
      .reduce((total, revenue) => total + revenue.amount, 0);
  };

  // Get most recent revenue
  const getLatestRevenue = () => {
    if (revenues.length === 0) return 0;
    
    const sortedRevenues = [...revenues].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedRevenues[0].amount;
  };

  const totalRevenue = getTotalRevenue();
  const monthlyRevenue = getMonthlyRevenue();
  const quarterlyRevenue = getQuarterlyRevenue();
  const latestRevenue = getLatestRevenue();

  // Calculate growth rates
  const previousMonthRevenue = totalRevenue - monthlyRevenue;
  const monthlyGrowthRate = previousMonthRevenue === 0 
    ? 100 
    : ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(monthlyRevenue)}</div>
          <div className="flex items-center mt-1">
            <div className={`text-xs ${monthlyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'} font-medium flex items-center`}>
              {monthlyGrowthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
              )}
              {monthlyGrowthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground ml-2">vs. previous</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Quarterly Revenue</CardTitle>
          <div className="p-2 bg-purple-100 rounded-full">
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(quarterlyRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Latest Revenue</CardTitle>
          <div className="p-2 bg-amber-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(latestRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Most recent transaction</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueStatsCards;
