
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Home, DollarSign, Info, Settings, HelpCircle, Briefcase } from "lucide-react";
import { Logo } from "./Logo";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center">
            <Logo className="h-8 w-8" />
          </div>
          <span className="text-gray-800">DigitBooks</span>
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
          <Link to="/careers" className="text-secondary hover:text-primary transition-colors flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Careers
          </Link>
          <Link to="/help" className="text-secondary hover:text-primary transition-colors flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Help
          </Link>
        </div>

        <div className="flex items-center">
          <Link to="/auth">
            <Button className="text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
