
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processWithAnthropic } from "../parse-bank-statement-ai/lib/anthropicProcessor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context, userId, preferredProvider } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing AI query:", query);
    console.log("Context length:", context.length);

    // Create system prompt for financial analysis
    const systemPrompt = `You are DigitBooks AI Assistant, a financial advisor that specializes in analyzing accounting and financial data for small businesses. Based on the provided financial data, answer the user's question in a clear, concise, and professional manner. 
    
    Provide specific insights based ONLY on the data provided. If there isn't enough information to answer a question completely, acknowledge this and suggest what additional information might be helpful. Always back up your insights with numbers from the provided data.
    
    DO NOT make up information that isn't in the provided data. If you're uncertain about something, say so rather than guessing.
    
    RESPOND WITH PLAIN TEXT in a business professional tone. Be friendly but focus on the numbers and insights.`;

    // Combine user query with financial data context
    const fullPrompt = `
      USER QUERY: ${query}
      
      FINANCIAL DATA: ${context}
      
      Based on this data, provide a helpful analysis and answer to the user's query. Focus on key insights and actionable advice if appropriate.
    `;

    console.log("Sending to Anthropic for processing...");
    
    // Process with Anthropic using the existing function
    let response;
    try {
      response = await processWithAnthropic(fullPrompt, "financial-analysis");
      console.log("Response received from Anthropic:", typeof response);
      
      // Ensure we have a clean text response
      let cleanResponse;
      
      if (typeof response === 'string') {
        cleanResponse = response;
      } else if (typeof response === 'object') {
        // If it's an object, stringify it
        cleanResponse = JSON.stringify(response);
      } else {
        throw new Error("Unexpected response format from AI");
      }
      
      return new Response(
        JSON.stringify({ response: cleanResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error processing with Anthropic:", error);
      
      return new Response(
        JSON.stringify({ error: "Failed to process with AI", details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
