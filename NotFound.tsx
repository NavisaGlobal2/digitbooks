
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-bold">Page Not Found</h1>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>
          <Link to="/">
            <Button className="mt-4" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
