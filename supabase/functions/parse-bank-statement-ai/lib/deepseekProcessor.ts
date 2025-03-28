
/**
 * Process extracted text with DeepSeek API
 */
export async function processWithDeepseek(text: string): Promise<any> {
  const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured. Please set up your DeepSeek API key in Supabase.");
  }

  console.log("Sending to DeepSeek for processing...");
  
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
            content: `You are a financial data extraction assistant. Your task is to parse bank statement data from various formats and output a clean JSON array of transactions.
            
            For each transaction, extract:
            - date (in YYYY-MM-DD format)
            - description (the transaction narrative)
            - amount (as a number, negative for debits/expenses)
            - type ("debit" or "credit")
            
            Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.`
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
