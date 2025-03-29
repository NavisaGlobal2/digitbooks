
/**
 * Process extracted text with Anthropic Claude API
 */
export async function processWithAnthropic(
  text: string, 
  context?: string,
  options?: {
    isSpecialPdfFormat?: boolean;
    fileName?: string;
    fileSize?: number;
  }
): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase.");
  }

  console.log("Sending to Anthropic for processing...");
  console.log(`Processing context: ${context || 'general'}`);
  
  // Adjust the system prompt based on the context (revenue or expense)
  let systemPrompt = `You are a financial data extraction assistant specialized in accurately extracting transaction data from bank statements.`;
  
  if (text.includes('[PDF BANK STATEMENT:')) {
    systemPrompt += `
    
CRITICAL INSTRUCTION: You are processing a REAL PDF bank statement. 
You must extract ONLY the ACTUAL transactions that appear in the statement.
DO NOT generate fictional or placeholder transactions.
DO NOT make up any data or create sample transactions.
Only extract real transaction data that is visible in the document.
IF NO TRANSACTIONS ARE VISIBLE, return an empty array - do not invent sample data.`;
  }
  
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
    - description (the complete transaction narrative with all details)
    - amount (as a number, negative for debits/expenses, positive for credits/income)
    - type ("debit" or "credit")
    
    Extract ONLY REAL transactions visible in the statement. DO NOT generate fictional data.
    If you cannot find any transactions, return an empty array - do not invent data.
    
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
        temperature: 0.1, // Lower temperature for more deterministic results
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
