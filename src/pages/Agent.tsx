
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import AgentHeader from "@/components/agent/AgentHeader";
import AgentChatCard from "@/components/agent/AgentChatCard";
import { useAgentChat } from "@/hooks/useAgentChat";

const Agent = () => {
  const { messages, isTyping, handleSendMessage, resetChat } = useAgentChat();

  return (
    <DashboardContainer>
      <div className="h-full flex flex-col">
        <AgentHeader onReset={resetChat} />
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
