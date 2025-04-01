
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
    - NEVER respond with "I'm not sure about the specific information you're asking for"
    
    If the user's message isn't about finances, you can still chat normally about general topics, give advice, or just be friendly. If you don't know something, it's fine to say so.
    
    Your goal is to be helpful and engaging, making the conversation feel natural and enjoyable.`;

    // Generate embeddings for the query to improve matching
    const queryEmbeddingsResponse = await generateQueryEmbedding(query);
    
    // Extract the financial data with the best semantic match if available
    let enhancedContext = context;
    if (context && queryEmbeddingsResponse.success) {
      enhancedContext = await enhanceContextWithEmbeddings(context, queryEmbeddingsResponse.embedding);
    }

    let financialData = null;
    if (enhancedContext) {
      try {
        const contextObj = JSON.parse(enhancedContext);
        if (contextObj.financialData) {
          financialData = contextObj.financialData;
        }
      } catch (e) {
        console.error("Error parsing context:", e);
      }
    }

    // Generate response based on query and financial data
    let aiResponse = generateResponseWithFinancialData(query, financialData);
    
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

// Function to generate embeddings for user queries
async function generateQueryEmbedding(query: string): Promise<{ success: boolean, embedding?: number[] }> {
  try {
    // In a production environment, you would call an embedding API like OpenAI
    // For now, we'll use a simplified cosine similarity based on key terms
    return {
      success: true,
      embedding: generateSimpleEmbedding(query)
    };
  } catch (error) {
    console.error("Error generating query embedding:", error);
    return { success: false };
  }
}

// Generate a simple term-based embedding vector
function generateSimpleEmbedding(text: string): number[] {
  // This is a simplified version - in production use a real embedding API
  const financialKeywords = [
    "revenue", "sales", "income", "money", "profit", "loss", 
    "expense", "spend", "cost", "budget", "financial", "finance",
    "account", "invoice", "cash", "payment", "transaction", "tax",
    "naira", "currency", "bank", "debt", "credit",
    "roi", "margin", "equity", "asset", "liability", "balance",
    "total", "quarterly", "monthly", "annual", "increase", "decrease",
    "trend", "projection", "forecast", "actual", "target", "goal",
    "category", "vendor", "client", "customer", "paid", "unpaid"
  ];
  
  const lowerText = text.toLowerCase();
  // Create a simple embedding based on keyword presence
  return financialKeywords.map(keyword => lowerText.includes(keyword) ? 1 : 0);
}

// Enhance the context using embeddings to find the most relevant data
async function enhanceContextWithEmbeddings(contextString: string, queryEmbedding: number[]): Promise<string> {
  try {
    // Parse the financial context if it exists
    let context;
    try {
      context = JSON.parse(contextString);
    } catch (e) {
      // If parsing fails, use the raw string
      return contextString;
    }
    
    // In a real implementation, you would retrieve the most semantically similar data
    // from your vector database based on the embedding.
    // For now, we'll just return the filtered context
    
    // Sample implementation - extract only the most relevant sections
    if (context.financialData) {
      const relevance = calculateDataRelevance(context.financialData, queryEmbedding);
      
      // Create an enhanced context with the most relevant data sections
      const enhancedData = {
        query: context.query,
        financialData: extractMostRelevantData(context.financialData, relevance)
      };
      
      return JSON.stringify(enhancedData);
    }
    
    return contextString;
  } catch (error) {
    console.error("Error enhancing context:", error);
    return contextString;
  }
}

// Calculate relevance scores for data sections
function calculateDataRelevance(financialData: any, queryEmbedding: number[]): Record<string, number> {
  const relevance: Record<string, number> = {};
  
  // For each main data section, generate a simple embedding and calculate similarity
  for (const section in financialData) {
    const sectionText = JSON.stringify(financialData[section]).toLowerCase();
    const sectionEmbedding = generateSimpleEmbedding(sectionText);
    
    // Calculate cosine similarity
    relevance[section] = cosineSimilarity(queryEmbedding, sectionEmbedding);
  }
  
  return relevance;
}

// Simple cosine similarity implementation
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract the most relevant data sections based on relevance scores
function extractMostRelevantData(financialData: any, relevance: Record<string, number>) {
  const threshold = 0.1; // Minimum relevance threshold
  const relevantData: any = {};
  
  for (const section in relevance) {
    if (relevance[section] > threshold && financialData[section]) {
      relevantData[section] = financialData[section];
    }
  }
  
  // If nothing meets the threshold, return the highest scoring section
  if (Object.keys(relevantData).length === 0) {
    const highestSection = Object.keys(relevance).reduce((a, b) => 
      relevance[a] > relevance[b] ? a : b
    );
    
    if (highestSection && financialData[highestSection]) {
      relevantData[highestSection] = financialData[highestSection];
    }
  }
  
  return relevantData;
}

function generateResponseWithFinancialData(query: string, financialData: any): string {
  const lowerQuery = query.toLowerCase();
  
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
    
    if (lowerQuery.includes("data") || lowerQuery.includes("available") || lowerQuery.includes("information")) {
      return "I can provide insights about your expenses, revenues, invoices, and overall financial health. Just ask me specific questions like 'What are my total expenses?', 'How much revenue did I generate?', or 'What's my profit?'";
    }
    
    // For other general queries
    return "That's an interesting topic! I can provide insights about your expenses, revenues, invoices, and cashflow. What specific financial information would you like to know?";
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
  
  // Handle invoice-related queries
  if (lowerQuery.includes("invoice") || lowerQuery.includes("bill") || lowerQuery.includes("payment")) {
    if (financialData.invoices) {
      const totalInvoices = financialData.invoices.total || 0;
      const paidInvoices = financialData.invoices.paid || 0;
      const unpaidInvoices = financialData.invoices.unpaid || 0;
      const overdueInvoices = financialData.invoices.overdue || 0;
      
      let response = `You have ${totalInvoices} total invoices, with ${paidInvoices} paid and ${unpaidInvoices} unpaid. `;
      
      if (overdueInvoices > 0) {
        response += `There are ${overdueInvoices} overdue invoices that require attention. `;
      }
      
      if (financialData.invoices.recentPayments && financialData.invoices.recentPayments.length > 0) {
        const latestPayment = financialData.invoices.recentPayments[0];
        response += `Your most recent payment was ${formatCurrency(latestPayment.amount)} received on ${formatDate(new Date(latestPayment.payment_date))}.`;
      }
      
      return response;
    }
    return "I don't have detailed invoice information in my current data. Would you like me to explain how to manage invoices in DigitBooks?";
  }
  
  // Handle cashflow-related queries
  if (lowerQuery.includes("cashflow") || lowerQuery.includes("cash flow") || lowerQuery.includes("cash")) {
    if (financialData.cashflow) {
      const netCashflow = financialData.cashflow.netCashflow || 0;
      const trend = financialData.cashflow.trend || "stable";
      
      let trendDescription = "";
      if (trend === "positive") trendDescription = "improving";
      else if (trend === "negative") trendDescription = "declining";
      else trendDescription = "stable";
      
      return `Your current net cashflow is ${formatCurrency(netCashflow)}, and the trend is ${trendDescription}. ${getFinancialAdvice(netCashflow, trend)}`;
    }
    return "I don't have detailed cashflow information in my current data. Would you like me to explain how to track cashflow in DigitBooks?";
  }
  
  // If nothing specific matches, provide a summary
  if (financialData.revenues || financialData.expenses) {
    const revenue = financialData.revenues?.total || 0;
    const expenses = financialData.expenses?.total || 0;
    const cashflow = revenue - expenses;
    
    return `Based on the available data, I can see: Revenue: ${formatCurrency(revenue)}, Expenses: ${formatCurrency(expenses)}, Net Cashflow: ${formatCurrency(cashflow)}. What specific aspect would you like to know more about?`;
  }
  
  return "I have your financial data, but I'm not sure what specific information you're looking for. You can ask me about your expenses, revenue, profit, invoices, or cashflow.";
}

function getFinancialAdvice(netCashflow: number, trend: string): string {
  if (netCashflow > 0 && trend === "positive") {
    return "You're in a strong financial position. Consider investing surplus cash or expanding your business.";
  } else if (netCashflow > 0 && trend === "negative") {
    return "While your cashflow is positive, the downward trend suggests you should monitor expenses carefully.";
  } else if (netCashflow < 0 && trend === "negative") {
    return "Your negative cashflow is concerning. Consider reducing expenses or increasing revenue sources.";
  } else if (netCashflow < 0 && trend === "positive") {
    return "Your cashflow is improving, but still negative. Continue your current strategy to reach positive territory.";
  } else {
    return "Your cashflow appears stable. Regular monitoring will help maintain this balance.";
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NG', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
}
