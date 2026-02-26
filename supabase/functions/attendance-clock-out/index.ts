import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders, createSupabaseClient, getUserFromAuth, getStaffProfile, successResponse, errorResponse, calculateHours } from '../_shared/utils.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseClient(req.headers.get('Authorization')!)
    const user = await getUserFromAuth(supabase)
    const staffProfile = await getStaffProfile(supabase, user.id)

    const { latitude, longitude } = await req.json()

    if (!latitude || !longitude) {
      return errorResponse('GPS coordinates required', 400)
    }

    // Find active clock-in for today
    const today = new Date().toISOString().split('T')[0]
    const { data: activeLog, error: findError } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('staff_id', staffProfile.staff_id)
      .gte('checkin_time', today)
      .is('checkout_time', null)
      .order('checkin_time', { ascending: false })
      .limit(1)
      .single()

    if (findError || !activeLog) {
      return errorResponse('No active clock-in found', 404)
    }

    const now = new Date()
    const hours = calculateHours(activeLog.checkin_time, now.toISOString())

    // Check for overtime (if shift defined)
    let finalStatus = activeLog.status
    if (activeLog.shift_schedule_id) {
      const { data: shift } = await supabase
        .from('shift_schedules')
        .select('*')
        .eq('schedule_id', activeLog.shift_schedule_id)
        .single()

      if (shift) {
        const expectedHours = parseFloat(shift.hours) || 8
        if (hours > expectedHours) {
          finalStatus = 'overtime'
        }
      }
    }

    // Update attendance log
    const { data: updatedLog, error: updateError } = await supabase
      .from('attendance_logs')
      .update({
        checkout_time: now.toISOString(),
        checkout_location: `${latitude},${longitude}`,
        total_hours: hours,
        status: finalStatus
      })
      .eq('log_id', activeLog.log_id)
      .select()
      .single()

    if (updateError) throw updateError

    return successResponse({
      message: 'Clocked out successfully',
      log: updatedLog,
      hours,
      status: finalStatus
    })

  } catch (error) {
    console.error('Clock-out error:', error)
    return errorResponse(error.message || 'Failed to clock out', 500)
  }
})
