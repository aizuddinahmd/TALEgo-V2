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

    const today = new Date().toISOString().split('T')[0]

    // Get today's attendance log
    const { data: log } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('staff_id', staffProfile.staff_id)
      .gte('checkin_time', today)
      .lt('checkin_time', today + 'T23:59:59')
      .order('checkin_time', { ascending: false })
      .limit(1)
      .single()

    // Get today's shift schedule
    const { data: shift } = await supabase
      .from('shift_schedules')
      .select('*')
      .eq('staff_id', staffProfile.staff_id)
      .eq('shift_date', today)
      .single()

    // Check for approved leave
    const { data: leave } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('staff_id', staffProfile.staff_id)
      .eq('status', 'approved')
      .lte('start_date', today)
      .gte('end_date', today)
      .single()

    let status = 'absent'
    if (leave) {
      status = 'on_leave'
    } else if (log) {
      status = log.checkout_time ? 'completed' : 'active'
    }

    return successResponse({
      status,
      log: log || null,
      shift: shift || null,
      leave: leave || null,
      isScheduled: !!shift,
      isOnLeave: !!leave
    })

  } catch (error) {
    console.error('Today attendance error:', error)
    return errorResponse(error.message || 'Failed to fetch today\'s attendance', 500)
  }
})
