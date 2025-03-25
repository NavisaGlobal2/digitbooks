
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AgentButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/agent");
    toast.success("Opening AI Agent");
  };

  return (
    <Button
      className="bg-[#05D166] hover:bg-[#05D166]/90 text-white px-2 sm:px-4 py-1 rounded-md text-xs sm:text-sm flex items-center gap-2"
      onClick={handleClick}
    >
      <Bot className="h-4 w-4" />
      <span className="hidden sm:inline">Agent</span>
      <span className="sm:hidden">AI</span>
    </Button>
  );
};

export default AgentButton;
