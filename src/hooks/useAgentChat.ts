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

  const formatAIResponse = (response: any): string => {
    // Check if response is a JSON array or object that needs parsing
    if (typeof response === 'string') {
      try {
        // Check if it's a JSON string (common pattern from the AI service)
        const parsed = JSON.parse(response);
        
        // If it's an array of transactions, format it nicely
        if (Array.isArray(parsed)) {
          return `I found the following transactions in your records:\n\n${parsed.map(item => 
            `- ${new Date(item.date).toLocaleDateString()}: ${item.description} - ${(Math.abs(item.amount)/100).toLocaleString('en-US', {style: 'currency', currency: 'USD'})} (${item.type})`
          ).join('\n')}`;
        }
        
        // If it's an object with specific fields, return a formatted message
        if (parsed && typeof parsed === 'object') {
          return JSON.stringify(parsed, null, 2);
        }
        
        // Otherwise return the parsed content as string
        return response;
      } catch (e) {
        // Not JSON, return as is
        return response;
      }
    } else if (response && typeof response === 'object') {
      // If it's already an object, stringify it nicely
      return JSON.stringify(response, null, 2);
    }
    
    // Fallback for unexpected formats
    return response ? response.toString() : "I couldn't analyze your financial data at the moment.";
  };

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
      
      // Format the AI response to be human-readable
      const formattedResponse = formatAIResponse(response);

      // Add AI message with formatted response
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: formattedResponse,
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
