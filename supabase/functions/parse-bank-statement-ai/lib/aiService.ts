
import { processWithAnthropic } from "./anthropicProcessor.ts";
import { processWithDeepseek } from "./deepseekProcessor.ts";
import { fallbackCSVProcessing } from "./fallbackProcessor.ts";

/**
 * Handles provider selection and fallback logic
 */
export async function processWithAI(text: string, fileType: string, context?: string): Promise<any[]> {
  // Check which providers are available
  const hasAnthropic = !!Deno.env.get("ANTHROPIC_API_KEY");
  const hasDeepseek = !!Deno.env.get("DEEPSEEK_API_KEY");
  
  // Get preferred provider from env or default to "anthropic"
  const preferredProvider = Deno.env.get("PREFERRED_AI_PROVIDER") || "anthropic";
  
  console.log(`AI processing: using ${preferredProvider} as preferred provider`);
  console.log(`Available providers: ${hasAnthropic ? 'Anthropic' : ''}${hasDeepseek ? ', DeepSeek' : ''}`);
  console.log(`Processing context: ${context || 'unknown'}`);

  if (!hasAnthropic && !hasDeepseek) {
    throw new Error("No AI providers are configured. Please configure at least one AI provider in the settings.");
  }

  // Try with preferred provider first
  try {
    if (preferredProvider === "deepseek" && hasDeepseek) {
      return await processWithDeepseek(text, context);
    } else if (preferredProvider === "anthropic" && hasAnthropic) {
      return await processWithAnthropic(text, context);
    } else {
      // If preferred provider is not available, throw an error to trigger fallback
      throw new Error(`Preferred provider ${preferredProvider} is not configured`);
    }
  } catch (error) {
    console.error(`Error processing with ${preferredProvider}:`, error);
    
    // Try fallback to the other provider
    try {
      // If we failed with Anthropic and DeepSeek is available, try DeepSeek
      if (preferredProvider === "anthropic" && hasDeepseek) {
        console.log("Falling back to DeepSeek...");
        return await processWithDeepseek(text, context);
      }
      // If we failed with DeepSeek and Anthropic is available, try Anthropic
      else if (preferredProvider === "deepseek" && hasAnthropic) {
        console.log("Falling back to Anthropic...");
        return await processWithAnthropic(text, context);
      }
    } catch (fallbackError) {
      console.error("Fallback provider also failed:", fallbackError);
    }
    
    // If both providers fail or are not available, try CSV fallback
    if (fileType.toLowerCase() === "csv") {
      console.log("All AI providers failed. Using CSV fallback processor...");
      return await fallbackCSVProcessing(text, context);
    }
    
    // If it's not a CSV or all methods fail, propagate the error
    throw new Error(`AI processing failed with all available providers and no suitable fallback found. Original error: ${error.message}`);
  }
}
