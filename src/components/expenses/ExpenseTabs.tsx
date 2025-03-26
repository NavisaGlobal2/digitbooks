
import { cn } from "@/lib/utils";
import { FileText, Users, Receipt } from "lucide-react";

interface ExpenseTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ExpenseTabs = ({ activeTab, setActiveTab }: ExpenseTabsProps) => {
  return (
    <div className="border-b mb-6">
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab("expenses")}
          className={cn(
            "py-2 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === "expenses"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <Receipt className="w-4 h-4" />
          Expenses
        </button>
        <button
          onClick={() => setActiveTab("bills")}
          className={cn(
            "py-2 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === "bills"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <FileText className="w-4 h-4" />
          Bills
        </button>
        <button
          onClick={() => setActiveTab("vendors")}
          className={cn(
            "py-2 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === "vendors"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <Users className="w-4 h-4" />
          Vendors
        </button>
      </div>
    </div>
  );
};

export default ExpenseTabs;
