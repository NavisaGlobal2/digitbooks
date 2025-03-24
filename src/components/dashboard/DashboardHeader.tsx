
import { Bell, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Hi Amarachi, let's get organized</h1>
        <p className="text-secondary">Here's what's happening with your finances today.</p>
      </div>
      
      <div className="flex gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search transactions, invoices..." 
            className="pl-10 pr-4 py-2 rounded-full border border-input bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button className="bg-success text-white hover:bg-success/90">
          Generate report
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
