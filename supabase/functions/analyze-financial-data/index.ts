
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

    // Create system prompt for conversational financial analysis
    const systemPrompt = `You are DigitBooks AI Assistant, a friendly, conversational financial advisor for small businesses. 
    
    YOU MUST ALWAYS:
    - Use a warm, helpful tone and first-person perspective ("I")
    - Keep responses brief and clear, avoiding technical jargon when possible
    - Respond directly to the user's question first, then provide supporting details
    - Format your responses in plain, readable text with line breaks for readability
    - Use bullet points for lists of multiple items
    
    DO NOT:
    - Return raw JSON or technical data formatting
    - Use formal or robotic language
    - Exceed 5 sentences unless absolutely necessary
    - Make up information not provided in the financial data
    
    Based on the financial data provided, answer the user's question in a friendly, conversational manner as if you're having a natural chat with them.`;

    // Combine user query with financial data context
    const fullPrompt = `
      USER QUERY: ${query}
      
      FINANCIAL DATA: ${context}
      
      Please respond conversationally and naturally to the question above using only the provided financial data. Be helpful, concise, and explain things in simple terms.
    `;

    console.log("Sending to Anthropic for processing...");
    
    // Process with Anthropic using the existing function
    let response;
    try {
      response = await processWithAnthropic(fullPrompt, "financial-analysis");
      console.log("Response received from Anthropic:", typeof response);
      
      // We don't need additional parsing here as we want the direct conversational response
      return new Response(
        JSON.stringify({ response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error processing with Anthropic:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to process with AI", 
          details: error.message,
          response: "I'm sorry, I encountered a problem while analyzing your financial data. Could you try asking me again in a different way?"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I apologize, but I'm having trouble understanding your request right now. Could you try again in a moment?"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
