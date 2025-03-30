
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
  let systemPrompt = `You are a financial data extraction expert. Your task is to parse bank statement data and output a clean JSON array of transactions.`;
  
  if (context === "revenue") {
    systemPrompt += `
    Focus on extracting revenue transactions (deposits, income) with these fields:
    - date (in YYYY-MM-DD format)
    - description (preserve all transaction details)
    - amount (as a positive number for revenue)
    - type (always "credit" for revenue)
    
    For each revenue transaction, add a "sourceSuggestion" with source category and confidence level.
    
    Output ONLY a JSON array of transactions, properly formatted with complete brackets and no additional text.`;
  } else {
    systemPrompt += `
    Extract all financial transactions with:
    - date (in YYYY-MM-DD format)
    - description (preserve all details exactly as shown)
    - amount (as a number, negative for debits/expenses, positive for credits)
    - type ("debit" or "credit")
    
    Output ONLY a JSON array of transactions, properly formatted with complete brackets and no additional text.
    IMPORTANT: Make sure to close all JSON brackets properly and include all transactions.`;
  }

  try {
    // Log a sample of the text for debugging
    console.log(`First 500 chars of text sent to DeepSeek: ${text.substring(0, 500)}...`);

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
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("DeepSeek API error:", error);
      
      if (error.error?.type === "invalid_api_key") {
        throw new Error("DeepSeek API authentication error: Please check your API key.");
      }
      
      if (error.error?.type?.includes("rate_limit")) {
        throw new Error("DeepSeek API rate limit exceeded. Please try again later.");
      }
      
      throw new Error(`DeepSeek API error: ${error.error?.message || JSON.stringify(error) || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from DeepSeek");
    }

    // Log a sample of the response
    console.log(`DeepSeek response (first 200 chars): ${content.substring(0, 200)}...`);

    // Parse the JSON response
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
      console.error("Error parsing DeepSeek response:", content);
      throw new Error("Could not parse transactions from DeepSeek response");
    }
  } catch (error) {
    console.error("Error processing with DeepSeek:", error);
    throw error;
  }
}
