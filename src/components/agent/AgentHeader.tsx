
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AgentHeaderProps {
  onReset: () => void;
}

const AgentHeader = ({ onReset }: AgentHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/dashboard")} 
        className="h-9 w-9"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        DigitBooks AI Agent
      </h1>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReset}
        className="ml-auto flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
};

export default AgentHeader;
