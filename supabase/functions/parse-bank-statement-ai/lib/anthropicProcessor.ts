
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
  let systemPrompt = `You are a financial data extraction assistant specializing in bank statements. Your task is to parse bank statement data from various Excel and CSV formats and output a clean JSON array of transactions.`;
  
  if (context === "revenue") {
    systemPrompt += `
    
    For each transaction, extract:
    - date (in YYYY-MM-DD format)
    - description (the complete transaction narrative with all details preserved)
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
    
    Examine the Excel data carefully. Look for patterns indicating transaction rows, and ignore headers, footers, summary rows, and non-transaction information.
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.
    
    IMPORTANT: Ensure your response is complete, properly formatted JSON with no trailing commas or unfinished structures.`;
  } else {
    systemPrompt += `
    
    For each transaction, extract:
    - date (in YYYY-MM-DD format, converting from any format like DD/MM/YYYY)
    - description (the COMPLETE transaction narrative, preserving all reference numbers and details)
    - amount (as a number, negative for debits/expenses, positive for credits/deposits)
    - type ("debit" or "credit")
    
    Pay special attention to:
    1. Understand the structure of the Excel data and identify the actual transaction rows
    2. Skip any headers, summary rows, balance calculations, or metadata
    3. Convert all dates to YYYY-MM-DD format, regardless of original format (e.g., 01/02/24 → 2024-02-01)
    4. Preserve ALL details in the description field including reference numbers
    5. For amount fields, ensure proper sign (negative for money leaving account, positive for money coming in)
    6. If currency symbols or commas exist in amount fields, ignore them and extract only the numeric value
    
    If the description contains specific information like:
    - Recipient name and account numbers
    - Reference codes or identifiers
    - Transaction types (ATM, POS, TRANSFER)
    - Purpose of payment
    
    Include ALL of these details in the description field, preserving their original form.
    
    Analyze the tabular structure carefully to identify the actual transaction data, even when mixed with headers or summary information.
    
    In the output JSON, include ONLY the actual transactions - skip any rows that are balance summaries, headers, or non-transaction information.
    
    IMPORTANT: Your response must be a valid JSON array. Make sure to properly close all brackets and do not include any text outside the JSON array. Do not include code formatting or markdown backticks in your response. Do not truncate your response - include all transactions.
    
    Sample format:
    [
      {
        "date": "2023-05-15",
        "description": "GROCERY STORE PURCHASE REF#12345",
        "amount": -58.97,
        "type": "debit"
      },
      {
        "date": "2023-05-17",
        "description": "SALARY PAYMENT FROM ACME CORP",
        "amount": 1500.00,
        "type": "credit"
      }
    ]`;
  }

  try {
    // Log the first 500 characters of the text to help with debugging
    console.log(`First 500 chars of text sent to Anthropic: ${text.substring(0, 500)}...`);

    // Filter out invalid characters or encoding issues before sending to Anthropic
    const sanitizedText = sanitizeTextForAPI(text);

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
            content: sanitizedText
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
      // Clean up the content - remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Add missing closing bracket if needed
      let jsonToProcess = cleanedContent;
      const openBrackets = (cleanedContent.match(/\[/g) || []).length;
      const closeBrackets = (cleanedContent.match(/\]/g) || []).length;
      
      if (openBrackets > closeBrackets) {
        jsonToProcess = jsonToProcess + ']'.repeat(openBrackets - closeBrackets);
        console.log(`Fixed JSON by adding ${openBrackets - closeBrackets} closing brackets`);
      }
      
      // Try to find a valid JSON array in the response
      let startPos = jsonToProcess.indexOf('[');
      let endPos = jsonToProcess.lastIndexOf(']');
      
      if (startPos !== -1 && endPos !== -1 && startPos < endPos) {
        jsonToProcess = jsonToProcess.substring(startPos, endPos + 1);
      }
      
      // Now parse the JSON
      const parsedResult = JSON.parse(jsonToProcess);
      
      // Verify it's an array
      if (!Array.isArray(parsedResult)) {
        throw new Error("Response is not a valid JSON array of transactions");
      }
      
      // Log first transaction for debugging
      if (parsedResult.length > 0) {
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
