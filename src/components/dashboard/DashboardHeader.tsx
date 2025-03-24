
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Good morning, Amarachi!</h1>
        <p className="text-secondary">Here's what's happening with your finances today.</p>
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button className="bg-success text-white hover:bg-success/90">
          + Add Transaction
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
