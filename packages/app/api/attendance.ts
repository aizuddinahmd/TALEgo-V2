// packages/app/api/attendance.ts
import { supabase } from '../utils/supabase'

// Ensure we use the exact same URL/Key used to initialize the client
const SUPABASE_URL = (supabase as any).supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON_KEY = (supabase as any).supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const callFunction = async (name: string, body?: any) => {
  console.log(`TRACE: calling ${name} initiated`);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || ANON_KEY;

    // Helper to log JWT claims without sensitive data
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log(`TRACE: JWT Claims - iss: ${payload.iss}, ref: ${payload.ref}, role: ${payload.role}, aud: ${payload.aud}`);
      }
    } catch (e) {
      console.error('TRACE: Failed to decode JWT', e);
    }

    const url = `${SUPABASE_URL}/functions/v1/${name}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': ANON_KEY
    };

    console.log(`TRACE: Fetching ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    console.log(`TRACE: ${name} response status:`, response.status);

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`TRACE: ${name} error details:`, {
        status: response.status,
        body: result
      });
      throw new Error(result.error || result.message || `Status ${response.status}`);
    }

    return result.data || result;
  } catch (err: any) {
    console.error(`TRACE: ${name} caught exception:`, err);
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
