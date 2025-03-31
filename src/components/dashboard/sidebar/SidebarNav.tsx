
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Settings,
  Receipt,
  Wallet,
  Calculator,
  BookOpen,
  Building2
} from "lucide-react";
import SidebarLink from "./SidebarLink";

interface SidebarNavProps {
  isCollapsed: boolean;
}

const SidebarNav = ({ isCollapsed }: SidebarNavProps) => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/invoicing", icon: FileText, label: "Invoicing" },
    { to: "/expenses", icon: Receipt, label: "Expenses" },
    { to: "/vendors", icon: Building2, label: "Vendors" },
    { to: "/revenue", icon: Wallet, label: "Revenue" },
    { to: "/reports", icon: LayoutDashboard, label: "Reports" },
    { to: "/budget", icon: Calculator, label: "Budgeting" },
    { to: "/ledger", icon: BookOpen, label: "Ledger" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <SidebarLink
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isActive={path === item.to || (path === '/budgeting' && item.to === '/budget')}
          isCollapsed={isCollapsed}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;
