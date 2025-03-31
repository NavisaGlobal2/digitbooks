
import { useState } from "react";
import { Message } from "@/types/agent";
import { getAIInsights } from "@/services/aiService";
import { useAuth } from "@/contexts/auth";
import { useFinancialInsights } from "@/hooks/useFinancialInsights";
import { toast } from "sonner";

const initialMessages: Message[] = [
  {
    id: "welcome",
    content: "Hello! I'm your DigitBooks AI Agent. How can I assist you with your financial data and analytics today?",
    sender: "agent",
    timestamp: new Date(),
  },
];

export const useAgentChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { financialData, isLoading: isLoadingFinancialData } = useFinancialInsights();

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;
    
    if (!user?.id) {
      toast.error("Please sign in to use the AI assistant");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // If financial data is still loading, inform the user
      if (isLoadingFinancialData) {
        setTimeout(() => {
          const loadingMessage: Message = {
            id: `${Date.now()}-loading`,
            content: "I'm still gathering your financial data. This will help me provide more accurate insights. Please ask your question again in a moment.",
            sender: "agent",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, loadingMessage]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      console.log("Sending query to AI:", input);
      console.log("With financial data:", financialData ? Object.keys(financialData).length : "none");

      // Get AI response using actual financial data
      const response = await getAIInsights({
        query: input,
        financialData,
        userId: user.id
      });

      console.log("Raw AI response:", response);

      // Add AI message - ensure we have a proper string response
      let responseContent = "";
      if (typeof response === 'string') {
        responseContent = response;
      } else if (response && typeof response === 'object') {
        responseContent = JSON.stringify(response);
      } else {
        responseContent = "I couldn't analyze your financial data at the moment. Please try again later.";
      }

      const agentMessage: Message = {
        id: Date.now().toString(),
        content: responseContent,
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
      toast.success("New insight from your financial agent");
    } catch (error) {
      console.error("Error getting AI insights:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        content: "I'm having trouble analyzing your financial data right now. Please try again later.",
        sender: "agent",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get financial insights");
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages(initialMessages);
    toast.success("Conversation has been reset");
  };

  return {
    messages,
    isTyping,
    handleSendMessage,
    resetChat,
  };
};
