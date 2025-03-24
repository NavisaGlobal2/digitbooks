
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <p className="text-secondary">Here's what's happening with your finances today.</p>
      
      <div className="flex gap-4">
        <Button variant="outline" className="gap-2 rounded-full">
          <Filter className="h-4 w-4" />
          Last six month
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
