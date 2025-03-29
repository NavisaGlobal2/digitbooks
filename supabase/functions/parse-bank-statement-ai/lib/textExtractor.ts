
/**
 * Extract text from various file types
 */
export async function extractTextFromFile(file: File, options: any = {}): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    try {
      // For PDFs, create a more detailed instruction set for the AI that emphasizes real data extraction
      const fileName = file.name;
      const fileSize = Math.round(file.size / 1024) + ' KB';
      const useGoogleVision = options?.useVision !== false;
      const forceRealData = options?.forceRealData === true;
      const safeProcessing = options?.safeProcessing === true; // New flag for safe processing
      
      console.log(`Processing file: ${fileName}, size: ${fileSize}, type: application/pdf, isRealData: ${forceRealData}, useGoogleVision: ${useGoogleVision}, safeProcessing: ${safeProcessing}`);
      
      // First try to extract real data using Google Vision API if enabled
      if (useGoogleVision) {
        try {
          // Use a non-recursive approach to handle Vision API processing with memory safety
          const pdfText = await extractTextWithGoogleVisionSafe(file, safeProcessing);
          
          if (pdfText && pdfText.length > 100) {
            console.log('Successfully extracted text from PDF with Google Vision API');
            
            // Return with special marker to indicate real extracted content
            return `[PDF BANK STATEMENT EXTRACTED WITH GOOGLE VISION API: ${fileName} (${fileSize})]

ACTUAL STATEMENT TEXT FOLLOWS:
${pdfText}

CRITICAL INSTRUCTION FOR AI: This is REAL text extracted from an ACTUAL bank statement PDF.
1. Process the above text to find all financial transactions
2. Format each transaction with date (YYYY-MM-DD), description, and amount
3. For amounts, preserve negative values for debits and positive values for credits
4. Return ONLY genuine transactions found in this text, NEVER invent data
5. If you can't clearly identify transactions, return an empty array
6. The user's financial decisions depend on this data being accurate
7. DO NOT generate fictional or placeholder transactions under ANY circumstances`;
          }
        } catch (visionError) {
          console.error("Google Vision extraction failed, falling back to AI prompt:", visionError);
        }
      }
      
      // Fallback to the original method if Google Vision fails or is disabled
      const realDataEmphasis = forceRealData ? `

CRITICAL NOTICE: YOU MUST ONLY EXTRACT REAL TRANSACTIONS FROM THE DOCUMENT.
NEVER GENERATE FICTIONAL TRANSACTIONS, EVEN IF YOU CANNOT CLEARLY IDENTIFY ANY.
RETURNING AN EMPTY ARRAY IS BETTER THAN GENERATING FICTIONAL DATA.
THE USER'S FINANCIAL DECISIONS DEPEND ON THIS DATA BEING ACCURATE.` : '';

      return `[PDF BANK STATEMENT: ${fileName} (${fileSize})]

CRITICAL INSTRUCTION FOR AI: You are extracting REAL financial data from an ACTUAL bank statement PDF.
1. The user has uploaded a GENUINE bank statement containing REAL transactions
2. Your task is to extract the ACTUAL transactions visible in this document
3. DO NOT generate fictional or placeholder transactions under any circumstances
4. If you can't extract transactions clearly, return an empty array - NEVER invent data
5. When extracting, look for patterns like dates, descriptions, and amounts that represent real transactions
6. Format dates as YYYY-MM-DD, preserve complete descriptions, and represent amounts as numbers
7. Mark negative values as debits and positive values as credits
8. The user's financial decisions depend on this data being accurate${realDataEmphasis}

RESPOND ONLY with a valid JSON array of real transactions extracted from the statement.`;
    } catch (error) {
      console.error("Error creating PDF prompt:", error);
      throw new Error(`Failed to process PDF file: ${error.message}`);
    }
  } else if (fileType === 'csv') {
    // For CSV, we can read the text directly
    return await file.text();
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    // For Excel files, return a structured prompt
    return `[THIS IS AN EXCEL FILE: ${file.name}]\n\nPlease extract financial transactions from this Excel bank statement.`;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Extract text from PDF using Google Vision API - safe implementation that avoids stack overflow
 * With added safeguards against memory issues
 */
async function extractTextWithGoogleVisionSafe(file: File, safeMode = false): Promise<string> {
  const GOOGLE_VISION_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");
  
  if (!GOOGLE_VISION_API_KEY) {
    throw new Error('Google Vision API key is not configured');
  }

  try {
    // Convert file to base64 without recursive calls
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // For large files, we need to chunk the process
    // Google Vision has limitations on input size
    const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    
    // Memory-safe processing strategy for large files
    if (bytes.length > MAX_CHUNK_SIZE || safeMode) {
      console.log(`Using safe chunking approach for PDF (${bytes.length} bytes)`);
      
      // Process only a portion of the file in safe mode to ensure we don't hit stack limits
      // For most bank statements, important transaction data is in the first few pages
      const processingSize = safeMode ? 
        Math.min(2 * 1024 * 1024, bytes.length) : // 2MB in safe mode
        Math.min(MAX_CHUNK_SIZE, bytes.length);
      
      const chunk = bytes.slice(0, processingSize);
      
      // Convert to base64 using iterative approach instead of recursive
      return await chunkToBase64AndProcess(chunk, GOOGLE_VISION_API_KEY);
    } else {
      // For smaller files, use the same safe approach
      return await chunkToBase64AndProcess(bytes, GOOGLE_VISION_API_KEY);
    }
  } catch (error) {
    console.error("Error in extractTextWithGoogleVisionSafe:", error);
    throw error;
  }
}

/**
 * Memory-efficient conversion of byte array to base64 and Vision API processing
 * Uses an iterative approach to avoid recursion stack issues
 */
async function chunkToBase64AndProcess(bytes: Uint8Array, apiKey: string): Promise<string> {
  try {
    // Use a safe chunk size for string conversion to avoid call stack issues
    const SAFE_CHUNK_SIZE = 256 * 1024; // 256KB sub-chunks for string conversion
    let base64 = '';
    
    // Iterative approach instead of using .apply which can cause stack overflow
    for (let i = 0; i < bytes.length; i += SAFE_CHUNK_SIZE) {
      const subChunk = bytes.slice(i, Math.min(i + SAFE_CHUNK_SIZE, bytes.length));
      const binaryString = Array.from(subChunk)
        .map(byte => String.fromCharCode(byte))
        .join('');
      base64 += btoa(binaryString);
    }
    
    // Call Vision API with the base64 data
    return await callVisionAPI(base64, apiKey);
  } catch (error) {
    console.error("Error in chunkToBase64AndProcess:", error);
    throw new Error(`PDF processing error: ${error.message}`);
  }
}

/**
 * Call Google Vision API with proper error handling
 */
async function callVisionAPI(base64Data: string, apiKey: string): Promise<string> {
  try {
    console.log("Calling Google Vision API...");
    
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Data
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Vision API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract text from response
    if (data.responses && 
        data.responses[0] && 
        data.responses[0].fullTextAnnotation && 
        data.responses[0].fullTextAnnotation.text) {
      return data.responses[0].fullTextAnnotation.text;
    } else {
      console.warn("Google Vision API returned no text:", data);
      return '';
    }
  } catch (error) {
    console.error("Error in callVisionAPI:", error);
    throw error;
  }
}
