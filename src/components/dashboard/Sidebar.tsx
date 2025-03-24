
import { 
  ArrowDown, 
  ArrowUp, 
  BarChart, 
  CreditCard, 
  FileText, 
  LayoutGrid, 
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  return (
    <div className="w-[240px] h-screen border-r border-border py-4 flex flex-col">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold">DB</span>
          </div>
          <span className="font-semibold text-lg">DigiBooks</span>
        </div>
      </div>
      
      <div className="flex-1 px-2">
        <nav className="space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-primary font-medium bg-accent/10"
          >
            <LayoutGrid className="h-5 w-5" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-secondary"
          >
            <FileText className="h-5 w-5" />
            Invoicing
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-secondary"
          >
            <ArrowDown className="h-5 w-5" />
            Expenses
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-secondary"
          >
            <ArrowUp className="h-5 w-5" />
            Revenue
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-secondary"
          >
            <BarChart className="h-5 w-5" />
            Reports
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-secondary"
          >
            <CreditCard className="h-5 w-5" />
            Banking
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-secondary"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
        </nav>
      </div>

      <div className="px-4 mt-auto">
        <div className="flex items-center gap-3 p-2">
          <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden">
            <img 
              src="https://i.pravatar.cc/36" 
              alt="User avatar" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Amarachi</p>
            <p className="text-xs text-muted-foreground">Premium plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
