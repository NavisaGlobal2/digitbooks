
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
    const { query, context, userId, formatAsHuman } = await req.json();

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
    
    When discussing finances:
    - If provided financial data exists, use it to provide accurate insights
    - If asked about financial data that doesn't exist in the context, politely explain you don't have that information
    - Never make up financial data or numbers
    - Offer actionable advice when appropriate
    
    DO NOT:
    - Return JSON or formatted data unless specifically asked
    - Use formal, stiff language or jargon
    - Give overly detailed responses unless asked for details
    
    If the user's message isn't about finances, you can still chat normally about general topics, give advice, or just be friendly. If you don't know something, it's fine to say so.
    
    Your goal is to be helpful and engaging, making the conversation feel natural and enjoyable.`;

    // Combine user query with financial data context
    let fullPrompt = `
      USER MESSAGE: ${query}
      
      ${context ? `FINANCIAL CONTEXT: ${context}` : "No specific financial data available for this query."}
      
      Please respond conversationally as if you're having a natural chat. Be helpful, friendly, and personable.
    `;

    console.log("Processing with AI...");
    
    // For this example, we'll generate appropriate responses based on the query
    let aiResponse = generateResponse(query, context);
    
    // Return the conversational response
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

function generateResponse(query: string, context?: string): string {
  // Check if it's a financial query with context
  if (context && isFinancialQuery(query)) {
    // Generate a response based on the financial data in the context
    return generateFinancialResponse(query, context);
  }
  
  // Handle general conversations and greetings
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("hello") || lowerQuery.includes("hi ") || lowerQuery === "hi") {
    return "Hello there! It's great to chat with you today. How can I help you with your finances or anything else on your mind?";
  }
  
  if (lowerQuery.includes("how are you")) {
    return "I'm doing great, thanks for asking! I'm here and ready to help with any questions you might have about your finances or anything else. How are you doing today?";
  }
  
  if (lowerQuery.includes("thank")) {
    return "You're very welcome! I'm always happy to help. Is there anything else you'd like to know?";
  }
  
  if (lowerQuery.includes("bye") || lowerQuery.includes("goodbye")) {
    return "It was nice chatting with you! Feel free to come back anytime you have questions or just want to chat. Have a great day!";
  }
  
  // For other general queries
  return "That's an interesting topic! I can chat about lots of things, but I'm especially knowledgeable about financial matters. Is there something specific about your finances you'd like to know more about?";
}

function isFinancialQuery(query: string): boolean {
  const financialKeywords = [
    "revenue", "sales", "income", "money", "profit", "loss", 
    "expense", "spend", "cost", "budget", "financial", "finance",
    "account", "invoice", "cash", "payment", "transaction", "tax",
    "dollar", "euro", "pound", "currency", "bank", "debt", "credit",
    "roi", "margin", "equity", "asset", "liability", "balance"
  ];
  
  const lowerQuery = query.toLowerCase();
  return financialKeywords.some(keyword => lowerQuery.includes(keyword));
}

function generateFinancialResponse(query: string, contextString: string): string {
  try {
    // Parse the financial context if it exists
    let context;
    try {
      context = JSON.parse(contextString);
    } catch (e) {
      // If parsing fails, use the raw string
      context = contextString;
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Example responses based on different financial query types
    if (lowerQuery.includes("revenue") || lowerQuery.includes("sales")) {
      if (context.financialData?.revenues) {
        const totalRevenue = context.financialData.revenues.total || 0;
        return `Based on the data I have, your total revenue is ${formatCurrency(totalRevenue)}. Is there anything specific about your revenue you'd like to know more about?`;
      }
    }
    
    if (lowerQuery.includes("expense")) {
      if (context.financialData?.expenses) {
        const totalExpenses = context.financialData.expenses.total || 0;
        return `Looking at your records, your total expenses amount to ${formatCurrency(totalExpenses)}. Would you like to see a breakdown by category?`;
      }
    }
    
    if (lowerQuery.includes("profit") || lowerQuery.includes("margin")) {
      if (context.financialData?.revenues && context.financialData?.expenses) {
        const revenue = context.financialData.revenues.total || 0;
        const expenses = context.financialData.expenses.total || 0;
        const profit = revenue - expenses;
        return `Based on your data, your net profit is ${formatCurrency(profit)}. That's the difference between your revenue (${formatCurrency(revenue)}) and your expenses (${formatCurrency(expenses)}).`;
      }
    }
    
    if (lowerQuery.includes("cashflow")) {
      if (context.financialData?.cashflow) {
        const netCashflow = context.financialData.cashflow.netCashflow || 0;
        const trend = context.financialData.cashflow.trend || "stable";
        return `Your current net cashflow is ${formatCurrency(netCashflow)}, and the trend is ${trend}. Would you like more details on your cash flow?`;
      }
    }
    
    // Default response if we have financial data but no specific match
    return "I have some financial data available, but I'm not sure about the specific information you're asking for. Could you clarify what financial aspect you'd like to know about?";
    
  } catch (error) {
    console.error("Error generating financial response:", error);
    return "I'd be happy to help with your financial question, but I'm having trouble processing the data right now. Could we try a different question?";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
