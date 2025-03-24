
import { 
  LayoutDashboard, 
  FileText, 
  Settings,
  ChevronRight,
  LogOut,
  Receipt,
  Wallet,
  Calculator,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "../Logo";

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { logout, user } = useAuth();

  return (
    <div className="w-[240px] h-screen border-r border-border py-4 flex flex-col bg-white shadow-sm">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-semibold text-lg text-gray-800">DigiBooks</span>
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
          <Link to="/revenue">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/revenue' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <Wallet className="h-5 w-5" />
              Revenue tracking
            </Button>
          </Link>
          <Link to="/reports">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/reports' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Financial Reports
            </Button>
          </Link>
          <Link to="/budget">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/budget' || path === '/budgeting' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <Calculator className="h-5 w-5" />
              Budgeting tools
            </Button>
          </Link>
          <Link to="/ledger">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/ledger' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <BookOpen className="h-5 w-5" />
              General ledger
            </Button>
          </Link>
          <Link to="/settings">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 ${path === '/settings' 
                ? 'text-primary font-medium bg-accent/10 border-r-4 border-primary' 
                : 'text-secondary'}`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>

      <div className="px-4 mt-auto border-t border-border pt-4">
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-secondary ml-auto" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 w-3/4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
