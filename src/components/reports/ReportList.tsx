
import { ReportCard } from "@/components/reports/ReportCard";

interface ReportListProps {
  onSelectReport: (reportType: string) => void;
}

export const ReportList = ({ onSelectReport }: ReportListProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Available Reports</h2>
        <p className="text-muted-foreground text-sm">
          Select a report type to generate or view
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
        <ReportCard
          title="Income Statement"
          description="Summary of revenues, costs, and expenses over a period"
          variant="green"
          onClick={() => onSelectReport("income-statement")}
        />
        <ReportCard
          title="Cash Flow Statement"
          description="Track cash inflows and outflows for your business"
          variant="blue"
          onClick={() => onSelectReport("cash-flow")}
        />
        <ReportCard
          title="Expense Summary"
          description="Breakdown of all expenses by category"
          variant="yellow"
          onClick={() => onSelectReport("expense-summary")}
        />
        <ReportCard
          title="Revenue Summary"
          description="Summary of all revenue sources and trends"
          variant="green"
          onClick={() => onSelectReport("revenue-summary")}
        />
        <ReportCard
          title="Budget Analysis"
          description="Compare actual spending against budget allocations"
          variant="blue"
          onClick={() => onSelectReport("budget-analysis")}
        />
        <ReportCard
          title="Profit & Loss"
          description="Detail of business performance and profitability"
          variant="yellow"
          onClick={() => onSelectReport("profit-loss")}
        />
      </div>
    </div>
  );
};
