import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders, createSupabaseClient, getUserFromAuth, getStaffProfile, successResponse, errorResponse, validateGPS } from '../_shared/utils.ts'

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

    // Get organization GPS settings
    const { data: orgSettings } = await supabase
      .from('organizations')
      .select('office_latitude, office_longitude, gps_radius')
      .eq('org_id', staffProfile.org_id)
      .single()

    // Validate GPS location (optional based on org settings)
    if (orgSettings?.office_latitude && orgSettings?.office_longitude) {
      const isValid = validateGPS(
        latitude,
        longitude,
        orgSettings.office_latitude,
        orgSettings.office_longitude,
        orgSettings.gps_radius || 100
      )

      if (!isValid) {
        return errorResponse('You are outside the allowed location radius', 403)
      }
    }

    // Check if already clocked in today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('staff_id', staffProfile.staff_id)
      .gte('checkin_time', today)
      .lt('checkin_time', today + 'T23:59:59')
      .is('checkout_time', null)
      .single()

    if (existingLog) {
      return errorResponse('Already clocked in for today', 400)
    }

    // Get shift schedule for today
    const { data: shift } = await supabase
      .from('shift_schedules')
      .select('*')
      .eq('staff_id', staffProfile.staff_id)
      .eq('shift_date', today)
      .single()

    // Determine if late
    let status = 'on_time'
    const now = new Date()
    if (shift) {
      const shiftStart = new Date(`${today}T${shift.start_time}`)
      if (now > shiftStart) {
        status = 'late'
      }
    }

    // Create attendance log
    const { data: log, error } = await supabase
      .from('attendance_logs')
      .insert({
        staff_id: staffProfile.staff_id,
        checkin_time: now.toISOString(),
        checkin_location: `${latitude},${longitude}`,
        status: status,
        shift_schedule_id: shift?.schedule_id || null
      })
      .select()
      .single()

    if (error) throw error

    return successResponse({
      message: status === 'late' ? 'Clocked in (Late)' : 'Clocked in successfully',
      log,
      status
    })

  } catch (error) {
    console.error('Clock-in error:', error)
    return errorResponse(error.message || 'Failed to clock in', 500)
  }
})
