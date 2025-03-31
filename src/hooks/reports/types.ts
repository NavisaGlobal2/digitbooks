
import { ExpenseCategory } from "@/types/expense";

export type DateRange = "current-month" | "last-month" | "quarter" | "year" | "custom";

export interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  revenueBreakdown: RevenueBreakdown[];
  expenseBreakdown: ExpenseBreakdown[];
  monthlySummary: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

export interface ReportFilters {
  dateRange: DateRange;
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  sources?: string[];
}

export interface DateRangeResult {
  start: Date;
  end: Date;
}
