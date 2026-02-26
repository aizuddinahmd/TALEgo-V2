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

    const { log_id, corrected_checkin, corrected_checkout, reason } = await req.json()

    if (!log_id || !reason) {
      return errorResponse('log_id and reason are required', 400)
    }

    // Verify the log belongs to this staff member
    const { data: log } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('log_id', log_id)
      .eq('staff_id', staffProfile.staff_id)
      .single()

    if (!log) {
      return errorResponse('Attendance log not found', 404)
    }

    // Create correction request
    const { data: correction, error } = await supabase
      .from('attendance_corrections')
      .insert({
        log_id,
        staff_id: staffProfile.staff_id,
        original_checkin: log.checkin_time,
        original_checkout: log.checkout_time,
        corrected_checkin: corrected_checkin || log.checkin_time,
        corrected_checkout: corrected_checkout || log.checkout_time,
        reason,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return successResponse({
      message: 'Correction request submitted',
      correction
    })

  } catch (error) {
    console.error('Correction request error:', error)
    return errorResponse(error.message || 'Failed to submit correction', 500)
  }
})
