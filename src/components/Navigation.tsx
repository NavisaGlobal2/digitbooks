
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-semibold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent hidden sm:inline-block">
              DigitBooks
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/features"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/auth">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-white border-t border-gray-100">
          <nav className="flex flex-col gap-4">
            <Link
              to="/features"
              className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/auth"
              className="text-base font-medium text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/auth" 
              className="w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
