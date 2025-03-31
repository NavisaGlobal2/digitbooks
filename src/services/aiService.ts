
import { supabase } from '@/integrations/supabase/client';

interface AIQueryParams {
  query: string;
  financialData: any;
  userId: string;
}

export const getAIInsights = async ({ query, financialData, userId }: AIQueryParams) => {
  try {
    // Create a context with the user's financial data
    const context = JSON.stringify({
      query,
      financialData,
    });

    // Call the Supabase Edge Function using the existing anthropicProcessor
    const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
      body: {
        query,
        context,
        userId,
        preferredProvider: 'anthropic'
      },
    });

    if (error) {
      console.error("Error calling AI service:", error);
      throw new Error('Failed to process your query');
    }

    return data.response;
  } catch (err) {
    console.error("AI service error:", err);
    throw err;
  }
};
