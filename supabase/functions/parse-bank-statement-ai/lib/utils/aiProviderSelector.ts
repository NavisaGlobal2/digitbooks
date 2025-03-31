
/**
 * Helper functions for selecting and managing AI providers
 */

// Function to determine which AI provider to use based on preference and available keys
export function selectAIProvider(
  preferredProvider?: string
): { provider: string; reason: string } {
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
  
  // Log all available providers
  const availableProviders = [];
  if (anthropicApiKey) availableProviders.push("Anthropic");
  if (deepseekApiKey) availableProviders.push("DeepSeek");
  
  console.log("Available providers for formatting: " + 
    (availableProviders.length > 0 ? availableProviders.join(", ") : "None")
  );

  // If no providers are available, return none
  if (!anthropicApiKey && !deepseekApiKey) {
    console.log("No AI service configured. Using basic formatting.");
    return { provider: "none", reason: "no API keys configured" };
  }

  // If a preferred provider is specified and available, use it
  if (preferredProvider === "anthropic" && anthropicApiKey) {
    console.log("Using anthropic for transaction formatting (preferred)");
    return { provider: "anthropic", reason: "preferred" };
  } else if (preferredProvider === "deepseek" && deepseekApiKey) {
    console.log("Using deepseek for transaction formatting (preferred)");
    return { provider: "deepseek", reason: "preferred" };
  }
  
  // Default provider selection logic
  if (anthropicApiKey) {
    console.log("Using anthropic for transaction formatting (default)");
    return { provider: "anthropic", reason: "default" };
  } else if (deepseekApiKey) {
    console.log("Using deepseek for transaction formatting (fallback)");
    return { provider: "deepseek", reason: "available" };
  }
  
  // Should never reach here but TypeScript needs a return
  return { provider: "none", reason: "no valid provider" };
}
