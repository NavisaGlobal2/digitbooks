
// Import necessary dependencies
import { BankStatementData } from "./csvService.ts";

/**
 * Process text with AI to extract structured data from bank statement
 * 
 * @param text The extracted text from bank statement
 * @param fileType The file type (csv, xlsx, pdf)
 * @param context Additional context for processing
 * @returns Structured bank statement data
 */
export async function processWithAI(
  text: string,
  fileType: string,
  context?: string | null
): Promise<BankStatementData> {
  console.log(`Available providers: Anthropic, DeepSeek`);
  
  // Get preferred provider from environment or default to Anthropic
  const preferredProvider = Deno.env.get("PREFERRED_AI_PROVIDER") || "anthropic";
  console.log(`AI processing: using ${preferredProvider} as preferred provider`);
  
  try {
    // Try processing with preferred provider first
    if (preferredProvider.toLowerCase() === "anthropic") {
      try {
        console.log("Sending to Anthropic for processing...");
        return await processWithAnthropic(text, fileType, context);
      } catch (anthropicError) {
        console.error("Error processing with Anthropic:", anthropicError);
        console.log("Falling back to DeepSeek...");
        return await processWithDeepseek(text, fileType, context);
      }
    } else {
      try {
        console.log("Sending to DeepSeek for processing...");
        return await processWithDeepseek(text, fileType, context);
      } catch (deepseekError) {
        console.error("Error processing with DeepSeek:", deepseekError);
        console.log("Falling back to Anthropic...");
        return await processWithAnthropic(text, fileType, context);
      }
    }
  } catch (error) {
    console.error("AI processing failed:", error);
    throw error;
  }
}

/**
 * Process text with Anthropic's Claude
 */
async function processWithAnthropic(
  text: string,
  fileType: string,
  context?: string | null
): Promise<BankStatementData> {
  // Get API key from environment
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("Anthropic API key not found");
  }
  
  // Prepare prompt with bank statement extraction instructions
  const prompt = `
<bank_statement>
${text.substring(0, 30000)} ${text.length > 30000 ? '... [truncated due to length]' : ''}
</bank_statement>

You are an expert financial data extraction assistant. I'm sending you a bank statement in ${fileType.toUpperCase()} format.

Please extract and format the following information:
1. Account holder name (if available)
2. Account number (if available)
3. Currency (if available, or infer from context)
4. List of all transactions with:
   - Date in YYYY-MM-DD format
   - Transaction description
   - Transaction amount
   - Transaction type (credit for money in, debit for money out)
   - Balance after transaction (if available)

Respond with ONLY a JSON object in this exact format:
{
  "account_holder": "string or null if not found",
  "account_number": "string or null if not found",
  "currency": "three-letter currency code (e.g., USD, EUR) or null if not found",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "text description",
      "amount": number,
      "type": "credit" or "debit",
      "balance": number or null if not available
    },
    ...
  ]
}

DO NOT include any explanations or text outside the JSON object. Return JUST the structured JSON.
`;

  // Set up API request
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0.0,
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });
  
  if (!response.ok) {
    let errorText = await response.text();
    console.error(`Anthropic API error (${response.status}): ${errorText}`);
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const content = data.content?.[0]?.text;
  
  if (!content) {
    throw new Error("Empty response from Anthropic");
  }
  
  console.log(`Anthropic response (first 200 chars): ${content.substring(0, 200)}...`);
  
  // Extract and parse JSON from response
  try {
    // Try to extract JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    // Parse JSON
    const parsedData = JSON.parse(jsonStr);
    
    // Validate the structure
    if (!parsedData.transactions || !Array.isArray(parsedData.transactions) || parsedData.transactions.length === 0) {
      throw new Error("No transactions found in the response");
    }
    
    // Convert the transactions to the correct format
    const formattedData: BankStatementData = {
      account_holder: parsedData.account_holder || undefined,
      account_number: parsedData.account_number || undefined,
      currency: parsedData.currency || undefined,
      transactions: parsedData.transactions.map((tx: any) => ({
        date: tx.date,
        description: tx.description,
        amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount),
        type: tx.type,
        balance: tx.balance !== null && tx.balance !== undefined ? 
          (typeof tx.balance === 'number' ? tx.balance : parseFloat(tx.balance)) : 
          undefined
      }))
    };
    
    return formattedData;
  } catch (parseError) {
    console.error("Error parsing Anthropic response:", content);
    throw new Error(`Could not parse transactions from Anthropic response`);
  }
}

/**
 * Process text with DeepSeek
 */
async function processWithDeepseek(
  text: string,
  fileType: string,
  context?: string | null
): Promise<BankStatementData> {
  // Get API key from environment
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    throw new Error("DeepSeek API key not found");
  }
  
  // Prepare prompt with bank statement extraction instructions
  const prompt = `
<bank_statement>
${text.substring(0, 30000)} ${text.length > 30000 ? '... [truncated due to length]' : ''}
</bank_statement>

You are an expert financial data extraction assistant. I'm sending you a bank statement in ${fileType.toUpperCase()} format.

Please extract and format the following information:
1. Account holder name (if available)
2. Account number (if available)
3. Currency (if available, or infer from context)
4. List of all transactions with:
   - Date in YYYY-MM-DD format
   - Transaction description
   - Transaction amount
   - Transaction type (credit for money in, debit for money out)
   - Balance after transaction (if available)

Respond with ONLY a JSON object in this exact format:
{
  "account_holder": "string or null if not found",
  "account_number": "string or null if not found",
  "currency": "three-letter currency code (e.g., USD, EUR) or null if not found",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "text description",
      "amount": number,
      "type": "credit" or "debit",
      "balance": number or null if not available
    },
    ...
  ]
}

DO NOT include any explanations or text outside the JSON object. Return JUST the structured JSON.
`;

  // Log first 500 chars of text sent to model for debugging
  console.log(`First 500 chars of text sent to DeepSeek: ${prompt.substring(0, 500)}...`);
  
  // Process context value
  console.log(`Processing context: ${context || 'general'}`);
  
  // Set up API request
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.0,
      max_tokens: 4000,
      stream: false
    })
  });
  
  if (!response.ok) {
    let errorText = await response.text();
    console.error(`DeepSeek API error (${response.status}): ${errorText}`);
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("Empty response from DeepSeek");
  }
  
  console.log(`DeepSeek response (first 200 chars): ${content.substring(0, 200)}...`);
  
  // Extract and parse JSON from response
  try {
    // Try to extract JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    // Fix common JSON issues 
    try {
      if (!jsonStr.endsWith('}')) {
        // Try to fix missing closing brackets
        const openBrackets = (jsonStr.match(/\{/g) || []).length;
        const closeBrackets = (jsonStr.match(/\}/g) || []).length;
        
        if (openBrackets > closeBrackets) {
          const missingCount = openBrackets - closeBrackets;
          jsonStr += '}'.repeat(missingCount);
          console.log(`Fixed JSON by adding ${missingCount} closing brackets`);
        }
      }
      
      // Parse JSON
      const parsedData = JSON.parse(jsonStr);
      
      // Validate the structure
      if (!parsedData.transactions || !Array.isArray(parsedData.transactions) || parsedData.transactions.length === 0) {
        throw new Error("No transactions found in the response");
      }
      
      // Convert the transactions to the correct format
      const formattedData: BankStatementData = {
        account_holder: parsedData.account_holder || undefined,
        account_number: parsedData.account_number || undefined,
        currency: parsedData.currency || undefined,
        transactions: parsedData.transactions.map((tx: any) => ({
          date: tx.date,
          description: tx.description,
          amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount),
          type: tx.type,
          balance: tx.balance !== null && tx.balance !== undefined ? 
            (typeof tx.balance === 'number' ? tx.balance : parseFloat(tx.balance)) : 
            undefined
        }))
      };
      
      return formattedData;
    } catch (jsonError) {
      console.error("Error parsing DeepSeek response:", content);
      throw new Error(`Could not parse transactions from DeepSeek response`);
    }
  } catch (parseError) {
    console.error("Error processing with DeepSeek:", parseError);
    throw new Error(`Could not parse transactions from DeepSeek response`);
  }
}
