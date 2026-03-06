// packages/app/api/attendance.ts
import { supabase } from '../utils/supabase'

// Ensure we use the exact same URL/Key used to initialize the client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

const callFunction = async (name: string, body?: any) => {
  
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body: body || {},
    });

    if (error) {
      throw error;
    }

    return data?.data || data;
  } catch (err: any) {
    throw err;
  }
}

export const clockIn = async (latitude: number, longitude: number) => {
  return callFunction('attendance-clock-in', { latitude, longitude })
}

export const clockOut = async (latitude: number, longitude: number) => {
  return callFunction('attendance-clock-out', { latitude, longitude })
}

export const getTodayAttendance = async () => {
  return callFunction('attendance-today')
}

export const fetchMyAttendance = async () => {
  return callFunction('attendance-my-attendance')
}
