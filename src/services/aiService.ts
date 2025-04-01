
import { supabase } from '@/integrations/supabase/client';

// Types for AI service
interface AIQueryParams {
  query: string;
  financialData: any;
  userId: string;
  formatAsHuman?: boolean;
}

interface EmbeddingResult {
  success: boolean;
  error?: string;
}

/**
 * Main function to get AI insights based on user queries and financial data
 */
export const getAIInsights = async ({ query, financialData, userId, formatAsHuman = true }: AIQueryParams): Promise<string> => {
  try {
    // Prepare context with financial data if it exists
    const context = prepareQueryContext(query, financialData);
    
    // Log request details for debugging
    logRequestDetails(query, context, financialData);

    // Call the Edge Function to process the query
    const response = await callAnalysisFunction(query, context, userId, formatAsHuman);
    
    // Return the conversational response
    return response.data.response;
  } catch (err) {
    console.error("AI service error:", err);
    throw new Error('Sorry, I encountered an issue while processing your message. Let\'s try talking about something else?');
  }
};

/**
 * Prepares the context object for the AI query
 */
function prepareQueryContext(query: string, financialData: any): string {
  if (!financialData || Object.keys(financialData).length === 0) {
    return "";
  }
  
  // Create a context with the user's financial data
  return JSON.stringify({
    query,
    financialData,
  });
}

/**
 * Logs request information for debugging purposes
 */
function logRequestDetails(query: string, context: string, financialData: any): void {
  console.log("Sending query to AI:", query);
  console.log("With context size:", context.length);
  console.log("Financial data:", financialData ? 
    `${Object.keys(financialData).length} categories available` : 
    "No financial data available");
  
  // Log specific revenue data if available
  if (financialData && financialData.totalRevenue !== undefined) {
    console.log("Revenue data available:", financialData.totalRevenue);
  }
}

/**
 * Calls the analyze-financial-data edge function
 */
async function callAnalysisFunction(
  query: string, 
  context: string, 
  userId: string, 
  formatAsHuman: boolean
) {
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
  return { data };
}

/**
 * Generates embeddings for financial data and stores them
 */
export async function generateEmbeddings(financialData: any, userId: string): Promise<EmbeddingResult> {
  try {
    // Call the embedding generation edge function
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: { financialData, userId }
    });
    
    if (error) {
      console.error("Error generating embeddings:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Embeddings generated successfully");
    return { success: true };
  } catch (err: any) {
    console.error("Error in embedding generation:", err);
    return { success: false, error: err.message };
  }
}
