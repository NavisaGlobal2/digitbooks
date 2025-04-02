
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface SalesTrendDataItem {
  name: string;
  value: number;
}

export const useSalesTrendsData = (period: string = "Last six months") => {
  const [salesData, setSalesData] = useState<SalesTrendDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSalesTrendsData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);
      
      try {
        // Determine date range based on period
        const endDate = new Date();
        const startDate = new Date();
        
        if (period.includes("month")) {
          // Extract number of months if period is like "Last six months"
          const months = parseInt(period.match(/\d+/)?.[0] || "6");
          startDate.setMonth(startDate.getMonth() - months);
        } else {
          // Handle specific month/year format (e.g., "Jan 2023")
          const dateObj = new Date(period);
          if (!isNaN(dateObj.getTime())) {
            startDate.setFullYear(dateObj.getFullYear(), dateObj.getMonth(), 1);
            endDate.setFullYear(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
          } else {
            // Default to last 6 months if format is not recognized
            startDate.setMonth(startDate.getMonth() - 6);
          }
        }

        // Format dates for database queries
        const startStr = startDate.toISOString();
        const endStr = endDate.toISOString();

        // Fetch revenue data grouped by month
        const { data: monthlyRevenue, error: revenueError } = await supabase
          .from('revenues')
          .select('date, amount')
          .eq('user_id', user.id)
          .gte('date', startStr)
          .lte('date', endStr)
          .order('date', { ascending: true });

        if (revenueError) throw revenueError;

        // Process revenue by month
        const monthlyData = new Map<string, number>();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize all months in the period with zero
        for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
          const monthKey = months[d.getMonth()];
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, 0);
          }
        }

        // Sum up revenues by month
        monthlyRevenue?.forEach(revenue => {
          const date = new Date(revenue.date);
          const monthKey = months[date.getMonth()];
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + Number(revenue.amount));
        });

        // Convert to array format needed for the chart
        const formattedData: SalesTrendDataItem[] = Array.from(monthlyData.entries())
          .map(([name, value]) => ({ name, value }));

        // Sort by month order (not alphabetically)
        formattedData.sort((a, b) => {
          return months.indexOf(a.name) - months.indexOf(b.name);
        });

        setSalesData(formattedData);
      } catch (err: any) {
        console.error("Error fetching sales trends data:", err);
        setError(err.message || "Failed to fetch sales trends data");
        toast.error("Failed to load sales trends data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesTrendsData();
  }, [user, period]);

  return { salesData, isLoading, error };
};
