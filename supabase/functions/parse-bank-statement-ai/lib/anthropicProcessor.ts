
/**
 * Process extracted text with Anthropic Claude API
 */
export async function processWithAnthropic(text: string): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase.");
  }

  console.log("Sending to Anthropic for processing...");
  
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
        system: `You are a financial data extraction assistant. Your task is to parse bank statement data from various formats and output a clean JSON array of transactions.
        
        For each transaction, extract:
        - date (in YYYY-MM-DD format)
        - description (the transaction narrative)
        - amount (as a number, negative for debits/expenses)
        - type ("debit" or "credit")
        
        Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.
        Sample format:
        [
          {
            "date": "2023-05-15",
            "description": "GROCERY STORE PURCHASE",
            "amount": -58.97,
            "type": "debit"
          },
          {
            "date": "2023-05-17",
            "description": "SALARY PAYMENT",
            "amount": 1500.00,
            "type": "credit"
          }
        ]`,
        messages: [
          {
            role: "user",
            content: text
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Anthropic API error:", error);
      
      // Handle quota exceeded error specifically
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
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing Anthropic response:", content);
      throw new Error("Could not parse transactions from Anthropic response");
    }
  } catch (error) {
    console.error("Error processing with Anthropic:", error);
    throw error;
  }
}
