
import { 
  LayoutDashboard, 
  FileText, 
  CircleDollarSign, 
  BarChart, 
  CreditCard, 
  Settings,
  ChevronRight,
  LogOut,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="w-[240px] h-screen border-r border-border py-4 flex flex-col bg-white shadow-sm">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20V28H4V4Z" stroke="#00C853" strokeWidth="2.5" fill="none"/>
              <path d="M12 4V28" stroke="#00C853" strokeWidth="2.5"/>
              <path d="M4 4H20V28H4V4Z" fill="#00C853" fillOpacity="0.2"/>
            </svg>
          </div>
          <span className="font-semibold text-lg text-gray-800">DigitBooks</span>
        </div>
      </div>
      
      <div className="flex-1 px-2">
        <nav className="space-y-1">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/dashboard' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link to="/invoicing">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/invoicing' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <FileText className="h-5 w-5" />
              Invoicing
            </Button>
          </Link>
          <Link to="/expenses">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/expenses' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <Receipt className="h-5 w-5" />
              Expenses
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-secondary"
          >
            <CircleDollarSign className="h-5 w-5" />
            Banking
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
            Payments
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

      <div className="px-4 mt-auto border-t border-border pt-4">
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">P</span>
            </div>
            <div>
              <p className="font-medium text-sm">Premium Plan</p>
              <p className="text-xs text-muted-foreground">Upgrade features</p>
            </div>
            <ChevronRight className="h-4 w-4 text-secondary ml-auto" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 w-3/4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>
        </div>
        
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
            <p className="text-xs text-muted-foreground">admin@digibooks.com</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LogOut className="h-4 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
