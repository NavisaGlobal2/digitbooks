
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
    const { financialData, userId } = await req.json();

    if (!financialData || !userId) {
      return new Response(
        JSON.stringify({ error: 'Financial data and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing financial data for embedding generation");
    
    // Generate embeddings for each major section of financial data
    const embeddings = generateFinancialDataEmbeddings(financialData);
    
    // In a production environment, these embeddings would be stored in a vector database
    // For now, we'll just return them
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        embeddings,
        message: "Embeddings generated successfully"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Server error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        message: "Failed to generate embeddings"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFinancialDataEmbeddings(financialData: any) {
  const embeddingsMap: Record<string, number[]> = {};
  
  // For each major section in the financial data, generate embeddings
  for (const section in financialData) {
    if (typeof financialData[section] === 'object' && financialData[section] !== null) {
      const sectionText = JSON.stringify(financialData[section]);
      
      // In a production environment, we would use OpenAI or another embedding API
      // For this example, we'll use a simpler approach
      embeddingsMap[section] = generateSimpleEmbedding(sectionText);
    }
  }
  
  return embeddingsMap;
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
  
  // Create a simple embedding based on keyword presence and frequency
  const embedding = financialKeywords.map(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = lowerText.match(regex);
    return matches ? matches.length : 0;
  });
  
  // Normalize the embedding
  const sum = embedding.reduce((a, b) => a + b, 0);
  return sum === 0 ? embedding : embedding.map(val => val / sum);
}
