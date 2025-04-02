
import { AIInsight } from "@/hooks/useAIInsights";

/**
 * Format financial data for better readability in AI responses
 */
export const formatFinancialDataForAI = (data: any) => {
  if (!data) return {};
  
  // Deep clone to avoid mutations
  const formattedData = JSON.parse(JSON.stringify(data));
  
  // Format currency values if they exist
  if (formattedData.revenues?.total) {
    formattedData.revenues.total = Number(formattedData.revenues.total).toLocaleString('en-NG', {
      maximumFractionDigits: 2
    });
  }
  
  if (formattedData.expenses?.total) {
    formattedData.expenses.total = Number(formattedData.expenses.total).toLocaleString('en-NG', {
      maximumFractionDigits: 2
    });
  }

  // Add derived insights
  if (formattedData.revenues?.total && formattedData.expenses?.total) {
    formattedData.summary = {
      netProfit: (
        Number(data.revenues.total) - Number(data.expenses.total)
      ).toLocaleString('en-NG', {
        maximumFractionDigits: 2
      }),
      profitMargin: data.revenues.total > 0 ? 
        ((Number(data.revenues.total) - Number(data.expenses.total)) / Number(data.revenues.total) * 100).toFixed(1) + '%' :
        '0%'
    };
  }
  
  return formattedData;
};

/**
 * Convert AI insights to a format suitable for the chat
 */
export const convertInsightsToMessages = (insights: AIInsight[]) => {
  if (!insights || !insights.length) return [];
  
  return insights.map((insight, index) => ({
    id: `insight-${index}`,
    content: insight.message,
    sender: "agent" as const,
    timestamp: new Date(),
    type: insight.type
  }));
};
