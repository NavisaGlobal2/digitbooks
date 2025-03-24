
import { FileText, CreditCard, Wallet, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-4 px-3 space-y-1.5">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Create Invoice</span>
          </Button>
        </Card>
        
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-4 px-3 space-y-1.5">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Track expense</span>
          </Button>
        </Card>
        
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-4 px-3 space-y-1.5">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Manage revenue</span>
          </Button>
        </Card>
        
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-4 px-3 space-y-1.5">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">General ledger</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default QuickActions;
