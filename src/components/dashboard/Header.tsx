
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="h-16 border-b border-border px-6 flex items-center justify-between">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input 
          type="text" 
          placeholder="Search for transactions, invoices..." 
          className="pl-10 pr-4 py-2 rounded-full border border-input bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5 text-secondary" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5 text-secondary" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
