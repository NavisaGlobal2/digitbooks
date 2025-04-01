
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

    if (!financialData) {
      return new Response(
        JSON.stringify({ error: 'Financial data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing financial data for embedding generation`);

    // Create basic embeddings for each data category
    const embeddings: Record<string, number[]> = {};
    
    // Generate simple embeddings for each category of financial data
    for (const category in financialData) {
      const categoryData = financialData[category];
      if (categoryData) {
        // Convert the data to string and generate a simple embedding
        const dataString = JSON.stringify(categoryData);
        embeddings[category] = generateSimpleEmbedding(dataString);
      }
    }

    // In a production environment, store these embeddings in a vector database
    // For now, we'll just send back success
    console.log(`Generated embeddings for user ${userId} with ${Object.keys(financialData).length} data categories`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Embeddings generated successfully',
        // Include metadata about the embeddings
        metadata: {
          userId,
          categories: Object.keys(financialData),
          embeddingDimensions: Object.values(embeddings)[0]?.length || 0,
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate a simple embedding for a string
function generateSimpleEmbedding(text: string): number[] {
  // This is just a simple implementation for demonstration
  // In a production environment, you would use a real embedding API
  
  // Define some financial keywords to check against
  const keywords = [
    "expense", "revenue", "profit", "invoice", "payment",
    "cash", "transaction", "budget", "tax", "income",
    "deposit", "withdrawal", "balance", "credit", "debit",
    "account", "statement", "receipt", "vendor", "client",
    "sales", "purchase", "liability", "asset", "equity"
  ];
  
  // Convert text to lowercase for comparison
  const lowerText = text.toLowerCase();
  
  // Generate a simple embedding based on keyword presence
  const embedding = keywords.map(keyword => lowerText.includes(keyword) ? 1 : 0);
  
  return embedding;
}
