
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">All time revenue</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Quarterly Revenue</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(quarterlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">Last 90 days</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Latest Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNaira(latestRevenue)}</div>
          <p className="text-xs text-muted-foreground">Most recent transaction</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueStatsCards;
