import { corsHeaders } from '../_shared/utils.ts'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { docType, staffData, salaryData, context } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in Edge Function Secrets.')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Switching to 2.5-flash as 2.0-flash hit a quota limit
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Construct Prompt
    const prompt = `
      You are an expert HR Consultant for a Malaysian company.
      Your task is to draft a professional ${docType}.

      **Staff Details:**
      - Name: ${staffData.full_name}
      - IC No: ${staffData.ic_no || "N/A"}
      - Position: ${staffData.position}
      - Department: ${staffData.department || "N/A"}
      - Join Date: ${staffData.joined_at || "N/A"}

      **Confidential Salary Data:**
      - Basic Salary: RM ${salaryData ? salaryData.basic_salary : "N/A"}

      **Additional Context/Clauses:**
      ${context || "Standard employment terms apply."}

      **Requirements:**
      1. Use professional Malaysian Business English.
      2. Format as a proper letter with placeholders for Date and Company Signatures if not provided.
      3. Include necessary legal disclaimers relevant to Malaysian Employment Law (Employment Act 1955).
      4. Return ONLY the document content in Markdown format. Do not include conversational filler.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return new Response(
      JSON.stringify({ success: true, data: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    // Return 200 even on error so the client can read the JSON body
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
