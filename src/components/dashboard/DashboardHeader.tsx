
import { Filter, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AnalyticsAIChat from "@/components/analytics/AnalyticsAIChat";
import { toast } from "sonner";

const DashboardHeader = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const openAnalyticsAI = () => {
    setIsAIChatOpen(true);
    toast.success("Analytics AI Assistant opened");
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <p className="text-secondary">Here's what's happening with your finances today.</p>
      
      <div className="flex gap-2 sm:gap-4">
        <Button 
          variant="outline" 
          onClick={openAnalyticsAI}
          className="hidden sm:flex items-center gap-2 rounded-full border-[#05D166]/30 bg-[#05D166]/10 hover:bg-[#05D166]/20 text-xs sm:text-sm"
        >
          <Bot className="h-4 w-4 text-[#05D166]" />
          Analytics AI
        </Button>
        
        <Button variant="outline" className="gap-2 rounded-full">
          <Filter className="h-4 w-4" />
          Last six month
        </Button>
      </div>
      
      {/* Analytics AI Chat Modal */}
      <AnalyticsAIChat 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
      />
    </div>
  );
};

export default DashboardHeader;
