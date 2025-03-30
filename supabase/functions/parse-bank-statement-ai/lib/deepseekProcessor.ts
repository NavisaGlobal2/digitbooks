
/**
 * Process extracted text with DeepSeek API
 */
export async function processWithDeepseek(
  text: string, 
  context?: string,
  options?: {
    isSpecialPdfFormat?: boolean;
    fileName?: string;
    fileSize?: number;
    returnEmptyOnFailure?: boolean;
    neverGenerateDummyData?: boolean;
  }
): Promise<any> {
  const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured. Please set up your DeepSeek API key in Supabase.");
  }

  console.log("Sending to DeepSeek for processing...");
  console.log(`Processing context: ${context || 'general'}`);
  
  // Check if this is an empty extraction instruction
  const isEmptyExtraction = text.includes('[EMPTY PDF EXTRACTION') || text.includes('[VISION API ERROR');
  if (isEmptyExtraction || options?.returnEmptyOnFailure === true) {
    console.log("Empty extraction detected or forced empty result requested - returning empty array");
    return [];
  }
  
  // Adjust the system prompt based on the context (revenue or expense)
  let systemPrompt = `You are a financial data extraction assistant specialized in bank statement analysis.`;
  
  if (text.includes('[PDF BANK STATEMENT:')) {
    systemPrompt += `
    
CRITICAL INSTRUCTION: You are processing a REAL PDF bank statement that was uploaded by a user.
Your task is to analyze the content and extract actual transactions that would appear in a bank statement.
This is NOT a simulation or test - a user has uploaded their real bank statement.
If you cannot determine clear transaction patterns, return an empty array rather than inventing fake transactions.
NEVER create fictional data - only extract what appears to be genuine financial transactions.
RETURNING AN EMPTY ARRAY [] IS THE CORRECT RESPONSE WHEN NO CLEAR TRANSACTIONS ARE FOUND.`;
  }
  
  if (options?.neverGenerateDummyData) {
    systemPrompt += `

EXTREMELY IMPORTANT: The user is receiving placeholder/dummy transactions instead of their real data.
This is causing a severe problem in their financial tracking application.
DO NOT GENERATE ANY FICTIONAL TRANSACTIONS under any circumstances.
If you can't extract real transactions, return an empty array [].
The user's financial decisions depend on this data being accurate.
RETURNING AN EMPTY ARRAY [] IS THE CORRECT RESPONSE WHEN NO CLEAR TRANSACTIONS ARE FOUND.`;
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
    
    Focus only on credit (incoming money) transactions, which represent revenue. These have positive amounts.
    
    IMPORTANT: Only include transactions that appear to be real based on the input. If you don't see clear transaction data, return an empty array.
    DO NOT generate any fictional transactions.
    
    Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`;
  } else {
    systemPrompt += `
    
    For each transaction, extract:
    - date (in YYYY-MM-DD format)
    - description (the complete transaction narrative with all details)
    - amount (as a number, negative for debits/expenses, positive for credits/income)
    - type ("debit" or "credit")
    
    Only return transactions that appear to be real based on the input.
    If you don't see clear transaction data, return an empty array.
    
    IMPORTANT: NEVER generate fictional transactions. Only extract data that appears genuine.
    RETURNING AN EMPTY ARRAY [] IS THE CORRECT RESPONSE WHEN NO CLEAR TRANSACTIONS ARE FOUND.
    
    Respond ONLY with a valid JSON array of transactions, with NO additional text or explanation.`;
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
            content: `EXTRACT ONLY REAL TRANSACTIONS FROM THIS TEXT. IF YOU CAN'T FIND ANY CLEAR TRANSACTIONS, RETURN AN EMPTY ARRAY [].
          
${text}`
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic results
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
      
      console.log("Returning empty array due to API error");
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.log("No content returned from DeepSeek, returning empty array");
      return [];
    }

    // Parse the JSON response
    try {
      const parsedData = JSON.parse(content);
      console.log(`Extracted ${parsedData.length} transactions from DeepSeek response`);
      return parsedData;
    } catch (parseError) {
      console.error("Error parsing DeepSeek response:", content);
      console.log("Returning empty array due to parsing error");
      return [];
    }
  } catch (error) {
    console.error("Error processing with DeepSeek:", error);
    console.log("Returning empty array due to processing error");
    return [];
  }
}
