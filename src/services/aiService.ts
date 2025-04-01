
import { supabase } from '@/integrations/supabase/client';

interface AIQueryParams {
  query: string;
  financialData: any;
  userId: string;
  formatAsHuman?: boolean;
}

export const getAIInsights = async ({ query, financialData, userId, formatAsHuman = true }: AIQueryParams) => {
  try {
    // Generate embeddings for the financial data if it exists
    let context = "";
    if (financialData && Object.keys(financialData).length > 0) {
      // First, generate and potentially store embeddings
      await generateEmbeddings(financialData, userId);
      
      // Create a context with the user's financial data
      context = JSON.stringify({
        query,
        financialData,
      });
    }

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
    throw new Error('Sorry, I encountered an issue while processing your message. Let\'s try talking about something else?');
  }
};

// Function to generate embeddings for financial data
async function generateEmbeddings(financialData: any, userId: string) {
  try {
    // Call the embedding generation edge function
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: { financialData, userId }
    });
    
    if (error) {
      console.error("Error generating embeddings:", error);
      return false;
    }
    
    console.log("Embeddings generated successfully");
    return true;
  } catch (err) {
    console.error("Error in embedding generation:", err);
    return false;
  }
}
