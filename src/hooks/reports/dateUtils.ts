
import { format } from "date-fns";
import { DateRangeResult, ReportFilters } from "./types";

// Generate date range based on filter type
export const getDateRange = (filter: ReportFilters): DateRangeResult => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  if (filter.dateRange === "custom" && filter.startDate && filter.endDate) {
    return { start: filter.startDate, end: filter.endDate };
  }

  switch (filter.dateRange) {
    case "current-month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      // No need to modify end here, it's already set to now
      break;
    case "last-month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      // No need to modify end here, it's already set to now
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      // No need to modify end here, it's already set to now
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      // No need to modify end here, it's already set to now
  }

  // Set end time to the end of the day
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Generate monthly summary data for charts
export const generateMonthlySummary = (
  start: Date,
  end: Date,
  revenueData: any[],
  invoiceData: any[],
  expenseData: any[]
) => {
  // Create a map to store monthly data
  const monthlyData = new Map();
  
  // Create entries for each month in the range
  let currentDate = new Date(start);
  while (currentDate <= end) {
    const monthKey = format(currentDate, 'yyyy-MM');
    const monthLabel = format(currentDate, 'MMM yyyy');
    
    monthlyData.set(monthKey, {
      month: monthLabel,
      revenue: 0,
      expenses: 0,
      profit: 0
    });
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Add revenue data
  revenueData.forEach(item => {
    const date = new Date(item.date);
    const monthKey = format(date, 'yyyy-MM');
    
    if (monthlyData.has(monthKey)) {
      const monthData = monthlyData.get(monthKey);
      monthData.revenue += item.amount;
    }
  });
  
  // Add invoice revenue
  invoiceData.forEach(item => {
    const date = new Date(item.issued_date);
    const monthKey = format(date, 'yyyy-MM');
    
    if (monthlyData.has(monthKey)) {
      const monthData = monthlyData.get(monthKey);
      monthData.revenue += item.amount;
    }
  });
  
  // Add expense data
  expenseData.forEach(item => {
    const date = new Date(item.date);
    const monthKey = format(date, 'yyyy-MM');
    
    if (monthlyData.has(monthKey)) {
      const monthData = monthlyData.get(monthKey);
      monthData.expenses += item.amount;
    }
  });
  
  // Calculate profit for each month
  monthlyData.forEach(data => {
    data.profit = data.revenue - data.expenses;
  });
  
  // Convert map to array
  return Array.from(monthlyData.values());
};
