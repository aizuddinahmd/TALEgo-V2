import { supabase } from '../utils/supabase'

export const signInWithEmail = async (email: string, password?: string) => {
  // We allow either password logic or OTP logic depending on your auth strategy
  if (password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    })
    if (error) throw error
    return data
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export const verifyInvitation = async (email: string, token: string) => {
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('staff_id, ic_number')
    .eq('email', email)
    .single()

  if (error || !data) {
    return false
  }

  return data.ic_number === token
}

export const signUpWithEmail = async (email: string, password?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || '',
  })
  if (error) throw error
  return data
}
