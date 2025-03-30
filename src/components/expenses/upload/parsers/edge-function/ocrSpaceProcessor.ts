
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { ParsedTransaction } from "../types";

// OCR.space constants
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';
const OCR_SPACE_DEFAULT_LANGUAGE = 'eng';

/**
 * Extract text from PDF using OCR.space API
 */
export const processPdfWithOcrSpace = async (
  file: File, 
  supabaseUrl: string,
  supabaseKey: string
) => {
  try {
    console.log("Starting OCR.space processing for PDF");
    
    // First upload the file to Supabase storage
    const pdfUrl = await uploadPdfToStorage(file, supabaseUrl, supabaseKey);
    
    // Use OCR.space API to extract text from the PDF
    const extractedText = await extractTextFromPdf(pdfUrl);
    
    console.log(`OCR.space extracted ${extractedText.length} characters of text`);
    
    return {
      success: true,
      text: extractedText,
      url: pdfUrl
    };
  } catch (error: any) {
    console.error("OCR.space processing error:", error);
    throw new Error(`OCR.space processing failed: ${error.message}`);
  }
};

/**
 * Upload PDF to Supabase storage
 */
async function uploadPdfToStorage(file: File, supabaseUrl: string, supabaseKey: string): Promise<string> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration is missing");
  }
  
  try {
    // Create a Supabase client using the provided URL and key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Generate a unique filename
    const uniqueId = uuidv4();
    const sanitizedFilename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filename = `pdf-ocr/${uniqueId}-${sanitizedFilename}`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('statements')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw new Error(`Error uploading to Supabase: ${error.message}`);
    }
    
    if (!data || !data.path) {
      throw new Error("No data returned from Supabase upload");
    }
    
    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from('statements')
      .getPublicUrl(data.path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }
    
    console.log(`PDF successfully uploaded to Supabase: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading PDF to Supabase:", error);
    throw error;
  }
}

/**
 * Extract text from PDF URL using OCR.space API
 */
async function extractTextFromPdf(pdfUrl: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('url', pdfUrl);
    formData.append('language', OCR_SPACE_DEFAULT_LANGUAGE);
    formData.append('isTable', 'true');
    
    // Get the API key from environment variables in a browser-safe way
    // Use environment variables if available, otherwise check for a global variable
    const apiKey = 
      (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_OCR_SPACE_API_KEY || import.meta.env?.OCR_SPACE_API_KEY)) || 
      // Access a potential global variable for OCR space API key
      (typeof window !== 'undefined' && (window as any).OCR_SPACE_API_KEY);
    
    if (!apiKey) {
      throw new Error("OCR.space API key is not configured. Please set the OCR_SPACE_API_KEY environment variable.");
    }
    
    formData.append('apikey', apiKey);
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Use the more accurate OCR engine
    
    // Send request to OCR.space API
    const response = await fetch(OCR_SPACE_API_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`OCR.space API returned status ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error("OCR.space API returned no parsed results");
    }
    
    // Extract text from all pages
    const extractedText = result.ParsedResults
      .map((page: any) => page.ParsedText)
      .join('\n\n');
    
    return extractedText;
  } catch (error) {
    console.error("Error extracting text with OCR.space:", error);
    throw error;
  }
}

/**
 * Extract structured data from OCR text
 */
export const extractStructuredDataFromText = (text: string): { transactions: ParsedTransaction[] } => {
  try {
    console.log("Attempting to extract structured transaction data from OCR text");
    
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
            id: uuidv4(), // Generate unique ID
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
    
    console.log(`Extracted ${transactions.length} potential transactions from OCR text`);
    return { transactions };
  } catch (error) {
    console.error("Error extracting structured data from OCR text:", error);
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
