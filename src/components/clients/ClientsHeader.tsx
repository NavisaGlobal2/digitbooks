
import { useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClientsHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-white">
      <div className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/invoicing")}
            className="flex items-center text-sm font-medium hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Invoicing
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add client
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ClientsHeader;
