
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ParsedTransaction } from '../types';

/**
 * Process PDF using OCR.space API via Supabase Edge Function
 */
export const processPdfWithOcrSpace = async (
  file: File,
  onSuccess: (data: { extractedText: string, transactions?: ParsedTransaction[] }) => void,
  onError: (errorMessage: string) => boolean
): Promise<boolean> => {
  try {
    // First upload the PDF to Supabase storage
    console.log("🔄 Uploading PDF to Supabase storage for OCR processing:", file.name);
    toast.info("Uploading PDF to storage...");
    
    // Generate a unique file name to avoid collisions
    const timestamp = new Date().getTime();
    const fileName = `bank-statements/${timestamp}-${file.name.replace(/\s+/g, '_')}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('expense-documents')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error("❌ Failed to upload PDF:", uploadError);
      return onError(`Failed to upload PDF: ${uploadError.message}`);
    }
    
    // Get a public or signed URL for the uploaded file
    console.log("✅ PDF uploaded successfully");
    toast.success("PDF uploaded to storage");
    
    // Create a public URL or signed URL for the file
    const { data: urlData } = await supabase.storage
      .from('expense-documents')
      .createSignedUrl(fileName, 3600); // URL valid for 1 hour
    
    if (!urlData || !urlData.signedUrl) {
      console.error("❌ Failed to get signed URL");
      return onError("Failed to get URL for uploaded PDF");
    }
    
    const pdfUrl = urlData.signedUrl;
    console.log("🔄 Generated signed URL for OCR processing");
    
    // Call the Supabase Edge Function for OCR
    toast.info("Processing PDF with OCR...");
    console.log("🔄 Calling OCR function with PDF URL");
    
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError || !authData?.session?.access_token) {
      console.error("❌ Authentication error:", authError);
      return onError("Authentication error, please sign in to process PDFs");
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/ocr-bank-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify({
        pdfUrl: pdfUrl
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OCR processing failed:", errorText);
      return onError(`OCR processing failed: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.text) {
      console.error("❌ No text extracted from PDF");
      return onError("No text could be extracted from the PDF");
    }
    
    console.log("✅ Successfully extracted text from PDF");
    toast.success("Text extracted from PDF");
    
    // Extract basic transaction patterns from the OCR text
    const extractedText = result.text;
    const transactions = extractTransactionsFromText(extractedText);
    
    console.log(`📊 Extracted ${transactions.length} potential transactions from OCR text`);
    
    onSuccess({ 
      extractedText,
      transactions: transactions.length > 0 ? transactions : undefined
    });
    return true;
    
  } catch (error: any) {
    console.error("❌ Error in processPdfWithOcrSpace:", error);
    return onError(error.message || "Failed to process PDF with OCR");
  }
};

/**
 * Extracts potential transactions from OCR text using pattern matching
 * This is a basic implementation - could be enhanced with more sophisticated parsing
 */
function extractTransactionsFromText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  // Common date patterns
  const datePatterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    // Month DD, YYYY
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{2,4}/i,
    // YYYY-MM-DD
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/
  ];
  
  // Amount patterns
  const amountPattern = /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
  
  // Split text into lines
  const lines = text.split("\n");
  
  for (const line of lines) {
    // Skip very short lines
    if (line.trim().length < 10) continue;
    
    let transactionDate = null;
    
    // Try to find a date in the line
    for (const pattern of datePatterns) {
      const dateMatch = line.match(pattern);
      if (dateMatch) {
        transactionDate = dateMatch[0];
        break;
      }
    }
    
    // Only proceed if we found a date (likely a transaction line)
    if (transactionDate) {
      // Try to find an amount
      const amountMatch = line.match(amountPattern);
      const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : null;
      
      // Extract description (everything that's not the date or amount)
      let description = line;
      
      // Remove the date and amount from the description
      if (transactionDate) {
        description = description.replace(transactionDate, '');
      }
      if (amount) {
        description = description.replace(amountPattern, '');
      }
      
      // Clean up the description
      description = description.trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .replace(/^\s*[\-\*•]+\s*/, ''); // Remove bullets/dashes from the beginning
      
      // Only add if we have minimum required fields
      if (description && (amount || amount === '0')) {
        transactions.push({
          date: formatDateString(transactionDate),
          description: description,
          amount: parseFloat(amount),
          type: amount.includes('-') ? 'debit' : 'credit'
        });
      }
    }
  }
  
  return transactions;
}

/**
 * Try to convert various date formats to YYYY-MM-DD
 */
function formatDateString(dateStr: string): string {
  try {
    // Try to parse the date
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
    }
    
    // If direct parsing fails, try some common formats
    let day, month, year;
    
    // Check DD/MM/YYYY or DD-MM-YYYY
    const dmy = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dmy) {
      day = dmy[1].padStart(2, '0');
      month = dmy[2].padStart(2, '0');
      year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
      return `${year}-${month}-${day}`;
    }
    
    // Return the original string if all parsing fails
    return dateStr;
  } catch (e) {
    console.warn("Could not format date:", dateStr);
    return dateStr;
  }
}
