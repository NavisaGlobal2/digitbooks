
import { supabase } from '@/integrations/supabase/client';

interface AIQueryParams {
  query: string;
  financialData: any;
  userId: string;
  formatAsHuman?: boolean;
}

export const getAIInsights = async ({ query, financialData, userId, formatAsHuman = true }: AIQueryParams) => {
  try {
    // Create a context with the user's financial data or leave it minimal for general chat
    const context = financialData ? JSON.stringify({
      query,
      financialData,
    }) : "";

    console.log("Sending query to AI:", query);
    console.log("With context size:", context.length);

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-financial-data', {
      body: {
        query,
        context,
        userId,
        formatAsHuman,
      },
    });

    if (error) {
      console.error("Error calling AI service:", error);
      throw new Error('I had trouble processing your message. Can you try asking me in a different way?');
    }

    console.log("AI response received:", data);
    
    // Return the conversational response
    return data.response;
  } catch (err) {
    console.error("AI service error:", err);
    throw err;
  }
};
