
import { useState } from "react";
import { Message } from "@/types/agent";
import { getAIInsights } from "@/services/aiService";
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
      // Only use financial data if it's a finance-related question
      const isFinanceQuestion = /financ|money|spend|earn|invoice|expense|budget|revenue|profit|loss|cashflow|payment|bill|transaction|report|account|balance|tax|dollar|cost/i.test(input);
      
      // Give the AI some time to "think" for a more natural feeling chat
      const minTypingTime = 1000; // 1 second minimum "thinking" time
      const startTime = Date.now();
      
      // Get AI response
      const response = await getAIInsights({
        query: input,
        financialData: isFinanceQuestion ? financialData : null,
        userId: user.id,
        formatAsHuman: true
      });

      // Ensure typing indicator shows for at least the minimum time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minTypingTime) {
        await new Promise(resolve => setTimeout(resolve, minTypingTime - elapsedTime));
      }

      // Add AI message
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: response,
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
  };
};
