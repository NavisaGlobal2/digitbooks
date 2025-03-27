
import { useState } from "react";
import { toast } from "sonner";

export const useFileProcessing = () => {
  /**
   * Processes a receipt file by converting it to a data URL
   * @param file The receipt file to process
   * @returns A promise that resolves to the data URL of the receipt
   */
  const processReceiptFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const receiptUrl = reader.result as string;
        resolve(receiptUrl);
      };
      
      reader.onerror = (event) => {
        console.error("File reading error:", event);
        toast.error("Failed to process receipt file");
        reject("Failed to process receipt file");
      };
    });
  };

  return {
    processReceiptFile
  };
};
