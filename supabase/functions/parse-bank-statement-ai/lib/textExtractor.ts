
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
      const safeProcessing = options?.safeProcessing === true;
      const strictExtractMode = options?.strictExtractMode === true;
      const disableFakeData = options?.disableFakeDataGeneration === true;
      const returnEmptyOnFailure = options?.returnEmptyOnFailure === true;
      
      console.log(`Processing PDF file: ${fileName}, size: ${fileSize}, useGoogleVision: ${useGoogleVision}, forceRealData: ${forceRealData}, safeProcessing: ${safeProcessing}, strictExtractMode: ${strictExtractMode}, returnEmptyOnFailure: ${returnEmptyOnFailure}`);
      
      // First try to extract real data using Google Vision API if enabled
      if (useGoogleVision) {
        try {
          console.log("🔍 Attempting to extract text with Google Vision API...");
          
          // Get API key and log its presence (not the actual key)
          const apiKey = Deno.env.get("GOOGLE_VISION_API_KEY");
          console.log("🔑 Google Vision API Key is loaded:", !!apiKey);
          
          if (!apiKey) {
            console.error("❌ Google Vision API key is not configured");
            throw new Error('Google Vision API key is not configured');
          }
          
          // IMPROVED: More robust base64 conversion with progress logs
          console.log(`🔄 Starting PDF to base64 conversion for ${fileName} (${fileSize})`);
          const arrayBuffer = await file.arrayBuffer();
          console.log(`✅ Successfully obtained arrayBuffer of size: ${arrayBuffer.byteLength} bytes`);
          
          // Use the improved base64 encoding function
          const base64 = await safeArrayBufferToBase64(arrayBuffer);
          console.log(`📦 Base64 conversion complete. Content length: ${base64.length} chars`);
          
          if (base64.length < 100) {
            console.error("❌ Base64 encoding failed or file is too small");
            throw new Error('Base64 encoding failed - file may be corrupted');
          }
          
          if (base64) {
            const pdfText = await callVisionAPI(base64, apiKey);
            
            if (pdfText && pdfText.length > 100) {
              console.log('✅ Successfully extracted text from PDF with Google Vision API');
              console.log(`✅ Extracted ${pdfText.length} characters of text`);
              console.log('Sample of extracted text:', pdfText.substring(0, 200) + '...');
              
              // Log a unique identifier to confirm Google Vision is being called
              console.log('VISION_API_EXTRACTION_SUCCESS_MARKER');
              
              // Add a clear marker to indicate real extracted content and explicitly prevent dummy data
              return `[PDF BANK STATEMENT EXTRACTED WITH GOOGLE VISION API: ${fileName} (${fileSize})]

ACTUAL STATEMENT TEXT FOLLOWS:
${pdfText}

CRITICAL INSTRUCTION FOR AI: This is REAL text extracted from an ACTUAL bank statement PDF.
1. Process the above text to find all financial transactions
2. Format each transaction with date (YYYY-MM-DD), description, and amount
3. For amounts, preserve negative values for debits and positive values for credits
4. Return ONLY genuine transactions found in this text, NEVER invent data
5. If you can't clearly identify transactions, return an empty array []
6. The user's financial decisions depend on this data being accurate
7. DO NOT generate fictional or placeholder transactions under ANY circumstances
8. If extraction fails or text is unclear, RETURN AN EMPTY ARRAY
9. THIS IS REAL DATA, NOT A TEST - I REPEAT, DO NOT GENERATE EXAMPLE DATA`;
            } else {
              console.warn("⚠️ Google Vision API returned insufficient text:", pdfText?.length || 0, "characters");
              
              if (returnEmptyOnFailure) {
                console.log("⚠️ Returning empty array instruction due to insufficient Vision API text");
                return `[EMPTY PDF EXTRACTION - NO SUFFICIENT TEXT DETECTED]

CRITICAL INSTRUCTION: No clear text could be extracted from this PDF.
RETURN AN EMPTY ARRAY [] - DO NOT GENERATE ANY EXAMPLE OR FICTIONAL DATA.
This is critically important - the user requires only real data.`;
              }
            }
          } else {
            console.error("❌ Failed to convert PDF to base64");
          }
        } catch (visionError) {
          console.error("❌ Google Vision extraction failed:", visionError);
          
          if (returnEmptyOnFailure) {
            console.log("⚠️ Returning empty array instruction due to Vision API error");
            return `[VISION API ERROR - NO TEXT EXTRACTED]

CRITICAL INSTRUCTION: Vision API failed to extract text from this PDF.
RETURN AN EMPTY ARRAY [] - DO NOT GENERATE ANY EXAMPLE OR FICTIONAL DATA.
This is critically important - the user requires only real data.`;
          }
        }
      } else {
        console.warn("⚠️ Google Vision API is disabled for this request");
      }
      
      // Fallback to the original method if Google Vision fails or is disabled
      const realDataEmphasis = `

CRITICAL NOTICE: YOU MUST ONLY EXTRACT REAL TRANSACTIONS FROM THE DOCUMENT.
NEVER GENERATE FICTIONAL TRANSACTIONS, EVEN IF YOU CANNOT CLEARLY IDENTIFY ANY.
RETURNING AN EMPTY ARRAY IS BETTER THAN GENERATING FICTIONAL DATA.
THE USER'S FINANCIAL DECISIONS DEPEND ON THIS DATA BEING ACCURATE.
I REPEAT: DO NOT UNDER ANY CIRCUMSTANCES GENERATE EXAMPLE DATA.`;

      const strictModeInstructions = `
STRICT EXTRACTION MODE IS ENABLED:
- Only extract transactions that you can clearly identify with high confidence
- If text is unclear, return an empty array rather than guessing
- DO NOT try to be helpful by generating examples of what the data might look like
- If in doubt, return LESS data rather than potentially incorrect data
- RETURNING AN EMPTY ARRAY [] IS THE CORRECT RESPONSE WHEN NO CLEAR TRANSACTIONS ARE FOUND`;

      return `[PDF BANK STATEMENT: ${fileName} (${fileSize})]

CRITICAL INSTRUCTION FOR AI: You are extracting REAL financial data from an ACTUAL bank statement PDF.
1. The user has uploaded a GENUINE bank statement containing REAL transactions
2. Your task is to extract the ACTUAL transactions visible in this document
3. DO NOT generate fictional or placeholder transactions under any circumstances
4. If you can't extract transactions clearly, return an empty array - NEVER invent data
5. When extracting, look for patterns like dates, descriptions, and amounts that represent real transactions
6. Format dates as YYYY-MM-DD, preserve complete descriptions, and represent amounts as numbers
7. Mark negative values as debits and positive values as credits
8. The user's financial decisions depend on this data being accurate${realDataEmphasis}${strictModeInstructions}

RESPOND ONLY with a valid JSON array of real transactions extracted from the statement.
IF NO CLEAR TRANSACTIONS ARE FOUND, RESPOND WITH [] (an empty array).`;
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
 * IMPROVED: Safer base64 conversion for large PDFs
 * This implementation handles large PDFs more reliably by:
 * 1. Using a smaller chunk size
 * 2. Adding proper error handling
 * 3. Using a more efficient encoding approach
 */
async function safeArrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log(`🔄 Starting base64 conversion of ${buffer.byteLength} bytes`);
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 512; // Smaller chunks to prevent call stack issues
    const totalChunks = Math.ceil(bytes.length / chunkSize);
    
    console.log(`🔄 Converting in ${totalChunks} chunks of ${chunkSize} bytes each`);
    
    // Process in smaller chunks with progress logging
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunkIndex = Math.floor(i / chunkSize) + 1;
      if (chunkIndex % 20 === 0) {
        // Log progress every 20 chunks to avoid console flooding
        console.log(`🔄 Base64 conversion progress: ${Math.round((chunkIndex / totalChunks) * 100)}% (chunk ${chunkIndex}/${totalChunks})`);
      }
      
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      
      // Alternative approach to avoid Array.from + map which can be slow
      let binaryChunk = '';
      for (let j = 0; j < chunk.length; j++) {
        binaryChunk += String.fromCharCode(chunk[j]);
      }
      
      binary += binaryChunk;
    }
    
    console.log(`✅ Binary conversion complete, encoding to base64...`);
    
    try {
      // Use btoa for the final encoding step
      const result = btoa(binary);
      console.log(`✅ Base64 encoding successful, length: ${result.length}`);
      return result;
    } catch (btoaError) {
      // If btoa fails (which might happen with very large strings), try an alternative approach
      console.warn(`⚠️ Standard btoa failed, trying alternative method: ${btoaError}`);
      return fallbackBase64Encode(binary);
    }
  } catch (error) {
    console.error(`❌ Base64 conversion failed: ${error}`);
    throw new Error(`Base64 conversion failed: ${error.message}`);
  }
}

/**
 * Fallback base64 encoding function for cases where btoa fails
 * This implements a manual base64 encoding for large strings
 */
function fallbackBase64Encode(binaryString: string): string {
  console.log(`🔄 Using fallback base64 encoding for string of length ${binaryString.length}`);
  
  // Base64 character table
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  // Process 3 bytes at a time
  while (i < binaryString.length) {
    const a = binaryString.charCodeAt(i++) || 0;
    const b = binaryString.charCodeAt(i++) || 0;
    const c = binaryString.charCodeAt(i++) || 0;
    
    const triplet = (a << 16) | (b << 8) | c;
    
    // Extract 4 6-bit chunks and convert to base64 characters
    for (let j = 18; j >= 0; j -= 6) {
      const index = (triplet >> j) & 0x3F; // Get 6 bits
      result += base64Chars[index];
    }
  }
  
  // Handle padding
  const padding = binaryString.length % 3;
  if (padding === 1) {
    result = result.slice(0, -2) + '==';
  } else if (padding === 2) {
    result = result.slice(0, -1) + '=';
  }
  
  console.log(`✅ Fallback base64 encoding complete, length: ${result.length}`);
  return result;
}

/**
 * Call Google Vision API with proper error handling
 */
async function callVisionAPI(base64Data: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Google Vision API key is not configured');
  }

  try {
    console.log("🔍 Calling Google Vision API...");
    console.log(`Using API key with length: ${apiKey.length} chars`);
    
    // Create the proper request body for Google Vision API with base64 content
    const requestBody = JSON.stringify({
      requests: [
        {
          image: {
            content: base64Data  // Make sure we're sending the base64 string directly
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',  // Use DOCUMENT_TEXT_DETECTION for better results with documents
              maxResults: 1
            }
          ]
        }
      ]
    });
    
    // Log request size but not content
    console.log(`📦 Request body size: ${requestBody.length} chars`);
    
    // Make the API request
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    });
    
    console.log("📡 Vision API status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vision API error status: ${response.status}`);
      console.error(`Vision API error response: ${errorText}`);
      throw new Error(`Google Vision API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log("📨 Vision API response received");
    
    // Log important parts of the response for debugging
    if (data.responses) {
      // Check for errors in the response
      if (data.responses[0].error) {
        console.error("❌ Vision API returned error:", JSON.stringify(data.responses[0].error, null, 2));
        throw new Error(`Google Vision API error: ${data.responses[0].error.message}`);
      }
      
      // Check if text was extracted
      if (data.responses[0].fullTextAnnotation) {
        console.log("✅ Text annotation found in response");
        console.log(`✅ Text length: ${data.responses[0].fullTextAnnotation.text.length}`);
      } else {
        console.warn("⚠️ No fullTextAnnotation in Vision API response");
        console.log("Response structure:", JSON.stringify(data, null, 2).substring(0, 500) + "...");
      }
    } else {
      console.warn("⚠️ Unexpected Vision API response format");
    }
    
    // Extract text from response
    if (data.responses && 
        data.responses[0] && 
        data.responses[0].fullTextAnnotation && 
        data.responses[0].fullTextAnnotation.text) {
      const extractedText = data.responses[0].fullTextAnnotation.text;
      console.log(`✅ Successfully extracted ${extractedText.length} characters of text`);
      return extractedText;
    } else {
      console.warn("⚠️ Google Vision API returned no text:", JSON.stringify(data, null, 2).substring(0, 500) + "...");
      return '';
    }
  } catch (error) {
    console.error("❌ Error in callVisionAPI:", error);
    throw error;
  }
}
