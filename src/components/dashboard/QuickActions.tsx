
import { FileText, CreditCard, Wallet, LayoutGrid, BarChart4, FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const QuickActions = () => {
  const actions = [
    { icon: FileText, label: "Create Invoice", path: "/invoicing" },
    { icon: CreditCard, label: "Track Expense", path: "/expenses" },
    { icon: Wallet, label: "Manage Revenue", path: "/revenue" },
    { icon: LayoutGrid, label: "General Ledger", path: "/ledger" },
    { icon: BarChart4, label: "Analytics", path: "/reports" },
    { icon: FileSpreadsheet, label: "Reports", path: "/reports" }
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        {actions.map((action, index) => (
          <Card key={index} className="p-0 border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/20 hover:translate-y-[-2px]">
            <Button 
              variant="ghost" 
              asChild
              className="w-full h-full flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 space-y-1"
            >
              <Link to={action.path}>
                <action.icon className="h-4 w-4 text-primary mb-1" />
                <span className="text-[10px] sm:text-xs font-medium text-center">{action.label}</span>
              </Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
