
// Modify the form processor to be more testable by accepting custom dependencies

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Transaction } from './types.ts'
import { parseFile } from './parsers/fileParser.ts'

export async function processFormData(
  req: Request, 
  token: string, 
  supabaseUrl: string,
  customParseFile?: (file: File) => Promise<Transaction[]>,
  customSupabaseClient?: any
): Promise<{
  transactions: Transaction[], 
  user: any, 
  batchId: string
}> {
  // Create Supabase client with user token or use custom client for testing
  const supabase = customSupabaseClient || createClient(supabaseUrl, token, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized or invalid token')
  }
  
  // Get the form data from the request
  if (req.method !== 'POST') {
    throw new Error('Method not allowed')
  }
  
  // Parse form data
  const formData = await req.formData()
  const file = formData.get('file')
  
  if (!file || !(file instanceof File)) {
    throw new Error('No file uploaded')
  }
  
  // Generate a unique batch ID for this upload
  const batchId = crypto.randomUUID()
  
  // Parse the file using provided function or default
  console.log(`Processing file: ${file.name}`)
  const parseFileFn = customParseFile || parseFile
  const transactions = await parseFileFn(file)
  
  console.log(`Parsed ${transactions.length} transactions from the file`)
  
  return { transactions, user, batchId }
}
