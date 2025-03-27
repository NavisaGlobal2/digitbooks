
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { parse as csvParse } from 'https://deno.land/std@0.177.0/encoding/csv.ts'
import * as XLSX from 'https://deno.land/x/excel@v1.1.2/mod.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Transaction types
type TransactionType = 'debit' | 'credit' | 'unknown'

// Transaction interface
interface Transaction {
  date: string
  description: string
  amount: number
  type: TransactionType
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Create Supabase client with admin rights
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Regular Supabase client using the token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Create Supabase client with user token
    const supabase = createClient(supabaseUrl, authHeader.replace('Bearer ', ''), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized or invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Get the form data from the request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      )
    }
    
    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Generate a unique batch ID for this upload
    const batchId = crypto.randomUUID()
    
    // Parse the file based on its extension
    const fileName = file.name.toLowerCase()
    let transactions: Transaction[] = []
    
    console.log(`Processing file: ${fileName}`)
    
    if (fileName.endsWith('.csv')) {
      transactions = await processCSV(file)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      transactions = await processExcel(file)
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Please upload CSV or Excel files.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Parsed ${transactions.length} transactions from the file`)
    
    // Save transactions to the database
    const savedCount = await saveTransactions(transactions, batchId, user.id, supabaseAdmin)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${savedCount} transactions`, 
        batchId,
        transactionCount: savedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing bank statement:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Process CSV file
async function processCSV(file: File): Promise<Transaction[]> {
  const text = await file.text()
  const rows = await csvParse(text, { skipFirstRow: true })
  
  // Try to detect columns by header or position
  return detectAndParseTransactions(rows)
}

// Process Excel file
async function processExcel(file: File): Promise<Transaction[]> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = new XLSX.Workbook()
  
  // Load workbook from array buffer
  await workbook.read(new Uint8Array(arrayBuffer))
  
  // Get the first sheet
  const worksheet = workbook.getWorksheet(1)
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file')
  }
  
  // Convert to rows
  const rows: any[] = []
  
  // Add header row
  const headerRow: any[] = []
  worksheet.getRow(1).eachCell((cell) => {
    headerRow.push(cell.value)
  })
  rows.push(headerRow)
  
  // Add data rows
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row: any[] = []
    worksheet.getRow(i).eachCell((cell) => {
      row.push(cell.value)
    })
    if (row.length > 0) {
      rows.push(row)
    }
  }
  
  // Try to detect columns by header or position
  return detectAndParseTransactions(rows)
}

// Detect and parse transactions from row data
function detectAndParseTransactions(rows: any[]): Transaction[] {
  if (rows.length < 2) {
    throw new Error('File contains insufficient data')
  }
  
  // Get headers (first row) and check if they exist
  const headers = rows[0]
  
  // Try to determine column indices
  let dateIndex = -1
  let descIndex = -1
  let amountIndex = -1
  
  // Common header names for each column
  const dateHeaders = ['date', 'transaction date', 'posted date', 'posting date']
  const descHeaders = ['description', 'desc', 'narrative', 'details', 'transaction description', 'particulars']
  const amountHeaders = ['amount', 'transaction amount', 'sum', 'value', 'debit/credit']
  
  // Find column indices from headers
  headers.forEach((header: string, index: number) => {
    const headerLower = String(header).toLowerCase()
    
    if (dateHeaders.some(h => headerLower.includes(h))) {
      dateIndex = index
    }
    
    if (descHeaders.some(h => headerLower.includes(h))) {
      descIndex = index
    }
    
    if (amountHeaders.some(h => headerLower.includes(h))) {
      amountIndex = index
    }
  })
  
  // If we couldn't find proper headers, make an educated guess
  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    // Try positional guessing as fallback
    const sampleRow = rows[1]
    for (let i = 0; i < sampleRow.length; i++) {
      const value = String(sampleRow[i])
      // Check if this looks like a date
      if (dateIndex === -1 && /\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}/.test(value)) {
        dateIndex = i
      }
      // Check if this looks like a description (longer text)
      else if (descIndex === -1 && value.length > 10 && isNaN(Number(value))) {
        descIndex = i
      }
      // Check if this looks like an amount (number)
      else if (amountIndex === -1 && !isNaN(Number(value.replace(/[,$€£]/g, '')))) {
        amountIndex = i
      }
    }
  }
  
  // If we still can't determine columns, throw an error
  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    throw new Error('Could not identify required columns (date, description, amount) in the file')
  }
  
  // Parse transactions from rows, skipping header
  const transactions: Transaction[] = []
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue
    
    let dateValue = row[dateIndex]
    let description = String(row[descIndex] || '')
    let amount = parseAmount(row[amountIndex])
    
    // Skip rows with missing essential data
    if (!dateValue || !description || amount === 0) continue
    
    // Parse date - try different formats
    let parsedDate: Date | null = null
    
    if (typeof dateValue === 'string') {
      // Try parsing date string
      const dateParts = dateValue.split(/[-/.]/g)
      if (dateParts.length === 3) {
        // Try different date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY/MM/DD)
        const possibleDates = [
          new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`), // MM/DD/YYYY
          new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`), // DD/MM/YYYY
          new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`)  // YYYY/MM/DD
        ]
        
        // Use the first valid date
        parsedDate = possibleDates.find(d => !isNaN(d.getTime())) || null
      } else {
        parsedDate = new Date(dateValue)
      }
    } else if (typeof dateValue === 'number') {
      // Excel dates are stored as numbers (days since 1900-01-01)
      const excelEpoch = new Date(1900, 0, 1)
      parsedDate = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000)
    }
    
    // Skip if date is invalid
    if (!parsedDate || isNaN(parsedDate.getTime())) continue
    
    // Format date as ISO string (YYYY-MM-DD)
    const formattedDate = parsedDate.toISOString().split('T')[0]
    
    // Determine transaction type based on amount (negative = debit, positive = credit)
    const type: TransactionType = amount < 0 ? 'debit' : amount > 0 ? 'credit' : 'unknown'
    
    // Use absolute value for the amount
    amount = Math.abs(amount)
    
    transactions.push({
      date: formattedDate,
      description,
      amount,
      type
    })
  }
  
  return transactions
}

// Parse amount from various formats
function parseAmount(value: any): number {
  if (typeof value === 'number') return value
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[,$€£\s]/g, '')
    
    // Support formats with parentheses indicating negative numbers: (100.00)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      return -parseFloat(cleaned.slice(1, -1))
    }
    
    return parseFloat(cleaned) || 0
  }
  
  return 0
}

// Save transactions to the database
async function saveTransactions(
  transactions: Transaction[], 
  batchId: string, 
  userId: string,
  supabase: any
): Promise<number> {
  if (transactions.length === 0) {
    return 0
  }
  
  let savedCount = 0
  
  // Insert in batches to avoid potential request size limits
  const BATCH_SIZE = 50
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE)
    
    const { error } = await supabase
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
