
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables for API keys
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

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

    // Extract financial data from context if available
    let financialData = null;
    if (context) {
      try {
        const contextObj = JSON.parse(context);
        if (contextObj.financialData) {
          financialData = contextObj.financialData;
        }
      } catch (e) {
        console.error("Error parsing context:", e);
      }
    }

    // Determine which AI provider to use
    const aiProvider = selectAIProvider();
    
    // If no AI providers are available, fall back to the rule-based system
    if (aiProvider.provider === "none") {
      const ruleBasedResponse = generateRuleBasedResponse(query, financialData);
      return new Response(
        JSON.stringify({ response: ruleBasedResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a hybrid response: use AI for reasoning but include financial data
    const response = await generateHybridResponse(query, financialData, aiProvider.provider);

    // Return the response
    return new Response(
      JSON.stringify({ response }),
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

// Function to select the AI provider based on available API keys
function selectAIProvider(): { provider: string; reason: string } {
  // Check available API keys
  const anthropicApiKey = ANTHROPIC_API_KEY;
  const deepseekApiKey = DEEPSEEK_API_KEY;
  
  // Log available providers
  const availableProviders = [];
  if (anthropicApiKey) availableProviders.push("Anthropic");
  if (deepseekApiKey) availableProviders.push("DeepSeek");
  
  console.log("Available providers: " + 
    (availableProviders.length > 0 ? availableProviders.join(", ") : "None")
  );

  // If no providers are available, return none
  if (!anthropicApiKey && !deepseekApiKey) {
    console.log("No AI service configured. Using rule-based system.");
    return { provider: "none", reason: "no API keys configured" };
  }

  // Default provider selection logic
  if (anthropicApiKey) {
    console.log("Using Anthropic for AI responses (preferred)");
    return { provider: "anthropic", reason: "default" };
  } else if (deepseekApiKey) {
    console.log("Using DeepSeek for AI responses (fallback)");
    return { provider: "deepseek", reason: "available" };
  }
  
  // Fallback
  return { provider: "none", reason: "no valid provider" };
}

// Generate a response using the selected AI provider
async function generateHybridResponse(query: string, financialData: any, provider: string): Promise<string> {
  // Create a system prompt that includes financial knowledge and guidelines
  const systemPrompt = `You are DigitBooks AI Assistant, a friendly, conversational financial advisor and chatbot.
  
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

  // Format financial data for inclusion in the prompt
  let financialContext = "";
  if (financialData) {
    financialContext = `Here is the user's current financial information:
    ${JSON.stringify(financialData, null, 2)}
    
    Use this actual data when answering financial questions. Remember to format currency values in Naira (₦).`;
  } else {
    financialContext = "Note: The user doesn't have any financial data available at the moment.";
  }

  // Prepare the user prompt with financial context
  const userPrompt = `${query}\n\n${financialContext}`;

  // Call the appropriate AI provider
  if (provider === "anthropic") {
    return await callAnthropic(systemPrompt, userPrompt);
  } else if (provider === "deepseek") {
    return await callDeepSeek(systemPrompt, userPrompt);
  } else {
    // Fallback to rule-based system
    return generateRuleBasedResponse(query, financialData);
  }
}

// Call Anthropic API (Claude)
async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    console.log("Calling Anthropic API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Anthropic response received");
    return result.content[0].text;
  } catch (error) {
    console.error("Error calling Anthropic:", error);
    throw error;
  }
}

// Call DeepSeek API
async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    console.log("Calling DeepSeek API...");
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("DeepSeek response received");
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek:", error);
    throw error;
  }
}

// The rule-based response generator (fallback method)
function generateRuleBasedResponse(query: string, financialData: any): string {
  const lowerQuery = query.toLowerCase();
  
  // Handle general queries about available data
  if (lowerQuery.includes("what data") || lowerQuery.includes("avai") || lowerQuery.includes("have available")) {
    if (financialData) {
      let availableDataTypes = Object.keys(financialData).join(", ");
      return `I have information about your ${availableDataTypes}. You can ask me specific questions about any of these areas like "What's my total expenses?" or "Show me my revenue breakdown."`;
    }
    return "I can provide insights about your expenses, revenues, invoices, and overall financial health. Just ask me specific questions like 'What are my total expenses?', 'How much revenue did I generate?', or 'What's my profit?'";
  }
  
  // Check if it's a financial query with data
  if (!financialData) {
    // Handle general conversations and greetings
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
    return "That's an interesting topic! I can provide insights about your expenses, revenues, invoices, and cashflow when you connect your financial data. What would you like to know?";
  }
  
  // Handle expense-related queries
  if (lowerQuery.includes("expense") || lowerQuery.includes("spending") || lowerQuery.includes("cost")) {
    if (financialData.expenses) {
      const totalExpenses = financialData.expenses.total || 0;
      let response = `Your total expenses are ${formatCurrency(totalExpenses)}. `;
      
      // Add expense breakdown if available
      if (financialData.expenses.byCategory && Object.keys(financialData.expenses.byCategory).length > 0) {
        response += "Here's a breakdown by category:\n";
        const categories = Object.entries(financialData.expenses.byCategory)
          .sort(([, amountA]: any, [, amountB]: any) => amountB - amountA)
          .slice(0, 3);
        
        categories.forEach(([category, amount]: [string, any]) => {
          response += `- ${category}: ${formatCurrency(amount)}\n`;
        });
        
        if (Object.keys(financialData.expenses.byCategory).length > 3) {
          response += "...and other smaller categories.";
        }
      }
      
      return response;
    }
    return "I don't have detailed expense information in my current data. Would you like me to explain how to track expenses in DigitBooks?";
  }
  
  // Handle revenue-related queries
  if (lowerQuery.includes("revenue") || lowerQuery.includes("income") || lowerQuery.includes("earnings") || lowerQuery.includes("sales")) {
    if (financialData.revenues) {
      const totalRevenue = financialData.revenues.total || 0;
      let response = `Your total revenue is ${formatCurrency(totalRevenue)}. `;
      
      // Add revenue sources breakdown if available
      if (financialData.revenues.bySources && Object.keys(financialData.revenues.bySources).length > 0) {
        response += "Here's a breakdown by source:\n";
        const sources = Object.entries(financialData.revenues.bySources)
          .sort(([, amountA]: any, [, amountB]: any) => amountB - amountA)
          .slice(0, 3);
        
        sources.forEach(([source, amount]: [string, any]) => {
          response += `- ${source}: ${formatCurrency(amount)}\n`;
        });
        
        if (Object.keys(financialData.revenues.bySources).length > 3) {
          response += "...and other sources.";
        }
      }
      
      return response;
    }
    return "I don't have detailed revenue information in my current data. Would you like me to explain how to track revenues in DigitBooks?";
  }
  
  // Handle profit-related queries
  if (lowerQuery.includes("profit") || lowerQuery.includes("margin") || lowerQuery.includes("earnings")) {
    const revenue = financialData.revenues?.total || 0;
    const expenses = financialData.expenses?.total || 0;
    
    if (revenue > 0 || expenses > 0) {
      const profit = revenue - expenses;
      const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
      
      let status = "breaking even";
      if (profit > 0) status = "profitable";
      if (profit < 0) status = "operating at a loss";
      
      return `Based on the available data, your business is ${status}. Your revenue is ${formatCurrency(revenue)} and expenses are ${formatCurrency(expenses)}, giving you a net profit of ${formatCurrency(profit)} (${profitMargin}% margin).`;
    }
    
    return "I don't have enough revenue and expense data to calculate your profit accurately. Would you like me to explain how to track your full financial picture in DigitBooks?";
  }
  
  // Handle other financial queries with more generic responses
  if (financialData.revenues || financialData.expenses) {
    const revenue = financialData.revenues?.total || 0;
    const expenses = financialData.expenses?.total || 0;
    const cashflow = revenue - expenses;
    
    return `Based on the available data, I can see: Revenue: ${formatCurrency(revenue)}, Expenses: ${formatCurrency(expenses)}, Net Cashflow: ${formatCurrency(cashflow)}. What specific aspect would you like to know more about?`;
  }
  
  return "I have your financial data, but I'm not sure what specific information you're looking for. You can ask me about your expenses, revenue, profit, invoices, or cashflow.";
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
}
