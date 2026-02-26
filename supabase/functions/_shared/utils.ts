// Shared utility functions for Edge Functions
import { createClient } from 'jsr:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function createSupabaseClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  )
}

export async function getUserFromAuth(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function getStaffProfile(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw new Error('Staff profile not found')
  return data
}

export function successResponse(data: any) {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

export function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  )
}

export function calculateHours(checkinTime: string, checkoutTime: string): number {
  const start = new Date(checkinTime)
  const end = new Date(checkoutTime)
  const diffMs = end.getTime() - start.getTime()
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10 // Round to 1 decimal
}

export function validateGPS(lat: number, lng: number, allowedLat: number, allowedLng: number, radiusMeters = 100): boolean {
  const R = 6371000 // Earth's radius in meters
  const φ1 = lat * Math.PI / 180
  const φ2 = allowedLat * Math.PI / 180
  const Δφ = (allowedLat - lat) * Math.PI / 180
  const Δλ = (allowedLng - lng) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance <= radiusMeters
}
