
import { useState, useEffect } from "react";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import AgentHeader from "@/components/agent/AgentHeader";
import AgentChatCard from "@/components/agent/AgentChatCard";
import { useAgentChat } from "@/hooks/useAgentChat";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Agent = () => {
  const { 
    messages, 
    isTyping, 
    handleSendMessage, 
    resetChat,
    isLoadingFinancialData
  } = useAgentChat();

  return (
    <DashboardContainer>
      <div className="h-full flex flex-col">
        <AgentHeader onReset={resetChat} />

        {isLoadingFinancialData && (
          <Alert variant="default" className="mb-4 bg-muted/50 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              Loading your financial data to provide personalized insights...
            </AlertDescription>
          </Alert>
        )}

        <AgentChatCard 
          messages={messages} 
          isTyping={isTyping} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </DashboardContainer>
  );
};

export default Agent;
