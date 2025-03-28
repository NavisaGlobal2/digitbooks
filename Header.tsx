
import { Bell, Search, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-white shadow-sm z-10">
      <h1 className="text-xl font-bold">Hi Amarachi, let's get organized</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search transactions, invoices..."
            className="pl-10 pr-4 py-2 rounded-full border border-input bg-background w-64 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <HelpCircle className="h-5 w-5 text-secondary" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Settings className="h-5 w-5 text-secondary" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5 text-secondary" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-white px-4 rounded-full text-sm">
          Generate Report
        </Button>
      </div>
    </header>
  );
};

export default Header;
