import { createClient } from '@supabase/supabase-js';
import { ExpenseCategory } from '../../../../types/expense';

// OCR.space constants
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';
const DEFAULT_LANGUAGE = 'eng';
const DEFAULT_OCR_ENGINE = 2; // More accurate OCR engine

// Supabase constants
const SUPABASE_BUCKET = 'expense-receipts';

export const processPdfWithOcrSpace = async (
  file: File,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ text: string; imageUrls?: string[] }> => {
  try {
    console.log("Starting OCR.space processing for PDF:", file.name);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert PDF to images
    console.log("Converting PDF to images...");
    const imageUrls = await convertPdfToImages(file, supabase);
    console.log(`Converted PDF to ${imageUrls.length} images`);

    let extractedText = '';
    for (const imageUrl of imageUrls) {
      console.log("Processing image with OCR.space:", imageUrl);
      const ocrResult = await performOcr(imageUrl);
      extractedText += ocrResult + '\n';
    }

    console.log("Successfully processed PDF with OCR.space");
    return { text: extractedText, imageUrls: imageUrls };

  } catch (error: any) {
    console.error("Error processing PDF with OCR.space:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

const convertPdfToImages = async (file: File, supabase: any): Promise<string[]> => {
  const pdfData = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const numPages = pdf.numPages;
  const imageUrls: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext, viewport }).promise;

    const imageUrl = canvas.toDataURL('image/jpeg');
    const uploadedImageUrl = await uploadImageToSupabase(imageUrl, supabase, file.name, pageNum);
    if (uploadedImageUrl) {
      imageUrls.push(uploadedImageUrl);
    }
  }

  return imageUrls;
};

const uploadImageToSupabase = async (imageData: string, supabase: any, fileName: string, pageNum: number): Promise<string | null> => {
  try {
    // Convert base64 to raw binary data held in a string
    const byteString = atob(imageData.split(',')[1]);

    // Separate out the mime component
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];

    // Write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Create a blob from the ArrayBuffer
    const file = new File([new Blob([ab], { type: mimeString })], `pdf-page-${pageNum}.jpeg`, { type: mimeString });

    // Upload the image to Supabase
    const filePath = `ocr-space/${fileName.replace('.pdf', '')}/page-${pageNum}.jpeg`;
    const { data, error } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, {
        contentType: mimeString,
        upsert: false
      });

    if (error) {
      console.error("Error uploading image to Supabase:", error);
      throw new Error(`Failed to upload image to Supabase: ${error.message}`);
    }

    // Get the public URL of the uploaded image
    const { data: urlData } = supabase
      .storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to retrieve public URL for the uploaded image");
    }

    console.log("Image uploaded to Supabase:", urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error: any) {
    console.error("Error in uploadImageToSupabase:", error);
    throw new Error(`Failed to upload image to Supabase: ${error.message}`);
  }
};

const performOcr = async (imageUrl: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('url', imageUrl);
    formData.append('language', DEFAULT_LANGUAGE);
    formData.append('OCREngine', String(DEFAULT_OCR_ENGINE));
    formData.append('isTable', 'true');

    const apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY;
    if (!apiKey) {
      throw new Error("OCR.space API key is not configured. Please set the OCR_SPACE_API_KEY environment variable.");
    }

    const response = await fetch(OCR_SPACE_API_URL, {
      method: 'POST',
      headers: {
        apikey: apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OCR.space API request failed:", errorText);
      throw new Error(`OCR.space API request failed: ${errorText}`);
    }

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      console.error("OCR.space processing error:", result.ErrorMessage);
      throw new Error(`OCR.space processing error: ${result.ErrorMessage}`);
    }

    if (result.ParsedResults && result.ParsedResults.length > 0) {
      const parsedText = result.ParsedResults
        .map((parsedResult: any) => parsedResult.ParsedText)
        .join('\n');
      return parsedText;
    } else {
      throw new Error("No text could be extracted from the image");
    }
  } catch (error: any) {
    console.error("Error in performOcr:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

// Function to extract structured data from plain text
export const extractStructuredDataFromText = (text: string): any => {
  const lines = text.split('\n');
  const transactions = [];

  for (const line of lines) {
    // Implement your logic to parse each line and extract relevant information
    // This is a placeholder, you'll need to adjust it based on your specific needs
    const parts = line.split(','); // Example: Split by comma

    if (parts.length >= 3) {
      const date = parts[0];
      const description = parts[1];
      const amount = parseFloat(parts[2]);

      if (!isNaN(amount)) {
        transactions.push({
          date: date,
          description: description,
          amount: amount,
          category: "other" as ExpenseCategory, // Default category
        });
      }
    }
  }

  return {
    transactions: transactions,
  };
};
