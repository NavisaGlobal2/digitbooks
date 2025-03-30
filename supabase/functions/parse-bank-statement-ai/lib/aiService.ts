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
    
    // Attempt simpler extraction as final fallback for any file type
    if (fileType.toLowerCase() === "csv") {
      console.log("Attempting basic CSV parser as last resort fallback");
      return await simpleCsvParseFallback(text);
    } else if (fileType.toLowerCase() === "xlsx" || fileType.toLowerCase() === "xls") {
      console.log("Attempting basic Excel parser as last resort fallback");
      return await simpleExcelParseFallback(text);
    }
    
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
  
  // Use a more specific and clearer system prompt
  const systemPrompt = `You are an expert financial data extraction specialist. Your task is to parse ${fileType.toUpperCase()} bank statements and extract transaction data in a consistent format.
  
  IMPORTANT INSTRUCTIONS:
  1. Parse ONLY the actual transactions from the bank statement
  2. Skip headers, footers, balance summaries, and marketing content
  3. For each transaction extract: date, description, amount, credit/debit type
  4. Convert ALL dates to YYYY-MM-DD format
  5. For amounts, use positive numbers with appropriate type field
  6. Set type as "credit" for money coming in, "debit" for money going out
  7. Include the full transaction description with all reference numbers
  8. If balance information is available for each transaction, include it
  
  Output ONLY a valid JSON object in this exact format without any explanation or text outside the JSON:
  {
    "account_holder": "extracted name or null",
    "account_number": "extracted number or null",
    "currency": "extracted or inferred currency code (USD, EUR, etc.)",
    "transactions": [
      {
        "date": "YYYY-MM-DD",
        "description": "complete transaction description",
        "amount": number,
        "type": "credit" or "debit",
        "balance": number or null
      }
    ]
  }`;

  try {
    // Truncate text if too long but keep essential parts
    const truncatedText = text.length > 30000 ? 
      text.substring(0, 15000) + " ... [middle section truncated] ... " + text.substring(text.length - 15000) : 
      text;

    console.log(`First 500 chars of text sent to Anthropic: ${truncatedText.substring(0, 500)}...`);
    
    // Call Anthropic API with optimized parameters
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
        temperature: 0,
        system: systemPrompt,
        messages: [
          { role: "user", content: truncatedText }
        ]
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Anthropic API error: ${response.status} - ${JSON.stringify(errorData.error || {})}`);
    }
    
    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Invalid response format from Anthropic");
    }
    
    const content = data.content[0].text;
    console.log(`Anthropic response (first 200 chars): ${content.substring(0, 200)}...`);
    
    try {
      // Handle different JSON formats in the response
      let jsonData;
      
      // First try direct parsing
      try {
        jsonData = JSON.parse(content);
      } catch (initialError) {
        // Try to extract just the JSON object if there's text around it
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      }
      
      // Validate and normalize the data structure
      if (!jsonData.transactions || !Array.isArray(jsonData.transactions) || jsonData.transactions.length === 0) {
        throw new Error("No transactions found in the response");
      }
      
      // Build properly structured response
      const result: BankStatementData = {
        account_holder: jsonData.account_holder || undefined,
        account_number: jsonData.account_number || undefined,
        currency: jsonData.currency || undefined,
        transactions: jsonData.transactions.map((tx: any) => ({
          date: tx.date,
          description: tx.description,
          amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount),
          type: tx.type,
          balance: tx.balance !== null && tx.balance !== undefined ? 
            (typeof tx.balance === 'number' ? tx.balance : parseFloat(tx.balance)) : 
            undefined
        }))
      };
      
      return result;
    } catch (parseError) {
      console.error("Error parsing Anthropic JSON response:", parseError);
      throw new Error("Failed to parse transaction data from Anthropic response");
    }
  } catch (error) {
    console.error("Anthropic processing error:", error);
    throw error;
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

  // Use a more specific and clearer system prompt
  const systemPrompt = `You are an expert financial data extraction specialist. Your task is to parse ${fileType.toUpperCase()} bank statements and extract transaction data in a consistent format.
  
  IMPORTANT INSTRUCTIONS:
  1. Parse ONLY the actual transactions from the bank statement
  2. Skip headers, footers, balance summaries, and marketing content
  3. For each transaction extract: date, description, amount, credit/debit type
  4. Convert ALL dates to YYYY-MM-DD format
  5. For amounts, use positive numbers with appropriate type field
  6. Set type as "credit" for money coming in, "debit" for money going out
  7. Include the full transaction description with all reference numbers
  8. If balance information is available for each transaction, include it
  
  Output ONLY a valid JSON object in this exact format without any explanation or text outside the JSON:
  {
    "account_holder": "extracted name or null",
    "account_number": "extracted number or null",
    "currency": "extracted or inferred currency code (USD, EUR, etc.)",
    "transactions": [
      {
        "date": "YYYY-MM-DD",
        "description": "complete transaction description",
        "amount": number,
        "type": "credit" or "debit",
        "balance": number or null
      }
    ]
  }`;

  try {
    // Truncate text if too long but keep essential parts
    const truncatedText = text.length > 30000 ? 
      text.substring(0, 15000) + " ... [middle section truncated] ... " + text.substring(text.length - 15000) : 
      text;

    console.log(`First 500 chars of text sent to DeepSeek: ${truncatedText.substring(0, 500)}...`);
    
    // Process context value
    console.log(`Processing context: ${context || 'general'}`);
    
    // Call DeepSeek API with optimized parameters
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: truncatedText }
        ],
        temperature: 0,
        max_tokens: 4000,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API error: ${response.status} - ${JSON.stringify(errorData.error || {})}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Invalid response format from DeepSeek");
    }
    
    const content = data.choices[0].message.content;
    console.log(`DeepSeek response (first 200 chars): ${content.substring(0, 200)}...`);
    
    try {
      // Handle different JSON formats in the response
      let jsonData;
      
      // First try direct parsing
      try {
        jsonData = JSON.parse(content);
      } catch (initialError) {
        // Try to extract just the JSON object if there's text around it
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          // Fix common JSON issues like missing closing brackets
          const openBrackets = (jsonStr.match(/\{/g) || []).length;
          const closeBrackets = (jsonStr.match(/\}/g) || []).length;
          
          let fixedJsonStr = jsonStr;
          if (openBrackets > closeBrackets) {
            fixedJsonStr = jsonStr + '}'.repeat(openBrackets - closeBrackets);
            console.log(`Fixed JSON by adding ${openBrackets - closeBrackets} closing brackets`);
          }
          
          jsonData = JSON.parse(fixedJsonStr);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      }
      
      // Validate and normalize the data structure
      if (!jsonData.transactions || !Array.isArray(jsonData.transactions) || jsonData.transactions.length === 0) {
        throw new Error("No transactions found in the response");
      }
      
      // Build properly structured response
      const result: BankStatementData = {
        account_holder: jsonData.account_holder || undefined,
        account_number: jsonData.account_number || undefined,
        currency: jsonData.currency || undefined,
        transactions: jsonData.transactions.map((tx: any) => ({
          date: tx.date,
          description: tx.description,
          amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount),
          type: tx.type,
          balance: tx.balance !== null && tx.balance !== undefined ? 
            (typeof tx.balance === 'number' ? tx.balance : parseFloat(tx.balance)) : 
            undefined
        }))
      };
      
      return result;
    } catch (parseError) {
      console.error("Error parsing DeepSeek JSON response:", parseError);
      throw new Error("Failed to parse transaction data from DeepSeek response");
    }
  } catch (error) {
    console.error("DeepSeek processing error:", error);
    throw error;
  }
}

/**
 * Simple CSV parser fallback when AI services fail
 * Uses basic heuristics to extract transactions
 */
async function simpleCsvParseFallback(text: string): Promise<BankStatementData> {
  console.log("Using simple CSV fallback parser");
  
  const rows = text
    .split('\n')
    .map(line => line.split(',').map(cell => cell.trim()));
  
  // Find potential header row
  let headerRowIndex = -1;
  
  // Look for common column header names
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i].map(cell => cell.toLowerCase());
    if (
      (row.some(cell => cell.includes('date')) && 
       row.some(cell => cell.includes('amount') || cell.includes('debit') || cell.includes('credit'))) ||
      (row.some(cell => cell.includes('date')) && 
       row.some(cell => cell.includes('description') || cell.includes('narrative')))
    ) {
      headerRowIndex = i;
      break;
    }
  }
  
  // If we couldn't find a header row, try the first row
  if (headerRowIndex === -1 && rows.length > 0) {
    headerRowIndex = 0;
  }
  
  // If we still don't have a usable header or data, return empty result
  if (headerRowIndex === -1 || rows.length < headerRowIndex + 2) {
    console.warn("Couldn't identify transaction data in CSV");
    return {
      transactions: []
    };
  }
  
  const headerRow = rows[headerRowIndex].map(h => h.toLowerCase());
  const dataRows = rows.slice(headerRowIndex + 1);
  
  // Try to identify column indices
  const dateIndex = headerRow.findIndex(h => h.includes('date'));
  const descIndex = headerRow.findIndex(h => 
    h.includes('description') || 
    h.includes('narrative') || 
    h.includes('details') ||
    h.includes('transaction')
  );
  
  let amountIndex = headerRow.findIndex(h => h.includes('amount'));
  const debitIndex = headerRow.findIndex(h => h.includes('debit'));
  const creditIndex = headerRow.findIndex(h => h.includes('credit'));
  const balanceIndex = headerRow.findIndex(h => h.includes('balance'));
  
  // If no amount column but separate debit/credit columns
  if (amountIndex === -1 && (debitIndex !== -1 || creditIndex !== -1)) {
    amountIndex = debitIndex !== -1 ? debitIndex : creditIndex;
  }
  
  // Can't proceed without at least date and amount
  if (dateIndex === -1 || (amountIndex === -1 && debitIndex === -1 && creditIndex === -1)) {
    console.warn("Couldn't identify required columns in CSV");
    return {
      transactions: []
    };
  }
  
  // Extract transactions
  const transactions = dataRows
    .filter(row => row.length >= Math.max(dateIndex, descIndex, amountIndex) + 1)
    .map(row => {
      // Extract and normalize date (try common formats)
      const dateStr = row[dateIndex];
      let dateObj: Date | null = null;
      
      // Try different date formats
      const dateFormats = [
        // MM/DD/YYYY
        () => {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          }
          return null;
        },
        // DD/MM/YYYY
        () => {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          return null;
        },
        // YYYY-MM-DD
        () => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          }
          return null;
        },
        // DD-MM-YYYY
        () => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          return null;
        },
      ];
      
      for (const format of dateFormats) {
        const parsedDate = format();
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          dateObj = parsedDate;
          break;
        }
      }
      
      // Format date as YYYY-MM-DD
      let formattedDate = "unknown";
      if (dateObj) {
        formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      } else if (dateStr) {
        // Just use as-is if we can't parse it
        formattedDate = dateStr;
      }
      
      // Extract description
      const description = descIndex !== -1 ? row[descIndex] : "Unknown transaction";
      
      // Extract amount and determine if credit or debit
      let amount = 0;
      let type = "debit";
      
      // Case: Separate debit and credit columns
      if (debitIndex !== -1 && creditIndex !== -1) {
        const debitValue = parseFloat(row[debitIndex].replace(/[^0-9.-]/g, ''));
        const creditValue = parseFloat(row[creditIndex].replace(/[^0-9.-]/g, ''));
        
        if (!isNaN(debitValue) && debitValue > 0) {
          amount = debitValue;
          type = "debit";
        } else if (!isNaN(creditValue) && creditValue > 0) {
          amount = creditValue;
          type = "credit";
        }
      } 
      // Case: Single amount column
      else if (amountIndex !== -1) {
        const rawAmount = row[amountIndex].replace(/[^0-9.-]/g, '');
        amount = parseFloat(rawAmount);
        
        if (!isNaN(amount)) {
          // In some formats, negative values are debits and positive are credits
          if (rawAmount.includes('-') || amount < 0) {
            type = "debit";
            amount = Math.abs(amount);
          } else {
            type = "credit";
          }
        }
      }
      
      // Extract balance if available
      const balance = balanceIndex !== -1 
        ? parseFloat(row[balanceIndex].replace(/[^0-9.-]/g, ''))
        : undefined;
      
      return {
        date: formattedDate,
        description,
        amount,
        type,
        balance: !isNaN(balance as number) ? balance : undefined
      };
    })
    .filter(tx => !isNaN(tx.amount) && tx.amount > 0); // Filter out invalid transactions
  
  return {
    transactions
  };
}

/**
 * Simple Excel parser fallback when AI services fail
 * Uses basic heuristics to extract transactions
 */
async function simpleExcelParseFallback(text: string): Promise<BankStatementData> {
  console.log("Using simple Excel fallback parser");
  
  // Split by newlines and then by tabs/multiple spaces as Excel text extractions often use tabs
  const rows = text
    .split('\n')
    .map(line => line.split(/\t|\s{2,}/).map(cell => cell.trim()))
    .filter(row => row.length > 1); // Filter out rows with just one column
  
  // Try to identify account info from the first few lines
  let accountHolder = "";
  let accountNumber = "";
  
  // Check first 10 lines for account information
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowText = rows[i].join(' ').toLowerCase();
    
    // Look for account holder name patterns
    if (!accountHolder && (rowText.includes('name:') || rowText.includes('account holder'))) {
      const nameMatch = rows[i].find(col => 
        !col.toLowerCase().includes('name:') && 
        !col.toLowerCase().includes('account holder') && 
        col.length > 3
      );
      
      if (nameMatch) {
        accountHolder = nameMatch;
      }
    }
    
    // Look for account number patterns
    if (!accountNumber && (rowText.includes('account') && rowText.includes('number'))) {
      // Try to find a numeric-looking part
      const numMatch = rows[i].find(col => /\d{4,}/.test(col));
      if (numMatch) {
        accountNumber = numMatch;
      }
    }
    
    // If we've found both, we can stop early
    if (accountHolder && accountNumber) break;
  }
  
  // Find potential header row - look for date, description, amount
  let headerRowIndex = -1;
  
  // Look for common column header names
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const rowText = rows[i].join(' ').toLowerCase();
    if (
      (rowText.includes('date') && rowText.includes('description')) ||
      (rowText.includes('date') && rowText.includes('amount')) ||
      (rowText.includes('date') && (rowText.includes('debit') || rowText.includes('credit')))
    ) {
      headerRowIndex = i;
      break;
    }
  }
  
  // If we couldn't find a header row, try looking for date patterns in the data
  if (headerRowIndex === -1) {
    for (let i = 10; i < Math.min(50, rows.length); i++) {
      // Look for a row with a date-like field and several other fields
      const hasDatePattern = rows[i].some(cell => 
        /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(cell) || // MM/DD/YYYY or DD/MM/YYYY
        /\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(cell)    // YYYY/MM/DD
      );
      
      if (hasDatePattern && rows[i].length >= 3) {
        headerRowIndex = i - 1; // Assume the previous row is the header
        break;
      }
    }
  }
  
  // If we still don't have a header, return empty result
  if (headerRowIndex === -1) {
    console.warn("Couldn't identify transaction data structure in Excel");
    return {
      account_holder: accountHolder || undefined,
      account_number: accountNumber || undefined,
      transactions: []
    };
  }
  
  // Normalize header row - convert to lowercase and trim
  const headerRow = headerRowIndex >= 0 ? 
    rows[headerRowIndex].map(h => h.toLowerCase().trim()) : 
    ['date', 'description', 'amount'];
  
  // Data rows start after header
  const dataStartIndex = headerRowIndex + 1;
  const dataRows = rows.slice(dataStartIndex);
  
  // Try to identify column indices
  const dateIndex = headerRow.findIndex(h => 
    h.includes('date') || h.includes('time') || h.includes('when')
  );
  
  const descIndex = headerRow.findIndex(h => 
    h.includes('desc') || 
    h.includes('narr') || 
    h.includes('detail') ||
    h.includes('part') ||
    h.includes('ref')
  );
  
  const amountIndex = headerRow.findIndex(h => h.includes('amount'));
  const debitIndex = headerRow.findIndex(h => h.includes('debit'));
  const creditIndex = headerRow.findIndex(h => h.includes('credit'));
  const balanceIndex = headerRow.findIndex(h => h.includes('balance'));
  
  // Fallback - if we can't identify columns by name, try by position
  const fallbackDateIndex = dateIndex !== -1 ? dateIndex : 0;
  const fallbackDescIndex = descIndex !== -1 ? descIndex : 1;
  let fallbackAmountIndex = amountIndex !== -1 ? amountIndex : 2;
  
  if (fallbackAmountIndex === fallbackDescIndex || fallbackAmountIndex === fallbackDateIndex) {
    fallbackAmountIndex = Math.min(3, headerRow.length - 1);
  }
  
  // Extract transactions
  const transactions = dataRows
    .filter(row => row.length >= 3) // Need at least 3 columns for a meaningful transaction
    .map(row => {
      // Use identified indices or fallbacks
      const useDateIndex = dateIndex !== -1 ? dateIndex : fallbackDateIndex;
      const useDescIndex = descIndex !== -1 ? descIndex : fallbackDescIndex;
      const useAmountIndex = amountIndex !== -1 ? amountIndex : fallbackAmountIndex;
      
      // Extract date (try common formats)
      const dateStr = row[useDateIndex] || '';
      let formattedDate = "unknown";
      
      // Try different date formats with regex
      const dateRegexes = [
        // MM/DD/YYYY or DD/MM/YYYY
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        // YYYY/MM/DD
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
      ];
      
      for (const regex of dateRegexes) {
        const match = dateStr.match(regex);
        if (match) {
          // Determine which format this is
          if (match[1].length === 4) {
            // YYYY-MM-DD
            formattedDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
          } else if (parseInt(match[1]) > 12) {
            // DD/MM/YYYY (assuming day > 12)
            const year = match[3].length === 2 ? `20${match[3]}` : match[3];
            formattedDate = `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
          } else {
            // MM/DD/YYYY (assuming US format as default)
            const year = match[3].length === 2 ? `20${match[3]}` : match[3];
            formattedDate = `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
          }
          break;
        }
      }
      
      // Extract description
      const description = row[useDescIndex] || "Unknown transaction";
      
      // Extract amount and determine if credit or debit
      let amount = 0;
      let type = "debit";
      
      // Case: Separate debit and credit columns
      if (debitIndex !== -1 && creditIndex !== -1) {
        const debitStr = row[debitIndex] || '';
        const creditStr = row[creditIndex] || '';
        
        const debitValue = parseFloat(debitStr.replace(/[^0-9.-]/g, ''));
        const creditValue = parseFloat(creditStr.replace(/[^0-9.-]/g, ''));
        
        if (!isNaN(debitValue) && debitValue > 0) {
          amount = debitValue;
          type = "debit";
        } else if (!isNaN(creditValue) && creditValue > 0) {
          amount = creditValue;
          type = "credit";
        }
      } 
      // Case: Single amount column
      else {
        const amountStr = row[useAmountIndex] || '';
        const rawAmount = amountStr.replace(/[^0-9.-]/g, '');
        amount = parseFloat(rawAmount);
        
        if (!isNaN(amount)) {
          // Check if a minus sign is present or if it's a negative number
          if (amountStr.includes('-') || amount < 0) {
            type = "debit";
            amount = Math.abs(amount);
          } else {
            type = "credit";
          }
        }
      }
      
      // Extract balance if available
      let balance;
      if (balanceIndex !== -1 && row[balanceIndex]) {
        balance = parseFloat(row[balanceIndex].replace(/[^0-9.-]/g, ''));
        if (isNaN(balance)) balance = undefined;
      }
      
      return {
        date: formattedDate,
        description,
        amount,
        type,
        balance
      };
    })
    .filter(tx => !isNaN(tx.amount) && tx.amount > 0); // Filter out invalid transactions
  
  return {
    account_holder: accountHolder || undefined,
    account_number: accountNumber || undefined,
    transactions
  };
}
