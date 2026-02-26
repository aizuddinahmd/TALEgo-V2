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
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Get all staff in organization
    const { data: teamMembers } = await supabase
      .from('staff_profiles')
      .select('staff_id, full_name, position')
      .eq('org_id', staffProfile.org_id)
      .eq('is_active', true)

    if (!teamMembers) {
      return successResponse({ absentees: [] })
    }

    const staffIds = teamMembers.map(s => s.staff_id)

    // Get attendance logs for the date
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('staff_id')
      .in('staff_id', staffIds)
      .gte('checkin_time', date)
      .lt('checkin_time', date + 'T23:59:59')

    const presentStaffIds = logs?.map(l => l.staff_id) || []

    // Get staff on approved leave
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('staff_id')
      .in('staff_id', staffIds)
      .eq('status', 'approved')
      .lte('start_date', date)
      .gte('end_date', date)

    const leaveStaffIds = leaves?.map(l => l.staff_id) || []

    // Find absentees (not present and not on leave)
    const absentees = teamMembers.filter(staff => 
      !presentStaffIds.includes(staff.staff_id) &&
      !leaveStaffIds.includes(staff.staff_id)
    )

    return successResponse({
      date,
      absentees,
      total_absentees: absentees.length,
      total_staff: teamMembers.length,
      total_present: presentStaffIds.length,
      total_on_leave: leaveStaffIds.length
    })

  } catch (error) {
    console.error('Absentees error:', error)
    return errorResponse(error.message || 'Failed to fetch absentees', 500)
  }
})
