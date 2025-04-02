
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { financialData } = await req.json();
    
    if (!financialData) {
      throw new Error("Financial data is required");
    }

    console.log("Generating insights for financial data:", 
      JSON.stringify(financialData, null, 2).substring(0, 200) + "...");

    // Create system prompt for financial insights
    const systemPrompt = `You are an expert financial analyst specialized in small business finances. 
Your job is to analyze financial data and provide insightful, actionable observations.
Each insight should be concise (under 70 characters), actionable, and highlight something meaningful.
For each insight, categorize it as one of: "success", "warning", "error", "info".

Based on the provided financial data, generate 5 insights that are:
1. Specific - refer to actual numbers and percentages
2. Actionable - suggest what action might be taken
3. Diverse - cover different aspects of the business (revenue, expenses, cashflow, etc.)
4. Well-categorized - use "success" for positive trends, "warning" for concerns, "error" for serious issues, and "info" for neutral observations`;

    try {
      // Call Anthropic API with retries
      let retries = 2;
      let response;
      let error;
      
      while (retries >= 0) {
        try {
          response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: "claude-3-haiku-20240307",
              max_tokens: 1024,
              system: systemPrompt,
              messages: [
                {
                  role: "user",
                  content: `Here is the financial data to analyze: ${JSON.stringify(financialData)}. 
                  Generate 5 insights formatted as a JSON array of objects with "message" and "type" properties.`
                }
              ]
            }),
          });
          
          if (response.ok) {
            break;
          }
          
          error = await response.text();
          console.error(`Attempt ${2-retries} failed with status ${response.status}: ${error}`);
        } catch (err) {
          error = err;
          console.error(`Attempt ${2-retries} failed with error:`, err);
        }
        
        retries--;
        if (retries >= 0) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (2-retries)));
        }
      }

      if (!response || !response.ok) {
        console.error("All attempts failed:", error);
        throw new Error(`Failed to connect to Anthropic API: ${error}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "";
      
      // Extract JSON from response if needed
      let insights = [];
      try {
        // Try to find JSON in the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
        } else {
          // Parse the entire response as JSON if no brackets found
          insights = JSON.parse(content);
        }
        
        // Validate insights structure
        insights = insights.map(insight => ({
          message: String(insight.message || "").substring(0, 100),
          type: ["success", "warning", "error", "info"].includes(insight.type) 
            ? insight.type 
            : "info"
        })).slice(0, 5);

        console.log("Successfully generated insights:", insights);
      } catch (error) {
        console.error("Error parsing insights:", error, "Raw content:", content);
        throw new Error("Failed to parse insights from AI response");
      }

      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error("Anthropic API request error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Error generating insights"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
