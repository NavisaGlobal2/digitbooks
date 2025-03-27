
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from './lib/cors.ts'
import { processFormData } from './lib/formProcessor.ts'
import { saveToDatabase } from './lib/database.ts'

// Export the request handler for testability
export async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Regular Supabase client using the token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Process the uploaded file and get transactions
    try {
      const { transactions, user, batchId } = await processFormData(
        req, 
        authHeader.replace('Bearer ', ''), 
        supabaseUrl
      )
      
      // Save transactions to the database
      const savedCount = await saveToDatabase(
        transactions, 
        batchId, 
        user.id, 
        supabaseUrl, 
        supabaseServiceKey
      )
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully processed ${savedCount} transactions`, 
          batchId,
          transactionCount: savedCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (validationError) {
      // Handle validation errors with a 400 Bad Request status
      console.error('Validation error:', validationError.message)
      
      return new Response(
        JSON.stringify({ 
          error: validationError.message,
          errorType: 'validation'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }
    
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
}

// Start the server
serve(handleRequest)
