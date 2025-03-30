
import { toast } from "sonner";

/**
 * Prepares a PDF for OCR processing by converting it to images
 * and extracting text via Google Vision API
 */
export const processPdfAsImages = async (
  file: File,
  onSuccess: (data: any) => void,
  onError: (errorMessage: string) => boolean,
  setIsProcessingPdf?: (isProcessing: boolean) => void
): Promise<boolean> => {
  try {
    if (setIsProcessingPdf) {
      setIsProcessingPdf(true);
    }
    
    console.log("🔄 Converting PDF to images for OCR processing:", file.name);
    
    // Create FormData with the PDF file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "pdf-to-image");
    
    // Get Supabase URL from environment or config
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/pdf-ocr-processor`;
    
    // Get auth token (you'll need to implement this or reuse existing auth)
    const { getAuthToken } = await import("./authHandler");
    const { token, error } = await getAuthToken();
    
    if (error || !token) {
      console.error("❌ Authentication error:", error);
      if (setIsProcessingPdf) {
        setIsProcessingPdf(false);
      }
      return onError(error || "Authentication error occurred");
    }
    
    console.log("🔄 Sending PDF for image conversion and OCR processing...");
    
    const response = await fetch(edgeFunctionEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ PDF image conversion failed:", errorText);
      
      if (setIsProcessingPdf) {
        setIsProcessingPdf(false);
      }
      
      return onError(`Failed to process PDF: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      console.error("❌ PDF image conversion failed:", result.error);
      
      if (setIsProcessingPdf) {
        setIsProcessingPdf(false);
      }
      
      return onError(result.error || "Failed to convert PDF to images");
    }
    
    console.log("✅ PDF successfully converted to images and processed:", result);
    
    if (setIsProcessingPdf) {
      setIsProcessingPdf(false);
    }
    
    // Store URLs and extracted text
    if (result.imageUrls && result.imageUrls.length > 0) {
      console.log(`📊 Generated ${result.imageUrls.length} images from PDF`);
    }
    
    if (result.extractedText) {
      console.log("📝 Successfully extracted text from PDF images");
    }
    
    onSuccess(result);
    return true;
  } catch (error: any) {
    console.error("❌ Error in processPdfAsImages:", error);
    
    if (setIsProcessingPdf) {
      setIsProcessingPdf(false);
    }
    
    return onError(error.message || "Failed to convert PDF to images");
  }
};

/**
 * Parse text from a PDF using OCR technology
 * This function extracts text and attempts to organize it in a structured format
 */
export const extractStructuredDataFromPdf = (
  extractedText: string
): { transactions: any[], metadata: any } => {
  console.log("🔄 Attempting to extract structured data from PDF text");
  
  // Simple transaction pattern matching (this is a basic example)
  const transactionPattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+([A-Z0-9\s]+)\s+(\$?\d+\.\d{2})/gi;
  const transactions = [];
  let match;
  
  while ((match = transactionPattern.exec(extractedText)) !== null) {
    transactions.push({
      date: match[1],
      description: match[2].trim(),
      amount: match[3],
      type: match[3].includes('-') ? 'debit' : 'credit'
    });
  }
  
  // Extract metadata (very basic example)
  const metadata = {
    statementDate: extractStatementDate(extractedText),
    accountNumber: extractAccountNumber(extractedText),
    bankName: extractBankName(extractedText)
  };
  
  console.log(`✅ Extracted ${transactions.length} potential transactions from PDF text`);
  
  return {
    transactions,
    metadata
  };
};

/**
 * Helper function to extract statement date from text
 */
function extractStatementDate(text: string): string | null {
  // This is a simplified example - in production you'd want more robust patterns
  const datePattern = /statement\s+(?:date|period)[\s:]+([a-zA-Z0-9\s,\/]+)/i;
  const match = text.match(datePattern);
  return match ? match[1].trim() : null;
}

/**
 * Helper function to extract account number from text
 */
function extractAccountNumber(text: string): string | null {
  // This is a simplified example - in production you'd want more robust patterns
  const accountPattern = /account\s+(?:number|#)[\s:]+([a-zA-Z0-9\s\-*]+)/i;
  const match = text.match(accountPattern);
  return match ? match[1].trim() : null;
}

/**
 * Helper function to extract bank name from text
 */
function extractBankName(text: string): string | null {
  // Common bank names to look for
  const banks = ['chase', 'bank of america', 'wells fargo', 'citibank', 'capital one'];
  
  for (const bank of banks) {
    if (text.toLowerCase().includes(bank)) {
      return bank.charAt(0).toUpperCase() + bank.slice(1);
    }
  }
  
  return null;
}
