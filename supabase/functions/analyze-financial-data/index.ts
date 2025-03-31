
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
    console.log("Context length:", context ? context.length : 0);

    // Create system prompt for a more conversational chatbot experience
    const systemPrompt = `You are DigitBooks AI Assistant, a friendly, conversational financial advisor and chatbot. 
    
    YOU MUST ALWAYS:
    - Use a warm, friendly tone like you're chatting with a friend
    - Speak in first-person perspective ("I")
    - Keep responses brief and conversational
    - Respond directly to the question or comment first
    - Format your responses in natural, readable text
    
    DO NOT:
    - Return JSON or formatted data unless specifically asked
    - Use formal, stiff language or jargon
    - Give overly detailed responses unless asked for details
    - Make up information not provided in the context
    
    If the user's message isn't about finances or the provided data, you can still chat normally about general topics, give advice, or just be friendly. If you don't know something, it's fine to say so.
    
    Your goal is to be helpful and engaging, making the conversation feel natural and enjoyable.`;

    // Combine user query with financial data context
    let fullPrompt = `
      USER MESSAGE: ${query}
      
      CONTEXT: ${context || "No specific financial data available for this query."}
      
      Please respond conversationally as if you're having a natural chat. Be helpful, friendly, and personable.
    `;

    console.log("Sending to Anthropic for processing...");
    
    // Process with Anthropic using the existing function
    let response;
    try {
      response = await processWithAnthropic(fullPrompt, "financial-analysis");
      console.log("Response received from Anthropic:", typeof response);
      
      // Return the conversational response
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
          response: "I'm sorry, I couldn't process your message right now. What else would you like to chat about?"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Sorry about that! I encountered a hiccup. Can we try again with a different question?"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
