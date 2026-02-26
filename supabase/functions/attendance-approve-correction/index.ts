import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders, createSupabaseClient, getUserFromAuth, successResponse, errorResponse, calculateHours } from '../_shared/utils.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseClient(req.headers.get('Authorization')!)
    await getUserFromAuth(supabase)

    const { correction_id, approved, remarks } = await req.json()

    if (!correction_id || approved === undefined) {
      return errorResponse('correction_id and approved status required', 400)
    }

    // Get correction request
    const { data: correction } = await supabase
      .from('attendance_corrections')
      .select('*')
      .eq('correction_id', correction_id)
      .single()

    if (!correction) {
      return errorResponse('Correction request not found', 404)
    }

    if (correction.status !== 'pending') {
      return errorResponse('Correction already processed', 400)
    }

    // Update correction status
    const { error: updateError } = await supabase
      .from('attendance_corrections')
      .update({
        status: approved ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewer_remarks: remarks || null
      })
      .eq('correction_id', correction_id)

    if (updateError) throw updateError

    // If approved, update the attendance log
    if (approved) {
      const newHours = calculateHours(
        correction.corrected_checkin,
        correction.corrected_checkout
      )

      const { error: logError } = await supabase
        .from('attendance_logs')
        .update({
          checkin_time: correction.corrected_checkin,
          checkout_time: correction.corrected_checkout,
          total_hours: newHours,
          is_corrected: true
        })
        .eq('log_id', correction.log_id)

      if (logError) throw logError
    }

    return successResponse({
      message: approved ? 'Correction approved' : 'Correction rejected',
      correction_id
    })

  } catch (error) {
    console.error('Approve correction error:', error)
    return errorResponse(error.message || 'Failed to process correction', 500)
  }
})
