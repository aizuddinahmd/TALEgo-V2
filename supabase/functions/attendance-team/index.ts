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
    const startDate = url.searchParams.get('start_date') || new Date().toISOString().split('T')[0]
    const endDate = url.searchParams.get('end_date') || startDate

    // Get all staff in the same organization
    const { data: teamMembers } = await supabase
      .from('staff_profiles')
      .select('staff_id, full_name, position')
      .eq('org_id', staffProfile.org_id)
      .eq('is_active', true)

    if (!teamMembers) {
      return successResponse({ logs: [], summary: {} })
    }

    const staffIds = teamMembers.map(s => s.staff_id)

    // Get attendance logs for date range
    const { data: logs, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .in('staff_id', staffIds)
      .gte('checkin_time', startDate)
      .lte('checkin_time', endDate + 'T23:59:59')
      .order('checkin_time', { ascending: false })

    if (error) throw error

    // Enrich with staff details
    const enrichedLogs = logs?.map(log => {
      const staff = teamMembers.find(s => s.staff_id === log.staff_id)
      return {
        ...log,
        staff_name: staff?.full_name,
        staff_position: staff?.position
      }
    })

    return successResponse({
      logs: enrichedLogs || [],
      total: enrichedLogs?.length || 0,
      dateRange: { startDate, endDate }
    })

  } catch (error) {
    console.error('Team attendance error:', error)
    return errorResponse(error.message || 'Failed to fetch team attendance', 500)
  }
})
