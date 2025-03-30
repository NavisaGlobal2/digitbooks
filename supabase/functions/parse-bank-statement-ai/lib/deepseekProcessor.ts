
/**
 * Process extracted text with DeepSeek API
 */
export async function processWithDeepseek(text: string, context?: string): Promise<any> {
  const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured. Please set up your DeepSeek API key in Supabase.");
  }

  console.log("Sending to DeepSeek for processing...");
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
    - description (the transaction narrative)
    - amount (as a number, negative for debits/expenses)
    - type ("debit" or "credit")
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`;
  }

  try {
    // Filter out invalid characters or encoding issues before sending to DeepSeek
    const sanitizedText = sanitizeTextForAPI(text);
    
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
            content: sanitizedText
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

/**
 * Sanitize text before sending to API to prevent encoding issues
 * @param text Text to sanitize
 * @returns Sanitized text
 */
function sanitizeTextForAPI(text: string): string {
  // Replace problematic characters and encoding issues
  return text
    // Replace null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Replace unpaired surrogates with space
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, ' ')
    // Reduce multiple spaces to single space
    .replace(/\s+/g, ' ')
    .trim();
}
