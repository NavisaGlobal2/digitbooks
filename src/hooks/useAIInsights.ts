
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

  useEffect(() => {
    const generateInsights = async () => {
      if (!user?.id || !financialData) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First try to get insights from local storage to avoid unnecessary API calls
        const cachedInsights = localStorage.getItem('aiInsights');
        const cachedTimestamp = localStorage.getItem('aiInsightsTimestamp');
        const now = new Date().getTime();
        
        // Use cached insights if they're less than 1 hour old
        if (cachedInsights && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 3600000) {
          setInsights(JSON.parse(cachedInsights));
          setIsLoading(false);
          return;
        }
        
        // Call the Supabase edge function to generate insights
        const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
          body: { financialData },
        });
        
        if (error) throw error;
        
        if (data?.insights && Array.isArray(data.insights)) {
          setInsights(data.insights);
          
          // Cache the insights
          localStorage.setItem('aiInsights', JSON.stringify(data.insights));
          localStorage.setItem('aiInsightsTimestamp', now.toString());
        } else {
          throw new Error('Invalid response format from AI service');
        }
      } catch (err: any) {
        console.error("Error generating AI insights:", err);
        setError(err.message || 'Failed to generate insights');
        
        // Use default insights as fallback if API call fails
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

    generateInsights();
  }, [user, financialData]);

  // Function to manually refresh insights
  const refreshInsights = async () => {
    // Clear cached insights
    localStorage.removeItem('aiInsights');
    localStorage.removeItem('aiInsightsTimestamp');
    
    // Show refreshing toast
    toast.info("Refreshing insights...");
    
    // Trigger regeneration
    setIsLoading(true);
    
    try {
      if (!user?.id || !financialData) {
        throw new Error("Missing user or financial data");
      }
      
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { financialData },
      });
      
      if (error) throw error;
      
      if (data?.insights && Array.isArray(data.insights)) {
        setInsights(data.insights);
        
        // Cache the insights
        localStorage.setItem('aiInsights', JSON.stringify(data.insights));
        localStorage.setItem('aiInsightsTimestamp', new Date().getTime().toString());
        
        toast.success("Insights updated successfully!");
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (err: any) {
      console.error("Error refreshing AI insights:", err);
      setError(err.message || 'Failed to refresh insights');
      toast.error("Failed to update insights. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return { insights, isLoading, error, refreshInsights };
};
