
import { ArrowDown, ArrowUp, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/utils/invoice/formatters";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from "date-fns";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
}

const TransactionsSection = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>("thisMonth");
  const [filterLabel, setFilterLabel] = useState<string>("This Month");
  
  useEffect(() => {
    fetchRecentTransactions();
  }, [filterPeriod]);

  const fetchRecentTransactions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on filter
      const { startDate, endDate } = getDateRange(filterPeriod);
      
      // First try to get recent expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('id, description, amount, date')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });
        
      if (expenseError) throw expenseError;
      
      // Then get recent revenues
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenues')
        .select('id, description, amount, date')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });
        
      if (revenueError) throw revenueError;
      
      // Convert to our transaction format
      const expenseTransactions = (expenseData || []).map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: Number(expense.amount),
        type: "debit" as const,
        date: new Date(expense.date).toISOString()
      }));
      
      const revenueTransactions = (revenueData || []).map(revenue => ({
        id: revenue.id,
        description: revenue.description,
        amount: Number(revenue.amount),
        type: "credit" as const,
        date: new Date(revenue.date).toISOString()
      }));
      
      // Combine, sort by date (newest first), and limit to 4
      const combinedTransactions = [...expenseTransactions, ...revenueTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4);
        
      setTransactions(combinedTransactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      setError("Failed to load recent transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    
    switch(period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'last3Months':
        startDate = startOfMonth(subMonths(now, 3));
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
    
    return { startDate, endDate };
  };

  const handleFilterChange = (period: string, label: string) => {
    setFilterPeriod(period);
    setFilterLabel(label);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 md:pt-6 px-4 md:px-6">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-sm gap-2 h-9 w-full sm:w-auto">
              <Calendar className="h-4 w-4" />
              {filterLabel}
              <ChevronDown className="h-4 w-4 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleFilterChange("today", "Today")}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("thisWeek", "This Week")}>
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("thisMonth", "This Month")}>
              This Month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("lastMonth", "Last Month")}>
              Last Month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange("last3Months", "Last 3 Months")}>
              Last 3 Months
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No transactions found for this period</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'credit' ? 
                          <ArrowDown className="h-4 w-4 text-green-600" /> : 
                          <ArrowUp className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <p className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatNaira(transaction.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Link to="/ledger">
              <Button variant="ghost" className="w-full mt-4 text-primary text-sm flex items-center justify-center gap-1">
                <span>View all transactions</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsSection;
