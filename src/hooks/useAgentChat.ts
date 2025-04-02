
import { useState, useEffect } from "react";
import { Message } from "@/types/agent";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useFinancialInsights } from "@/hooks/useFinancialInsights";
import { toast } from "sonner";

const initialMessages: Message[] = [
  {
    id: "welcome",
    content: "Hi there! I'm your DigitBooks AI Assistant. I can help with your finances, or we can just chat about anything. What's on your mind today?",
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
      toast.error("Please sign in to continue our conversation");
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
      // Prepare conversation history for context (excluding the welcome message)
      const conversationHistory = messages
        .filter(msg => msg.id !== "welcome")
        .map(msg => ({
          content: msg.content,
          sender: msg.sender
        }));
      
      // Ensure minimum typing time for UX
      const minTypingTime = 1500;
      const startTime = Date.now();
      
      console.log("Sending query to Anthropic with financial data context");
      
      // Call our edge function with the user's message and financial data
      const { data, error } = await supabase.functions.invoke('chat-with-anthropic', {
        body: {
          query: input,
          financialData: financialData || {},
          conversationHistory: conversationHistory
        },
      });

      if (error) {
        console.error("Error calling Anthropic:", error);
        throw new Error(error.message || "Failed to get response from assistant");
      }

      // Ensure typing indicator shows for at least the minimum time for better UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minTypingTime) {
        await new Promise(resolve => setTimeout(resolve, minTypingTime - elapsedTime));
      }

      // Add AI response message
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: data.response || "I'm sorry, I couldn't process that message properly.",
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error in conversation:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        content: "Sorry, I couldn't process that message right now. Let's try talking about something else?",
        sender: "agent",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Connection issue with the assistant");
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages(initialMessages);
    toast.success("Let's start a fresh conversation!");
  };

  return {
    messages,
    isTyping,
    handleSendMessage,
    resetChat,
    isLoadingFinancialData
  };
};
