
import { FileText, CreditCard, Wallet, LayoutGrid, FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  const actions = [
    { icon: FileText, label: "Create Invoice" },
    { icon: CreditCard, label: "Track Expense" },
    { icon: Wallet, label: "Manage Revenue" },
    { icon: LayoutGrid, label: "General Ledger" },
    { icon: FileSpreadsheet, label: "Reports" }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <Card key={index} className="p-0 border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/20 hover:translate-y-[-2px]">
            <Button 
              variant="ghost" 
              className="w-full h-full flex flex-col items-center justify-center py-3 px-2 space-y-1.5"
            >
              <action.icon className="h-4 w-4 text-primary mb-1" />
              <span className="text-xs font-medium break-words">{action.label}</span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
