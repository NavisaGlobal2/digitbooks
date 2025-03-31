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
    // If it's already a string that doesn't look like JSON, return as is
    if (typeof response === 'string' && !response.trim().startsWith('{') && !response.trim().startsWith('[')) {
      return response;
    }
    
    // Handle JSON string responses
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        
        // If it's an array of transactions, format it into a human-readable message
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) {
            return "I couldn't find any transactions matching your criteria.";
          }
          
          return `I found ${parsed.length} transactions that might interest you:\n\n${parsed.slice(0, 5).map(item => 
            `• ${new Date(item.date).toLocaleDateString()}: ${item.description} - ${(Math.abs(item.amount)/100).toLocaleString('en-US', {style: 'currency', currency: 'USD'})} (${item.type === 'debit' ? 'expense' : 'income'})`
          ).join('\n')}${parsed.length > 5 ? `\n\n...and ${parsed.length - 5} more transactions.` : ''}`;
        }
        
        // If it's an object with summary data, convert to human-readable insights
        if (parsed && typeof parsed === 'object') {
          // If it's likely a response object with embedded message
          if (parsed.response && typeof parsed.response === 'string') {
            return parsed.response;
          }
          
          // For financial summaries
          if (parsed.total || parsed.average || parsed.summary) {
            let message = "Here's what I found in your financial data:\n\n";
            
            if (parsed.total) message += `Total: ${typeof parsed.total === 'number' ? parsed.total.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) : parsed.total}\n`;
            if (parsed.average) message += `Average: ${typeof parsed.average === 'number' ? parsed.average.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) : parsed.average}\n`;
            if (parsed.summary) message += `${parsed.summary}\n`;
            
            return message;
          }
          
          // Default object display as conversation
          return "Based on my analysis: " + Object.entries(parsed)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        }
        
        // Otherwise return the response as is
        return response;
      } catch (e) {
        // Not JSON, return as is
        return response;
      }
    } else if (response && typeof response === 'object') {
      // If it's an object with a response field, use that directly
      if (response.response && typeof response.response === 'string') {
        return response.response;
      }
      
      // Otherwise create a conversational summary
      return "Here's what I found: " + JSON.stringify(response, null, 0)
        .replace(/[{}"]/g, '')
        .replace(/,/g, ', ')
        .replace(/:/g, ': ');
    }
    
    // Fallback for unexpected formats
    return response ? response.toString() : "I'm sorry, but I couldn't analyze your financial data at the moment. Could you try asking me in a different way?";
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
