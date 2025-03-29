
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
      
      console.log(`Processing file: ${fileName}, size: ${fileSize}, type: application/pdf, isRealData: ${forceRealData}, useGoogleVision: ${useGoogleVision}`);
      
      // First try to extract real data using Google Vision API if enabled
      if (useGoogleVision) {
        try {
          // Use a non-recursive approach to handle Vision API processing
          const pdfText = await extractTextWithGoogleVisionSafe(file);
          
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
 */
async function extractTextWithGoogleVisionSafe(file: File): Promise<string> {
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
    
    // Handle large files safely
    if (bytes.length > MAX_CHUNK_SIZE) {
      console.log(`File too large (${bytes.length} bytes), processing first chunk only`);
      
      // Process the first chunk only using a safe approach
      const chunk = bytes.slice(0, MAX_CHUNK_SIZE);
      
      // Convert to base64 in a safe way that won't cause stack overflow
      let base64Chunk = '';
      const binaryChunks = [];
      const SAFE_CHUNK_SIZE = 1024 * 1024; // 1MB sub-chunks for string conversion
      
      for (let i = 0; i < chunk.length; i += SAFE_CHUNK_SIZE) {
        const subChunk = chunk.slice(i, Math.min(i + SAFE_CHUNK_SIZE, chunk.length));
        binaryChunks.push(String.fromCharCode.apply(null, subChunk));
      }
      
      base64Chunk = btoa(binaryChunks.join(''));
      return await processChunkWithVision(base64Chunk, GOOGLE_VISION_API_KEY);
    } else {
      // For smaller files, convert to base64 in a safe way
      let base64 = '';
      const binaryChunks = [];
      const SAFE_CHUNK_SIZE = 1024 * 1024; // 1MB chunks for string conversion
      
      for (let i = 0; i < bytes.length; i += SAFE_CHUNK_SIZE) {
        const chunk = bytes.slice(i, Math.min(i + SAFE_CHUNK_SIZE, bytes.length));
        binaryChunks.push(String.fromCharCode.apply(null, chunk));
      }
      
      base64 = btoa(binaryChunks.join(''));
      return await processChunkWithVision(base64, GOOGLE_VISION_API_KEY);
    }
  } catch (error) {
    console.error("Error calling Google Vision API:", error);
    throw error;
  }
}

/**
 * Process a chunk of data with Vision API
 */
async function processChunkWithVision(base64Data: string, apiKey: string): Promise<string> {
  try {
    // Call Google Vision API
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
    console.error("Error in processChunkWithVision:", error);
    throw error;
  }
}
