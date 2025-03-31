
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

    console.log("Sending query to AI:", query);
    console.log("With context size:", context.length);

    // Call the Supabase Edge Function using the existing anthropicProcessor
    const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
      body: {
        query,
        context,
        userId,
        preferredProvider: 'anthropic',
        formatAsHuman: true // Add hint to format response as human text
      },
    });

    if (error) {
      console.error("Error calling AI service:", error);
      throw new Error('Failed to process your query');
    }

    console.log("AI response received:", data);
    return data.response;
  } catch (err) {
    console.error("AI service error:", err);
    throw err;
  }
};
