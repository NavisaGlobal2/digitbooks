
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { query, context, userId, preferredProvider, formatAsHuman } = await req.json();

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

    console.log("Processing with AI...");
    
    // For this example, we'll use a simple response mechanism
    // In production you'd connect to an actual AI model API like Anthropic or OpenAI
    let aiResponse;
    try {
      // Simple logic to generate responses for testing
      if (query.toLowerCase().includes("how are you")) {
        aiResponse = "I'm doing great, thanks for asking! I'm here and ready to chat or help with any financial questions you might have. How about you? How's your day going?";
      } else if (query.toLowerCase().includes("hello") || query.toLowerCase().includes("hi")) {
        aiResponse = "Hello there! It's nice to chat with you today. Is there something specific you'd like to talk about, or do you have any questions about your finances?";
      } else if (context && context.length > 0) {
        aiResponse = "I've looked at your financial data and can help answer questions about it. What specifically would you like to know about your finances?";
      } else {
        aiResponse = "That's an interesting topic! I'm here to chat about anything, though I'm especially knowledgeable about financial matters. What would you like to know more about?";
      }
      
      // Return the conversational response
      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error processing with AI:", error);
      
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
