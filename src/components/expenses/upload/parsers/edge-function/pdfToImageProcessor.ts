
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "../types";

// Process PDF as images for better text extraction
export const processPdfAsImages = async (
  file: File,
  onSuccess: (result: { transactions: ParsedTransaction[], extractedText?: string }) => void,
  onError: (errorMessage: string) => boolean,
  setIsProcessingPdf?: (isProcessing: boolean) => void
) => {
  try {
    console.log(`🔄 Converting PDF to images for OCR processing: ${file.name}`);
    
    // Check if we have a Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return onError("Authentication required for PDF processing");
    }
    
    console.log(`🔄 Sending PDF for image conversion and OCR processing...`);
    
    // We're going to rely on the edge function for PDF processing
    // but we'll simulate the interface here for compatibility
    
    try {
      // Dynamic import pdfjs to avoid server-side rendering issues
      // @ts-ignore - TS doesn't recognize dynamic PDF.js import
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      // @ts-ignore - Ignoring worker source typing issue
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      // Create a basic extraction attempt
      let extractedText = "";
      
      try {
        const pdfData = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        
        console.log(`PDF has ${numPages} pages`);
        
        // Extract text from each page
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += pageText + '\n\n';
        }
        
        console.log("Successfully extracted text from PDF");
        
        // Return immediately if we have text
        if (extractedText.length > 0) {
          const result = extractStructuredDataFromPdf(extractedText);
          onSuccess({
            transactions: result.transactions,
            extractedText
          });
          return;
        }
      } catch (pdfError: any) {
        console.warn("Error extracting text directly from PDF:", pdfError.message);
        // Continue to edge function as fallback
      }
      
      // If direct extraction failed, use the edge function via parseViaEdgeFunction
      const { parseViaEdgeFunction } = await import('./parser');
      parseViaEdgeFunction(
        file,
        (transactions) => {
          onSuccess({
            transactions,
            extractedText
          });
        },
        onError,
        {
          useVision: true,
          forceRealData: true,
          extractPdfText: true
        }
      );
    } catch (error: any) {
      console.error(`❌ Error in processPdfAsImages:`, error);
      onError(`PDF processing failed: ${error.message}`);
    }
  } catch (error: any) {
    console.error(`❌ Error in processPdfAsImages:`, error);
    return onError(`Failed to process PDF: ${error.message}`);
  }
};

// Extract structured data from PDF text
export const extractStructuredDataFromPdf = (text: string): { transactions: ParsedTransaction[] } => {
  try {
    console.log("Attempting to extract structured transaction data from PDF text");
    
    // Simple pattern matching for dates, descriptions, and amounts
    const datePattern = /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b|\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/g;
    const amountPattern = /\$?\s?[\d,]+\.\d{2}/g;
    const transactions: ParsedTransaction[] = [];
    
    // Look for patterns that might indicate a transaction row
    const lines = text.split('\n');
    
    for (const line of lines) {
      try {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Extract potential date
        const dateMatch = line.match(datePattern);
        if (!dateMatch) continue;
        
        // Extract potential amount
        const amountMatch = line.match(amountPattern);
        if (!amountMatch) continue;
        
        // If we have both date and amount, assume this is a transaction
        const date = dateMatch[0];
        const amountStr = amountMatch[0].replace(/[$,\s]/g, '');
        const amount = parseFloat(amountStr);
        
        // Get the description by removing date and amount from line
        let description = line
          .replace(dateMatch[0], '')
          .replace(amountMatch[0], '')
          .replace(/\s+/g, ' ')
          .trim();
          
        // If we have a valid amount and description, add it as a transaction
        if (!isNaN(amount) && description) {
          transactions.push({
            date: formatDate(date),
            description,
            amount,
            type: amount < 0 ? 'debit' : 'credit'
          });
        }
      } catch (lineError) {
        console.warn("Error processing line:", lineError);
        continue;
      }
    }
    
    console.log(`Extracted ${transactions.length} potential transactions from PDF text`);
    return { transactions };
  } catch (error) {
    console.error("Error extracting structured data from PDF:", error);
    return { transactions: [] };
  }
};

// Helper function to format dates consistently
function formatDate(dateStr: string): string {
  try {
    // Handle different date formats
    const parts = dateStr.split(/[-/.]/);
    
    // Check if year is first (YYYY-MM-DD)
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    
    // Assume format is MM/DD/YYYY or DD/MM/YYYY
    const day = parts[1].length <= 2 ? parts[1].padStart(2, '0') : parts[1];
    const month = parts[0].length <= 2 ? parts[0].padStart(2, '0') : parts[0];
    
    // If year is 2 digits, assume 2000s
    let year = parts[2];
    if (year.length === 2) {
      year = `20${year}`;
    }
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    // Return original if we can't parse it
    return dateStr;
  }
}
