
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="h-16 border-b border-border px-6 flex items-center justify-end">      
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
