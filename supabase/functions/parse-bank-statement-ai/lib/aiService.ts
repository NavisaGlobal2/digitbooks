
import { processWithAnthropic } from "./anthropicProcessor.ts";
import { processWithDeepseek } from "./deepseekProcessor.ts";

/**
 * Process extracted text with AI services
 */
export async function processWithAI(text: string, fileType: string, context?: string): Promise<any> {
  // Check available AI providers
  const hasAnthropicKey = !!Deno.env.get("ANTHROPIC_API_KEY");
  const hasDeepseekKey = !!Deno.env.get("DEEPSEEK_API_KEY");
  
  // Check preferred provider if set
  const preferredProvider = Deno.env.get("PREFERRED_AI_PROVIDER")?.toLowerCase() || "anthropic";
  
  console.log(`Available providers: ${hasAnthropicKey ? 'Anthropic, ' : ''}${hasDeepseekKey ? 'DeepSeek' : ''}`);
  console.log(`AI processing: using ${preferredProvider} as preferred provider`);
  
  // Handle PDF files with more detailed instructions
  let enhancedText = text;
  if (fileType === 'pdf') {
    enhancedText += `\n\nThis document is a PDF bank statement. Pay special attention to:
1. Tables containing transaction data
2. Date formats which may vary (MM/DD/YYYY, DD/MM/YYYY, etc.)
3. Negative amounts which may be indicated by parentheses, minus signs, or DR/CR markers
4. Transaction descriptions which may include reference numbers, codes, or merchant names
5. Balance information which may appear at the beginning/end of statement sections

Please extract ALL transactions with accurate dates, descriptions, and amounts.`;
  }
  
  // First try the preferred provider
  if (preferredProvider === "anthropic" && hasAnthropicKey) {
    try {
      return await processWithAnthropic(enhancedText, context);
    } catch (error) {
      console.error("Error processing with Anthropic:", error);
      
      // Fall back to DeepSeek if available
      if (hasDeepseekKey) {
        console.log("Falling back to DeepSeek...");
        return await processWithDeepseek(enhancedText, context);
      } else {
        throw error;
      }
    }
  } else if (preferredProvider === "deepseek" && hasDeepseekKey) {
    try {
      return await processWithDeepseek(enhancedText, context);
    } catch (error) {
      console.error("Error processing with DeepSeek:", error);
      
      // Fall back to Anthropic if available
      if (hasAnthropicKey) {
        console.log("Falling back to Anthropic...");
        return await processWithAnthropic(enhancedText, context);
      } else {
        throw error;
      }
    }
  } else if (hasAnthropicKey) {
    return await processWithAnthropic(enhancedText, context);
  } else if (hasDeepseekKey) {
    return await processWithDeepseek(enhancedText, context);
  } else {
    throw new Error("No AI provider is configured. Please set up either Anthropic API key (ANTHROPIC_API_KEY) or DeepSeek API key (DEEPSEEK_API_KEY) in Supabase.");
  }
}
