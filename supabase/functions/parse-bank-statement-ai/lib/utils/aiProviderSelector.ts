
/**
 * Helper functions for selecting and managing AI providers
 */

// Function to determine which AI provider to use based on preference and available keys
export function selectAIProvider(
  preferredProvider?: string
): { provider: string; reason: string } {
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
  
  console.log("Available providers for formatting: " + 
    (anthropicApiKey ? "Anthropic, " : "") + 
    (deepseekApiKey ? "DeepSeek" : "")
  );

  // Default to Anthropic if available, unless DeepSeek is specifically requested
  let useAnthropicByDefault = !!anthropicApiKey;
  
  // If a preferred provider is specified, try to use it
  if (preferredProvider === "anthropic" && anthropicApiKey) {
    console.log("Using anthropic for transaction formatting");
    return { provider: "anthropic", reason: "preferred" };
  } else if (preferredProvider === "deepseek" && deepseekApiKey) {
    console.log("Using deepseek for transaction formatting");
    return { provider: "deepseek", reason: "preferred" };
  } else if (useAnthropicByDefault) {
    console.log("Using anthropic for transaction formatting (default)");
    return { provider: "anthropic", reason: "default" };
  } else if (deepseekApiKey) {
    console.log("Using deepseek for transaction formatting (fallback)");
    return { provider: "deepseek", reason: "fallback" };
  } else {
    // No AI service available
    console.log("No AI service configured. Using basic formatting.");
    return { provider: "none", reason: "no API keys configured" };
  }
}
