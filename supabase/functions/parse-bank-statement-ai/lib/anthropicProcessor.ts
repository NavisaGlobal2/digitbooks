
/**
 * Process extracted text with Anthropic API
 */
export async function processWithAnthropic(
  text: string, 
  context?: string,
  options?: any
): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase.");
  }

  console.log(`Processing context: ${context || 'general'}`);
  
  // Check if this is Vision API extracted text
  const isVisionExtracted = text.includes('[PDF BANK STATEMENT EXTRACTED WITH GOOGLE VISION API:') || options?.isVisionExtracted;
  
  // Create a stronger system prompt to prevent dummy data generation
  let systemPrompt = `You are a financial data extraction assistant specialized in bank statement analysis.
  
YOUR SOLE PURPOSE IS TO EXTRACT ACTUAL TRANSACTIONS FROM REAL FINANCIAL STATEMENTS.
DO NOT INVENT, GENERATE OR HALLUCINATE ANY TRANSACTIONS UNDER ANY CIRCUMSTANCES.

If you cannot clearly identify transactions from the input text, return an empty array [].

CRITICAL WARNING: Users have reported that you sometimes generate fictional transactions instead of extracting real ones. This is causing serious problems with their financial tracking. NEVER do this - only extract REAL transactions visible in the data.`;
  
  if (isVisionExtracted) {
    systemPrompt += `

SPECIAL INSTRUCTION: The input contains OCR-extracted text from a real PDF bank statement.
This is actual transaction data that a user has uploaded. Trust this data and extract the transactions from it.
DO NOT make up transactions - the user's financial decisions depend on this being accurate.`;
  }
  
  if (text.includes('[PDF BANK STATEMENT:') || text.includes('ACTUAL STATEMENT TEXT FOLLOWS:')) {
    systemPrompt += `
    
CRITICAL INSTRUCTION: You are processing a REAL PDF bank statement that was uploaded by a user.
Your task is to analyze the content and extract ONLY actual transactions that appear in this bank statement.
This is NOT a simulation or test - a user has uploaded their real bank statement.
If you cannot determine clear transaction patterns, return an empty array rather than inventing fake transactions.
NEVER create fictional data - only extract what appears to be genuine financial transactions.`;
  }
  
  if (options?.forceRealData) {
    systemPrompt += `

EXTREMELY IMPORTANT: The user is receiving placeholder/dummy transactions instead of their real data.
This is causing a severe problem in their financial tracking application.
DO NOT GENERATE ANY FICTIONAL TRANSACTIONS under any circumstances.
If you can't extract real transactions, return an empty array [].
The user's financial decisions depend on this data being accurate.`;
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
    
    Respond ONLY with a valid JSON array of transactions, with NO additional text or explanation.`;
  }

  try {
    console.log("Sending to Anthropic for processing...");
    
    // Include explicit detection for OCR text
    const userMessage = isVisionExtracted
      ? `THIS IS OCR-EXTRACTED TEXT FROM A REAL BANK STATEMENT PDF. EXTRACT ONLY REAL TRANSACTIONS FROM THIS TEXT. IF YOU CAN'T FIND ANY CLEAR TRANSACTIONS, RETURN AN EMPTY ARRAY [].

${text}`
      : `EXTRACT ONLY REAL TRANSACTIONS FROM THIS TEXT. IF YOU CAN'T FIND ANY CLEAR TRANSACTIONS, RETURN AN EMPTY ARRAY [].
          
${text}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        temperature: 0,  // Using 0 temperature for maximum determinism
        system: systemPrompt,
        messages: [{
          role: "user", 
          content: userMessage
        }]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Anthropic API error:", error);
      throw new Error(`Anthropic API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error("No content returned from Anthropic");
    }

    console.log("Raw Anthropic response:", content.slice(0, 200) + "...");

    // Try to parse JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log(`Extracted ${parsedData.length} transactions from Anthropic response`);
        return parsedData;
      }
      
      // Try parsing the whole response
      try {
        const parsedContent = JSON.parse(content);
        console.log(`Parsed entire content with ${parsedContent.length} transactions`);
        return parsedContent;
      } catch (parseWholeError) {
        // If we couldn't parse the JSON, it might be because Anthropic added explanatory text
        console.log("Couldn't parse entire response, looking for JSON array");
      }

      // If we got here, we couldn't find a valid JSON array
      console.error("No valid JSON structure found in Anthropic response");
      console.log("Response content:", content);
      throw new Error("Could not parse transactions from Anthropic response");
    } catch (parseError) {
      console.error("Error parsing Anthropic response:", content);
      throw new Error("Could not parse transactions from Anthropic response");
    }
  } catch (error) {
    console.error("Error processing with Anthropic:", error);
    throw error;
  }
}
