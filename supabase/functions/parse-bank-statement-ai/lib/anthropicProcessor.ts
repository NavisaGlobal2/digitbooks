
/**
 * Process extracted text with Anthropic Claude API
 */
export async function processWithAnthropic(text: string, context?: string): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase.");
  }

  console.log("Sending to Anthropic for processing...");
  console.log(`Processing context: ${context || 'general'}`);
  
  // Adjust the system prompt based on the context (revenue or expense)
  let systemPrompt = `You are a financial data extraction assistant. Your task is to parse bank statement data from various formats and output a clean JSON array of transactions.`;
  
  if (context === "revenue") {
    systemPrompt += `
    
    For each transaction, extract:
    - date (in YYYY-MM-DD format)
    - description (the transaction narrative)
    - amount (as a number, negative for debits/expenses, positive for credits/revenue)
    - type ("debit" or "credit")
    
    Additionally, for credit (revenue) transactions, analyze the description to suggest a source from these categories:
    - sales: Product or service sales revenue
    - services: Service fees, consulting
    - investments: Interest, dividends, capital gains
    - grants: Grants or institutional funding
    - donations: Charitable contributions
    - royalties: Licensing fees, intellectual property income
    - rental: Property or equipment rental income
    - consulting: Professional services fees
    - affiliate: Commission from partnerships
    - other: Miscellaneous or unclassifiable income
    
    For each credit transaction, add a "sourceSuggestion" object containing:
    - "source": the suggested revenue category (from the list above)
    - "confidence": a number between 0 and 1 indicating your confidence level
    
    Focus only on credit (incoming money) transactions, which represent revenue. These have positive amounts.
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`;
  } else {
    systemPrompt += `
    
    For each transaction, extract:
    - date (in YYYY-MM-DD format)
    - description (the COMPLETE transaction narrative, preserving all details)
    - amount (as a number, negative for debits/expenses, positive for credits/deposits)
    - type ("debit" or "credit")
    
    Pay special attention to:
    1. Convert all dates to YYYY-MM-DD format, regardless of original format
    2. Preserve ALL details in the description field including reference numbers
    3. Ensure amount signs are correct (negative for money leaving account, positive for money coming in)
    
    If there's any ambiguity about transaction direction, use the description to determine whether it's a debit or credit.
    
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
    ]`;
  }

  try {
    // Log the first 500 characters of the text to help with debugging
    console.log(`First 500 chars of text sent to Anthropic: ${text.substring(0, 500)}...`);

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
            content: text
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

    // Log a sample of the response
    console.log(`Anthropic response (first 200 chars): ${content.substring(0, 200)}...`);

    // Parse the JSON response - Anthropic should return only JSON
    try {
      const parsedResult = JSON.parse(content);
      
      // Log first transaction for debugging
      if (Array.isArray(parsedResult) && parsedResult.length > 0) {
        console.log(`First parsed transaction: ${JSON.stringify(parsedResult[0])}`);
      }
      
      return parsedResult;
    } catch (parseError) {
      console.error("Error parsing Anthropic response:", content);
      throw new Error("Could not parse transactions from Anthropic response");
    }
  } catch (error) {
    console.error("Error processing with Anthropic:", error);
    throw error;
  }
}
