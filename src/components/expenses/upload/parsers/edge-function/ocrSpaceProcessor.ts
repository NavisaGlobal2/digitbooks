
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ParsedTransaction } from '../types';
import { toast } from 'sonner';

/**
 * Process a PDF file using OCR.space API
 */
export const processPdfWithOcrSpace = async (
  file: File,
  onSuccess: (result: { success: boolean; text: string; transactions: ParsedTransaction[] }) => boolean,
  onError: (errorMessage: string) => boolean
): Promise<boolean> => {
  try {
    console.log("🔄 OCR.space: Starting PDF processing");
    
    // Step 1: Upload the PDF to Supabase Storage
    const fileName = `bank-statements/${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    console.log("🔄 OCR.space: Uploading PDF to Supabase Storage:", fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });
      
    if (uploadError) {
      console.error("❌ OCR.space: Error uploading PDF to storage", uploadError);
      return onError(`Failed to upload PDF: ${uploadError.message}`);
    }
    
    console.log("✅ OCR.space: PDF uploaded successfully");
    
    // Step 2: Get a public URL for the uploaded file
    const { data: publicURLData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(fileName);
    
    const publicUrl = publicURLData?.publicUrl;
    
    if (!publicUrl) {
      console.error("❌ OCR.space: Couldn't get public URL for uploaded PDF");
      return onError("Unable to generate public URL for the PDF");
    }
    
    console.log("✅ OCR.space: Generated public URL for PDF:", publicUrl);
    
    // Step 3: Call the OCR.space Edge Function with the PDF URL
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData.session) {
      console.error("❌ OCR.space: No authentication session");
      return onError("Authentication required");
    }
    
    console.log("🔄 OCR.space: Calling OCR Edge Function");
    
    // Call the OCR.space Edge Function
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/ocr-bank-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify({ 
        pdfUrl: publicUrl
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ OCR.space: Edge Function error:", errorData);
      
      // Check if the API key is not configured
      if (errorData.error === 'OCR.space API key is not configured on the server') {
        toast.error("OCR.space API key is not configured. Please set it in your Supabase Edge Function environment.");
        return onError("OCR.space API key is not configured. Please set the OCR_SPACE_API_KEY environment variable in your Supabase project settings.");
      }
      
      return onError(`OCR.space Edge Function error: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log("✅ OCR.space: Received text extraction result");
    
    if (!result.success) {
      console.error("❌ OCR.space: Text extraction failed", result.error);
      return onError(`OCR.space extraction failed: ${result.error || 'Unknown error'}`);
    }
    
    const extractedText = result.text;
    
    if (!extractedText || extractedText.trim() === '') {
      console.error("❌ OCR.space: No text extracted from PDF");
      return onError("OCR.space couldn't extract any text from the PDF");
    }
    
    console.log("✅ OCR.space: Successfully extracted text from PDF");
    
    // Step 4: Parse the extracted text as a basic transaction list
    // This is a simple regex-based parser for common bank statement formats
    // A more advanced AI-based parser would normally be used here
    const transactions = parseExtractedText(extractedText);
    
    return onSuccess({ 
      success: true, 
      text: extractedText,
      transactions: transactions
    });
  } catch (error: any) {
    console.error("❌ OCR.space: Unexpected error:", error);
    return onError(`OCR.space processing error: ${error.message || 'Unknown error'}`);
  }
};

// Simple regex-based parser for extracted text
const parseExtractedText = (text: string): ParsedTransaction[] => {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split('\n');
  
  // Common date formats in bank statements
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,      // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,        // YYYY/MM/DD
    /(\w{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/, // Month DD, YYYY
  ];
  
  // Amount patterns
  const amountPattern = /([\-\+]?\$?[\d,]+\.\d{2})/;
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.includes('STATEMENT') || line.includes('PAGE') || line.includes('BALANCE')) {
      continue;
    }
    
    let dateMatch = null;
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        dateMatch = match;
        break;
      }
    }
    
    if (dateMatch) {
      // Try to extract date
      let date = '';
      try {
        // Attempt to normalize the date to YYYY-MM-DD
        const dateParts = dateMatch.slice(1, 4).map(part => parseInt(part));
        
        // Handle different date formats
        if (dateMatch[0].includes('/') || dateMatch[0].includes('-')) {
          // For numeric dates like MM/DD/YYYY or YYYY-MM-DD
          if (dateParts[0] > 1000) {
            // YYYY-MM-DD
            date = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}`;
          } else {
            // MM/DD/YYYY or DD/MM/YYYY (assume MM/DD/YYYY for simplicity)
            let year = dateParts[2];
            if (year < 100) year = 2000 + year;
            date = `${year}-${String(dateParts[0]).padStart(2, '0')}-${String(dateParts[1]).padStart(2, '0')}`;
          }
        } else {
          // For written month format
          const month = dateMatch[1];
          const day = parseInt(dateMatch[2]);
          const year = parseInt(dateMatch[3]);
          
          const monthMap: {[key: string]: number} = {
            'jan': 1, 'january': 1,
            'feb': 2, 'february': 2,
            'mar': 3, 'march': 3,
            'apr': 4, 'april': 4,
            'may': 5,
            'jun': 6, 'june': 6,
            'jul': 7, 'july': 7,
            'aug': 8, 'august': 8,
            'sep': 9, 'september': 9,
            'oct': 10, 'october': 10,
            'nov': 11, 'november': 11,
            'dec': 12, 'december': 12
          };
          
          const monthNum = monthMap[month.toLowerCase()] || 1;
          date = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      } catch (e) {
        // If date parsing fails, use the raw match as a fallback
        date = dateMatch[0];
      }
      
      // Extract amount
      const amountMatch = line.match(amountPattern);
      let amount = 0;
      
      if (amountMatch) {
        // Parse amount, removing currency symbols and commas
        const amountStr = amountMatch[0].replace(/[$,]/g, '');
        amount = parseFloat(amountStr);
      }
      
      // Determine transaction type
      const type = amount < 0 ? 'debit' : 'credit';
      
      // Extract description by removing date and amount
      let description = line
        .replace(dateMatch[0], '')
        .replace(amountMatch ? amountMatch[0] : '', '')
        .trim();
      
      // Remove common prefixes and clean up
      description = description
        .replace(/^[0-9]+\s+/, '') // Remove leading numbers
        .replace(/\s{2,}/g, ' ')   // Replace multiple spaces with single space
        .trim();
      
      if (description && !isNaN(amount)) {
        transactions.push({
          id: `tx-${Math.random().toString(36).substr(2, 9)}`,
          date,
          description,
          amount,
          type,
          selected: type === 'debit',
          category: '',
          source: ''
        });
      }
    }
  }
  
  return transactions;
};
