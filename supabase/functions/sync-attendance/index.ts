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

    const url = new URL(req.url)
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    let query = supabase
      .from('attendance_logs')
      .select('*')
      .eq('org_id', staffProfile.org_id)
      .order('checkin_time', { ascending: false })

    if (startDate) {
      query = query.gte('checkin_time', startDate)
    }
    if (endDate) {
      query = query.lte('checkin_time', endDate + 'T23:59:59')
    }

    const { data: logs, error } = await query.limit(1000)

    if (error) throw error

    return successResponse({
      logs: logs || [],
      total: logs?.length || 0,
      last_sync: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sync attendance error:', error)
    return errorResponse(error.message || 'Failed to sync attendance', 500)
  }
})
