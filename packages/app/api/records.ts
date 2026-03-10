import { supabase } from '../utils/supabase'

export const getStaffProfile = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  let query = supabase.from('staff_profiles').select('*')
  
  if (user.email) {
    query = query.or(`user_id.eq.${user.id},email.eq.${user.email}`)
  } else {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query.limit(1)

  if (error) throw error
  return data?.[0] || null
}

export const fetchLeaveRecords = async (staffId: string) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      request_id,
      start_date,
      end_date,
      total_days,
      status,
      leave_type:leave_types(leave_name)
    `)
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const fetchExpenseRecords = async (staffId: string) => {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      claim_id,
      claim_date,
      amount,
      status,
      description,
      category:claim_categories(category_name)
    `)
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

import { fetchMyAttendance } from './attendance'

export const fetchAttendanceRecords = async () => {
  const data = await fetchMyAttendance()
  const logs = data?.logs || []
  return logs
}

export const fetchLeaveBalances = async (staffId: string) => {
  const currentYear = new Date().getFullYear()
  const { data, error } = await supabase
    .from('leave_balances')
    .select(`
      balance_id,
      entitled_days,
      carried_forward,
      used_days,
      pending_days,
      remaining_days,
      leave_type:leave_types (
        leave_type_id,
        leave_name,
        leave_code,
        requires_document
      )
    `)
    .eq('staff_id', staffId)
    .eq('year', currentYear)

  if (error) throw error
  return data || []
}

export const fetchLeaveTypes = async () => {
  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('is_active', true)
    
  if (error) throw error
  return data || []
}

export const submitLeaveRequest = async (payload: {
  org_id: string
  staff_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  is_half_day?: boolean
  half_day_period?: 'Morning' | 'Afternoon' | null
}) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([
      {
        ...payload,
        status: 'pending'
      }
    ])
    .select()

  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// Expenses / Claims API
// ------------------------------------------------------------------

export const fetchClaimCategories = async () => {
  const { data, error } = await supabase
    .from('claim_categories')
    .select('*')
    .eq('is_active', true)
    
  if (error) throw error
  return data || []
}

export const submitExpenseClaim = async (payload: {
  org_id: string
  staff_id: string
  category_id: string
  claim_date: string
  description: string
  amount: number
}) => {
  const { data, error } = await supabase
    .from('claims')
    .insert([
      {
        org_id: payload.org_id,
        staff_id: payload.staff_id,
        category_id: payload.category_id,
        claim_date: payload.claim_date,
        description: payload.description,
        amount: payload.amount,
        status: 'pending'
      }
    ])
    .select()

  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// Attendance Corrections API
// ------------------------------------------------------------------

export const submitAttendanceCorrection = async (payload: {
  org_id: string
  staff_id: string
  original_checkin?: string
  original_checkout?: string
  proposed_checkin: string
  proposed_checkout: string
  reason: string
}) => {
  const { data, error } = await supabase
    .from('attendance_corrections')
    .insert([
      {
        org_id: payload.org_id,
        staff_id: payload.staff_id,
        original_checkin: payload.original_checkin || null,
        original_checkout: payload.original_checkout || null,
        proposed_checkin: payload.proposed_checkin,
        proposed_checkout: payload.proposed_checkout,
        reason: payload.reason,
        status: 'pending',
        requested_at: new Date().toISOString()
      }
    ])
    .select()

  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// Time Off / Overtime / Payment API Stubs
// ------------------------------------------------------------------

export const submitOvertimeRequest = async (payload: any) => {
  console.log('Stubbed OT Submission:', payload)
  // TODO: Point to a future overtime table
  return [{ id: 'stub-ot' }]
}

export const submitPaymentRequest = async (payload: any) => {
  console.log('Stubbed Payment Submission:', payload)
  // TODO: Point to a future payment/advance table
  return [{ id: 'stub-payment' }]
}
