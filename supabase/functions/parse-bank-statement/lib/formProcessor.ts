
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Transaction } from './types.ts'
import { parseFile } from './parsers/fileParser.ts'

export async function processFormData(req: Request, token: string, supabaseUrl: string): Promise<{
  transactions: Transaction[], 
  user: any, 
  batchId: string
}> {
  // Create Supabase client with user token
  const supabase = createClient(supabaseUrl, token, {
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
  
  // Parse the file
  console.log(`Processing file: ${file.name}`)
  const transactions = await parseFile(file)
  
  console.log(`Parsed ${transactions.length} transactions from the file`)
  
  return { transactions, user, batchId }
}
