
import { corsHeaders } from "./cors.ts";
import { validateFile, extractTextFromFile } from "./fileExtractor.ts";
import { processWithAnthropic } from "./anthropicClient.ts";
import { createResponse } from "./responseHelper.ts";

// Main request handler
export async function handleRequest(req: Request): Promise<Response> {
  try {
    // Validate that Anthropic API key exists
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return createResponse({ 
        error: "ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase." 
      }, 500);
    }

    // Parse the request body - this will contain our file
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return createResponse({ error: "No file uploaded" }, 400);
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    try {
      // Validate the file
      validateFile(file);
      
      // Generate batch ID for tracking
      const batchId = crypto.randomUUID();
      
      // Extract text from the file
      const fileText = await extractTextFromFile(file);
      
      // Process with Anthropic
      const transactions = await processWithAnthropic(fileText);
      
      console.log(`Parsed ${transactions.length} transactions from file`);
      
      return createResponse({ 
        success: true, 
        transactions,
        message: `Successfully processed ${transactions.length} transactions`, 
        batchId
      });
    } catch (processingError) {
      console.error("Processing error:", processingError);
      
      // Check if error is related to Anthropic API key
      const errorMessage = processingError.message || "Unknown processing error";
      if (
        errorMessage.includes("Anthropic API rate limit") || 
        errorMessage.includes("Anthropic") && 
        errorMessage.includes("API key")
      ) {
        return createResponse({ 
          error: "Anthropic API key issue: " + errorMessage
        }, 500);
      }
      
      return createResponse({ error: errorMessage }, 500);
    }
  } catch (error) {
    console.error("Server error:", error);
    return createResponse({ 
      error: error.message || "Unknown server error" 
    }, 500);
  }
}
