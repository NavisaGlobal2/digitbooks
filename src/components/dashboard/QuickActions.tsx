
import { FileText, CreditCard, Wallet, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-6 px-4 space-y-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Create Invoice</span>
          </Button>
        </Card>
        
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-6 px-4 space-y-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Track expense</span>
          </Button>
        </Card>
        
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-6 px-4 space-y-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Manage revenue</span>
          </Button>
        </Card>
        
        <Card className="p-0 border shadow-sm hover:shadow-md transition-shadow">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center py-6 px-4 space-y-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">General ledger</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default QuickActions;
