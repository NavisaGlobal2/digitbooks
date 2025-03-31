
/**
 * Process extracted text with Anthropic Claude API
 */
export async function processWithAnthropic(text: string, context?: string | null): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase.");
  }

  console.log("Sending to Anthropic for processing...");
  console.log(`Processing context: ${context || 'general'}`);
  console.log(`Input data size: ${text.length} characters`);
  
  // Enhanced system prompt with stronger emphasis on proper description formatting
  let systemPrompt = `You are a financial data extraction and formatting expert. Your task is to analyze and structure raw bank statement transaction data. KEEP ALL ORIGINAL DATA but ensure consistent formatting.`;
  
  if (context === "revenue") {
    systemPrompt += `
    
    For each transaction, you MUST PRESERVE ALL ORIGINAL FIELDS AND VALUES, while ensuring these core fields are properly structured:
    - date (in YYYY-MM-DD format)
    - description (NEVER use placeholders like "Row 1", "Row 2", "Row 12", "Row 13", or any row-based identifiers - extract the actual transaction narrative from the data)
    - amount (as a number, negative for debits/expenses, positive for credits/revenue)
    - type ("debit" or "credit")
    
    CRITICAL INSTRUCTIONS FOR DESCRIPTIONS:
    1. ABSOLUTELY NEVER output description labels like "Row 1", "Row 2", "Row 12", "Row 13", etc. in place of actual descriptions
    2. Always extract the actual transaction narrative from the "REMARKS", "NARRATION", "PARTICULARS" or similar fields
    3. If no clear description exists, use merchant name, reference number, or any identifying information
    4. Combine relevant fields to create meaningful descriptions when necessary
    5. Remove any unnecessary prefixes, suffixes, or repetitive elements
    6. When descriptions appear as numbered rows, REPLACE them with actual descriptive content from other fields
    
    IMPORTANT: Analyze the raw data structure thoroughly and PRESERVE ALL ORIGINAL FIELDS in the preservedColumns property.
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`;
  } else {
    systemPrompt += `
    
    For each transaction, you MUST PRESERVE ALL ORIGINAL FIELDS AND VALUES, while ensuring these core fields are properly structured:
    - date (in YYYY-MM-DD format if possible)
    - description (NEVER use placeholders like "Row 1", "Row 2", "Row 12", "Row 13", or any row-based identifiers - extract the actual transaction narrative from the data)
    - amount (as a number, negative for debits/expenses, positive for credits/revenue)
    - type ("debit" or "credit")
    
    CRITICAL INSTRUCTIONS FOR DESCRIPTIONS:
    1. ABSOLUTELY NEVER output description labels like "Row 1", "Row 2", "Row 12", "Row 13", etc. in place of actual descriptions
    2. Always extract the actual transaction narrative from the "REMARKS", "NARRATION", "PARTICULARS" or similar fields
    3. If no clear description exists, use merchant name, reference number, or any identifying information
    4. Combine relevant fields to create meaningful descriptions when necessary
    5. Remove any unnecessary prefixes, suffixes, or repetitive elements
    6. When descriptions appear as numbered rows, REPLACE them with actual descriptive content from other fields
    
    IMPORTANT: Analyze the raw data structure thoroughly and PRESERVE ALL ORIGINAL FIELDS in the preservedColumns property.
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here is the raw bank statement transaction data, analyze and format it: ${text}`
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Anthropic API error:", error);
      
      // Handle authentication error specifically
      if (error.error?.type === "authentication_error") {
        throw new Error("Anthropic API authentication error: Please check your API key.");
      }
      
      if (error.error?.type === "rate_limit_error") {
        throw new Error("Anthropic API rate limit exceeded. Please try again later.");
      }
      
      if (error.error?.type === "overloaded_error") {
        throw new Error("Anthropic API is currently overloaded. Please try again in a few minutes.");
      }
      
      throw new Error(`Anthropic API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error("No content returned from Anthropic");
    }

    // Parse the JSON response - Anthropic should return only JSON
    try {
      const parsedData = JSON.parse(content);
      
      // Log the first item of the AI response
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        console.log("ANTHROPIC AI OUTPUT SAMPLE:", 
          JSON.stringify(parsedData[0], null, 2));
      }
      
      return parsedData;
    } catch (parseError) {
      console.error("Error parsing Anthropic response:", content);
      throw new Error("Could not parse transactions from Anthropic response");
    }
  } catch (error) {
    console.error("Error processing with Anthropic:", error);
    throw error;
  }
}
