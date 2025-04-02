
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get API key from environment variable
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract request data
    const { query, financialData, conversationHistory } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing query with Anthropic:", query.substring(0, 50) + "...");
    console.log("Financial data available:", financialData ? Object.keys(financialData).length : 0, "categories");
    
    // Prepare system prompt
    let systemPrompt = `You are DigitBooks AI Assistant, a friendly, conversational financial advisor and chatbot.
    
    YOU MUST ALWAYS:
    - Use a warm, friendly tone like you're chatting with a friend
    - Speak in first-person perspective ("I")
    - Keep responses brief and conversational
    - Respond directly to the question or comment first
    - Format your responses in natural, readable text
    - When formatting currency, ALWAYS use Naira (₦) as the currency symbol, NEVER dollars ($)
    - When asked about specific financial data, ALWAYS provide actual numbers from the provided financial context
    
    When discussing finances:
    - If provided financial data exists, ALWAYS use it to provide accurate insights and numbers
    - If asked about financial data that doesn't exist in the context, politely explain you don't have that information
    - Never make up financial data or numbers
    - Offer actionable advice when appropriate
    
    DO NOT:
    - Return JSON or formatted data unless specifically asked
    - Use formal, stiff language or jargon
    - Give overly detailed responses unless asked for details
    - Never use $ symbol for currency, always use ₦ (Naira)
    
    If the user's message isn't about finances, you can still chat normally about general topics, give advice, or just be friendly. If you don't know something, it's fine to say so.
    
    Your goal is to be helpful and engaging, making the conversation feel natural and enjoyable.`;

    // Convert conversation history to message format
    const messages = [];
    
    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.sender === "user") {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.sender === "agent") {
          messages.push({ role: "assistant", content: msg.content });
        }
      }
    }

    // Format financial data for inclusion in the user query
    let financialContext = "";
    if (financialData && Object.keys(financialData).length > 0) {
      financialContext = `\n\nHere is the user's financial data:\n${JSON.stringify(financialData, null, 2)}`;
    }
    
    // Add the current query
    messages.push({ 
      role: "user", 
      content: query + financialContext 
    });

    // Call Anthropic API
    console.log("Calling Anthropic API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        system: systemPrompt,
        max_tokens: 1000,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Anthropic response received");

    // Return the chat response
    return new Response(
      JSON.stringify({ response: result.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in chat-with-anthropic function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Sorry, I encountered an issue processing your message. Let's try again?"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
