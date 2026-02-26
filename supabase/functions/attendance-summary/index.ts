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
    const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7) // YYYY-MM

    const startDate = `${month}-01`
    const endDate = new Date(month + '-01')
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0) // Last day of month
    const endDateStr = endDate.toISOString().split('T')[0]

    // Get all staff in organization
    const { data: teamMembers } = await supabase
      .from('staff_profiles')
      .select('staff_id, full_name, position')
      .eq('org_id', staffProfile.org_id)
      .eq('is_active', true)

    if (!teamMembers) {
      return successResponse({ summary: [] })
    }

    const staffIds = teamMembers.map(s => s.staff_id)

    // Get logs for the month
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('*')
      .in('staff_id', staffIds)
      .gte('checkin_time', startDate)
      .lte('checkin_time', endDateStr + 'T23:59:59')

    // Calculate summary per staff
    const summary = teamMembers.map(staff => {
      const staffLogs = logs?.filter(l => l.staff_id === staff.staff_id) || []
      const totalDays = staffLogs.length
      const lateDays = staffLogs.filter(l => l.status === 'late').length
      const overtimeDays = staffLogs.filter(l => l.status === 'overtime').length
      const totalHours = staffLogs.reduce((sum, l) => sum + (parseFloat(l.total_hours) || 0), 0)

      return {
        staff_id: staff.staff_id,
        staff_name: staff.full_name,
        position: staff.position,
        total_days: totalDays,
        late_days: lateDays,
        overtime_days: overtimeDays,
        total_hours: Math.round(totalHours * 10) / 10,
        average_hours: totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0
      }
    })

    return successResponse({
      month,
      summary,
      total_staff: teamMembers.length
    })

  } catch (error) {
    console.error('Summary error:', error)
    return errorResponse(error.message || 'Failed to generate summary', 500)
  }
})
