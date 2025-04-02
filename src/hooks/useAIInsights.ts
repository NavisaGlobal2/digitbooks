
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialInsights } from "@/hooks/useFinancialInsights";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface AIInsight {
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { financialData } = useFinancialInsights();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateInsights = async (forceRefresh = false) => {
    if (!user?.id) {
      console.log("No user found, skipping insights generation");
      setIsLoading(false);
      return;
    }
    
    if (!financialData) {
      console.log("No financial data available, skipping insights generation");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get insights from local storage to avoid unnecessary API calls
      const cachedInsights = localStorage.getItem('aiInsights');
      const cachedTimestamp = localStorage.getItem('aiInsightsTimestamp');
      const now = new Date().getTime();
      
      // Use cached insights if they're less than 1 hour old and not forcing refresh
      if (!forceRefresh && cachedInsights && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 3600000) {
        console.log("Using cached insights from local storage");
        setInsights(JSON.parse(cachedInsights));
        setIsLoading(false);
        return;
      }
      
      console.log("Calling edge function to generate insights");
      // Call the Supabase edge function to generate insights
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { financialData },
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to connect to AI service");
      }
      
      if (data?.insights && Array.isArray(data.insights)) {
        console.log("Received insights from edge function:", data.insights);
        setInsights(data.insights);
        
        // Cache the insights
        localStorage.setItem('aiInsights', JSON.stringify(data.insights));
        localStorage.setItem('aiInsightsTimestamp', now.toString());
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (err: any) {
      console.error("Error generating AI insights:", err);
      setError(err.message || 'Failed to generate insights');
      
      // Use default insights as fallback if API call fails
      console.log("Using fallback insights");
      setInsights([
        {
          message: "Revenue increased by 15% this month.",
          type: "success"
        },
        {
          message: "Expenses are up 20% compared to last month.",
          type: "error"
        },
        {
          message: "Your cash flow is negative; consider reducing expenses.",
          type: "error"
        },
        {
          message: "Net profit margin dropped from 30% to 22%.",
          type: "warning"
        },
        {
          message: "You spent 10% more on software—review subscriptions.",
          type: "warning"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, [user, financialData]);

  // Function to manually refresh insights
  const refreshInsights = async () => {
    // Prevent concurrent refreshes
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Clear cached insights
    localStorage.removeItem('aiInsights');
    localStorage.removeItem('aiInsightsTimestamp');
    
    // Show refreshing toast
    toast.info("Refreshing insights...");
    
    // Trigger regeneration with force refresh
    await generateInsights(true);
    
    // Success toast if no error
    if (!error) {
      toast.success("Insights updated successfully!");
    } else {
      toast.error("Failed to update insights: " + error);
    }
    
    setIsRefreshing(false);
  };

  return { insights, isLoading, error, refreshInsights, isRefreshing };
};
