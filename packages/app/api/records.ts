import { supabase } from '../utils/supabase'

export const getStaffProfile = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)

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

export const fetchAttendanceRecords = async () => {
  const { data, error } = await supabase.functions.invoke('attendance-my-attendance', {
    method: 'GET'
  })

  if (error) throw error
  return data?.logs || []
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

export const submitLeaveRequest = async (payload: {
  org_id: string
  staff_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
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
