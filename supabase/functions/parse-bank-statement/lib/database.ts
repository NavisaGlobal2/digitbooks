
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Transaction } from './types.ts'

// Save transactions to the database
export async function saveToDatabase(
  transactions: Transaction[], 
  batchId: string, 
  userId: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<number> {
  if (transactions.length === 0) {
    return 0
  }
  
  // Create Supabase client with admin rights
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
  
  let savedCount = 0
  
  // Insert in batches to avoid potential request size limits
  const BATCH_SIZE = 50
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE)
    
    const { error } = await supabaseAdmin
      .from('uploaded_bank_lines')
      .insert(batch.map(t => ({
        user_id: userId,
        upload_batch_id: batchId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        status: 'unprocessed'
      })))
    
    if (error) {
      console.error('Error saving transactions:', error)
      throw new Error(`Failed to save transactions: ${error.message}`)
    }
    
    savedCount += batch.length
  }
  
  return savedCount
}
