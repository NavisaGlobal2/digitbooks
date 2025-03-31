
/**
 * Process extracted text with DeepSeek API
 */
export async function processWithDeepseek(text: string, context?: string | null): Promise<any> {
  const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured. Please set up your DeepSeek API key in Supabase.");
  }

  console.log("Sending to DeepSeek for processing...");
  console.log(`Processing context: ${context || 'general'}`);
  
  // Enhanced system prompt with stronger emphasis on proper description formatting
  let systemPrompt = `You are a financial data extraction and formatting expert. Your task is to analyze raw bank statement data from various formats and output a clean, properly structured JSON array of transactions.`;
  
  if (context === "revenue") {
    systemPrompt += `
    
    For each transaction, meticulously extract:
    - date (in YYYY-MM-DD format)
    - description (ABSOLUTELY NEVER use placeholders like "Row 1", "Row 2", "Row 12", "Row 13", or any row-based identifiers - extract the actual transaction narrative)
    - amount (as a number, negative for debits/expenses, positive for credits/revenue)
    - type ("debit" or "credit")
    
    CRITICAL INSTRUCTIONS FOR DESCRIPTIONS:
    1. UNDER NO CIRCUMSTANCES output generic terms like "Row 1", "Row 2", "Row 12", "Row 13", "Row X" in place of descriptions
    2. Always extract the actual transaction narrative from the "REMARKS", "NARRATION", "PARTICULARS" or similar fields
    3. If no clear description exists, use merchant name, reference number, or any identifying information
    4. Combine relevant fields to create meaningful descriptions when necessary
    5. Remove any unnecessary prefixes, suffixes, or repetitive elements
    6. When descriptions appear as numbered rows, REPLACE them with actual descriptive content from other fields
    7. If no meaningful description can be found, use null or "" instead of any "Row X" placeholder
    
    IMPORTANT: Preserve all original fields in the preservedColumns property.
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`;
  } else {
    systemPrompt += `
    
    For each transaction, meticulously extract:
    - date (in YYYY-MM-DD format)
    - description (ABSOLUTELY NEVER use placeholders like "Row 1", "Row 2", "Row 12", "Row 13", or any row-based identifiers - extract the actual transaction narrative)
    - amount (as a number, negative for debits/expenses, positive for credits/revenue)
    - type ("debit" or "credit")
    
    CRITICAL INSTRUCTIONS FOR DESCRIPTIONS:
    1. UNDER NO CIRCUMSTANCES output generic terms like "Row 1", "Row 2", "Row 12", "Row 13", "Row X" in place of descriptions
    2. Always extract the actual transaction narrative from the "REMARKS", "NARRATION", "PARTICULARS" or similar fields
    3. If no clear description exists, use merchant name, reference number, or any identifying information
    4. Combine relevant fields to create meaningful descriptions when necessary
    5. Remove any unnecessary prefixes, suffixes, or repetitive elements
    6. When descriptions appear as numbered rows, REPLACE them with actual descriptive content from other fields
    7. If no meaningful description can be found, use null or "" instead of any "Row X" placeholder
    
    IMPORTANT: Preserve all original fields in the preservedColumns property.
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`;
  }

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("DeepSeek API error:", error);
      
      // Handle authentication error
      if (error.error?.code === "invalid_api_key") {
        throw new Error("DeepSeek API authentication error: Please check your API key.");
      }
      
      // Handle rate limit error
      if (error.error?.code === "rate_limit_exceeded") {
        throw new Error("DeepSeek API rate limit exceeded. Please try again later.");
      }
      
      throw new Error(`DeepSeek API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from DeepSeek");
    }

    // Parse the JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing DeepSeek response:", content);
      throw new Error("Could not parse transactions from DeepSeek response");
    }
  } catch (error) {
    console.error("Error processing with DeepSeek:", error);
    throw error;
  }
}
