
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Home, DollarSign, Info, Settings, HelpCircle, Briefcase, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useState } from "react";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center">
            <Logo className="h-8 w-8" />
          </div>
          <span className="text-gray-800">DigitBooks</span>
        </Link>
        
        {/* Desktop navigation */}
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
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 ml-2 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700" />
            )}
          </button>
          
          <Link to="/auth" className="ml-4">
            <Button className="bg-[#05D166] hover:bg-[#05D166]/80 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <Link 
              to="/features" 
              className="block py-2 text-secondary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Features
              </div>
            </Link>
            <Link 
              to="/pricing" 
              className="block py-2 text-secondary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </div>
            </Link>
            <Link 
              to="/about" 
              className="block py-2 text-secondary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                About
              </div>
            </Link>
            <Link 
              to="/careers" 
              className="block py-2 text-secondary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Careers
              </div>
            </Link>
            <Link 
              to="/help" 
              className="block py-2 text-secondary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Help
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
