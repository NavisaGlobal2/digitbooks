
import { useState } from "react";
import { toast } from "sonner";
import { parseStatementFile } from "./statementParsers";
import { ParsedTransaction } from "./statementParsers";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseCategory } from "@/types/expense"; // Add this import

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEdgeFunction, setUseEdgeFunction] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      
      // Check file type
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
        setError('Unsupported file format. Please upload CSV, Excel, or PDF files only.');
        return;
      }
    }
  };

  const parseFile = async () => {
    if (!file) {
      toast.error("Please select a bank statement file");
      return;
    }

    setUploading(true);

    // Choose between client-side parsing or edge function
    if (useEdgeFunction) {
      await parseViaEdgeFunction();
    } else {
      parseViaClient();
    }
  };

  const parseViaClient = () => {
    parseStatementFile(
      file!,
      (transactions) => {
        setUploading(false);
        onTransactionsParsed(transactions);
      },
      (errorMessage) => {
        setError(errorMessage);
        setUploading(false);
      }
    );
  };

  const parseViaEdgeFunction = async () => {
    try {
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("You need to be authenticated to upload files");
        setUploading(false);
        return;
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file!);
      
      // Call the edge function
      const response = await fetch(
        `https://naxmgtoskeijvdofqyik.supabase.co/functions/v1/parse-bank-statement`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || "Failed to process file");
        setUploading(false);
        return;
      }
      
      // If successful, fetch the transactions from the database
      const { data, error: fetchError } = await supabase
        .from('uploaded_bank_lines')
        .select('*')
        .eq('upload_batch_id', result.batchId)
        .order('date', { ascending: false });
      
      if (fetchError || !data) {
        setError("Failed to retrieve processed transactions");
        setUploading(false);
        return;
      }
      
      // Convert to the format expected by the component
      const transactions: ParsedTransaction[] = data.map((item) => ({
        id: item.id,
        date: new Date(item.date),
        description: item.description,
        amount: item.amount,
        type: item.type as 'credit' | 'debit',
        selected: item.type === 'debit',
        category: item.category as ExpenseCategory | undefined
      }));
      
      setUploading(false);
      onTransactionsParsed(transactions);
      
    } catch (error) {
      console.error("Error in edge function:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return {
    file,
    uploading,
    error,
    useEdgeFunction,
    setUseEdgeFunction,
    handleFileChange,
    parseFile,
    clearFile
  };
};
