import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders, createSupabaseClient, getUserFromAuth, getStaffProfile, successResponse, errorResponse } from '../_shared/utils.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseClient(req.headers.get('Authorization')!)
    const user = await getUserFromAuth(supabase)
    const staffProfile = await getStaffProfile(supabase, user.id)

    const { logs } = await req.json()

    if (!Array.isArray(logs) || logs.length === 0) {
      return errorResponse('Invalid logs array', 400)
    }

    // Validate all logs belong to same organization
    const validatedLogs = logs.map(log => ({
      ...log,
      org_id: staffProfile.org_id
    }))

    // Bulk insert with conflict handling
    const { data, error } = await supabase
      .from('attendance_logs')
      .upsert(validatedLogs, {
        onConflict: 'log_id',
        ignoreDuplicates: false
      })
      .select()

    if (error) throw error

    return successResponse({
      message: 'Bulk import successful',
      imported: data?.length || 0,
      total_sent: logs.length
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    return errorResponse(error.message || 'Failed to import attendance', 500)
  }
})
