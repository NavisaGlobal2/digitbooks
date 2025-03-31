
import { useFinancialReports, DateRange, ReportFilters, RevenueBreakdown, ExpenseBreakdown, FinancialSummary } from "./reports/useFinancialReports";

// Re-export all types and the hook from the new location
export type { DateRange, ReportFilters, RevenueBreakdown, ExpenseBreakdown, FinancialSummary };
export { useFinancialReports };

// Export default for backward compatibility
export default useFinancialReports;
