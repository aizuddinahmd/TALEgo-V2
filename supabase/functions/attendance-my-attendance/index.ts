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
    const limit = parseInt(url.searchParams.get('limit') || '50')

    let query = supabase
      .from('attendance_logs')
      .select('*')
      .eq('staff_id', staffProfile.staff_id)
      .order('checkin_time', { ascending: false })
      .limit(limit)

    if (startDate) {
      query = query.gte('checkin_time', startDate)
    }
    if (endDate) {
      query = query.lte('checkin_time', endDate + 'T23:59:59')
    }

    const { data: logs, error } = await query

    if (error) throw error

    return successResponse({
      logs,
      total: logs?.length || 0
    })

  } catch (error) {
    console.error('My-attendance error:', error)
    return errorResponse(error.message || 'Failed to fetch attendance', 500)
  }
})
