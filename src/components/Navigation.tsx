import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Home, DollarSign, Info, Settings, HelpCircle, User } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold flex items-center gap-2">
          <Home className="w-5 h-5" />
          Digibooks
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/features" className="text-secondary hover:text-primary transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Features
          </Link>
          <Link to="/pricing" className="text-secondary hover:text-primary transition-colors flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing
          </Link>
          <Link to="/about" className="text-secondary hover:text-primary transition-colors flex items-center gap-2">
            <Info className="w-4 h-4" />
            About
          </Link>
          <Link to="/help" className="text-secondary hover:text-primary transition-colors flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Help
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex items-center gap-2">
            <User className="w-4 h-4" />
            Sign In
          </Button>
          <Button className="text-white">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;