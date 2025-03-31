
export interface ReportData {
  title: string;
  period: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  financialData?: FinancialData;
  cashflowData?: ChartData[];
}

export interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  revenueBreakdown?: RevenueItem[];
  expenseBreakdown?: ExpenseItem[];
}

export interface RevenueItem {
  source: string;
  amount: number;
  percentage: number;
}

export interface ExpenseItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface ChartData {
  name: string;
  inflow: number;
  outflow: number;
}
