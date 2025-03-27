
import { useState } from "react";
import { toast } from "sonner";
import { parseStatementFile } from "./statementParsers";
import { ParsedTransaction } from "./statementParsers";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseCategory } from "@/types/expense";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEdgeFunction, setUseEdgeFunction] = useState(true);
  const [edgeFunctionAvailable, setEdgeFunctionAvailable] = useState(true);

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
      
      // Reset edge function availability when a new file is selected
      setEdgeFunctionAvailable(true);
    }
  };

  const parseFile = async () => {
    if (!file) {
      toast.error("Please select a bank statement file");
      return;
    }

    setUploading(true);
    setError(null);

    // Choose between client-side parsing or edge function
    if (useEdgeFunction && edgeFunctionAvailable) {
      await parseViaEdgeFunction();
    } else {
      parseViaClient();
    }
  };

  const parseViaClient = () => {
    toast.info("Processing your bank statement on the client");
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
      // Get the auth token directly from the user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error("No authentication session found", session);
        setError("You need to be authenticated to upload files");
        setUploading(false);
        setUseEdgeFunction(false); // Automatically switch to client-side parsing
        toast.info("Falling back to client-side parsing due to authentication issue");
        parseViaClient();
        return;
      }
      
      toast.info("Processing your bank statement on the server");
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file!);
      
      // Call the edge function using Supabase Functions invoke
      const { data, error: functionError } = await supabase.functions.invoke(
        'parse-bank-statement',
        {
          body: formData,
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error(functionError.message);
      }
      
      if (!data) {
        throw new Error("No data returned from edge function");
      }
      
      console.log("Edge function response:", data);
      
      // If successful, fetch the transactions from the database
      const { data: transactionsData, error: fetchError } = await supabase
        .from('uploaded_bank_lines')
        .select('*')
        .eq('upload_batch_id', data.batchId)
        .order('date', { ascending: false });
      
      if (fetchError || !transactionsData || transactionsData.length === 0) {
        console.error("Failed to retrieve transactions or no transactions found:", fetchError);
        throw new Error("Failed to retrieve processed transactions");
      }
      
      // Convert to the format expected by the component
      const transactions: ParsedTransaction[] = transactionsData.map((item) => ({
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
      setError(`Server-side processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setUploading(false);
      setEdgeFunctionAvailable(false); // Mark edge function as unavailable after an error
      
      // Fallback to client-side parsing
      toast.info("Falling back to client-side parsing");
      parseViaClient();
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  const toggleEdgeFunction = () => {
    setUseEdgeFunction(!useEdgeFunction);
    if (!useEdgeFunction) {
      // Reset edge function availability when user manually enables it
      setEdgeFunctionAvailable(true);
    }
  };

  return {
    file,
    uploading,
    error,
    useEdgeFunction,
    setUseEdgeFunction,
    toggleEdgeFunction,
    edgeFunctionAvailable,
    handleFileChange,
    parseFile,
    clearFile
  };
};
