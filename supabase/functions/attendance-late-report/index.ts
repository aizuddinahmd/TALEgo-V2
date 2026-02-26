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
    const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7)

    const startDate = `${month}-01`
    const endDate = new Date(month + '-01')
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0)
    const endDateStr = endDate.toISOString().split('T')[0]

    // Get all staff in organization
    const { data: teamMembers } = await supabase
      .from('staff_profiles')
      .select('staff_id, full_name, position')
      .eq('org_id', staffProfile.org_id)
      .eq('is_active', true)

    if (!teamMembers) {
      return successResponse({ report: [] })
    }

    const staffIds = teamMembers.map(s => s.staff_id)

    // Get late entries
    const { data: lateLogs, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .in('staff_id', staffIds)
      .eq('status', 'late')
      .gte('checkin_time', startDate)
      .lte('checkin_time', endDateStr + 'T23:59:59')
      .order('checkin_time', { ascending: false })

    if (error) throw error

    // Enrich with staff details
    const enrichedReport = lateLogs?.map(log => {
      const staff = teamMembers.find(s => s.staff_id === log.staff_id)
      return {
        ...log,
        staff_name: staff?.full_name,
        staff_position: staff?.position
      }
    })

    // Group by staff for summary
    const summaryByStaff = teamMembers.map(staff => {
      const staffLateDays = lateLogs?.filter(l => l.staff_id === staff.staff_id) || []
      return {
        staff_id: staff.staff_id,
        staff_name: staff.full_name,
        position: staff.position,
        late_count: staffLateDays.length,
        latest_late_date: staffLateDays[0]?.checkin_time || null
      }
    }).filter(s => s.late_count > 0)
      .sort((a, b) => b.late_count - a.late_count)

    return successResponse({
      month,
      detailed_logs: enrichedReport || [],
      summary: summaryByStaff,
      total_late_entries: lateLogs?.length || 0
    })

  } catch (error) {
    console.error('Late report error:', error)
    return errorResponse(error.message || 'Failed to generate late report', 500)
  }
})
