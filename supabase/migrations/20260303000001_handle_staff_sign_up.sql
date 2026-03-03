-- supabase/migrations/20260303000001_handle_staff_sign_up.sql

-- ============================================
-- RPC: Handle Staff Sign-up & Linking
-- ============================================
-- This function is called by the client after supabase.auth.signUp()
-- completes. It links the newly created auth user to their pre-existing
-- staff profile based on their email address.

CREATE OR REPLACE FUNCTION public.handle_staff_sign_up()
RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_staff_record RECORD;
BEGIN
  -- 1. Get the authenticated user's ID
  v_user_id := auth.uid();
  
  -- 2. Get the authenticated user's email from JWT metadata
  -- (Always use auth.jwt() or retrieving from auth.users for security)
  v_email := auth.email();

  IF v_user_id IS NULL OR v_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated or email missing';
  END IF;

  -- 3. Find the corresponding staff profile
  SELECT * INTO v_staff_record
  FROM public.staff_profiles
  WHERE email = v_email
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No staff profile found for this email identity.'
    );
  END IF;

  -- 4. Create user_profile if it doesn't exist
  -- We use SECURITY DEFINER to bypass RLS for this internal linking
  INSERT INTO public.user_profiles (
    user_id,
    org_id,
    full_name,
    email,
    role_code,
    status
  )
  VALUES (
    v_user_id,
    v_staff_record.org_id,
    v_staff_record.full_name,
    v_email,
    'STAFF', -- Default role for newly registered employees
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Link the staff profile to the new user_profile
  UPDATE public.staff_profiles
  SET user_id = v_user_id
  WHERE staff_id = v_staff_record.staff_id;

  RETURN jsonb_build_object(
    'success', true,
    'staff_id', v_staff_record.staff_id,
    'org_id', v_staff_record.org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: Verify Staff Invitation (Identity Check)
-- ============================================
-- This function is called by the client BEFORE sign-up to verify
-- that the user is authorized to create an account.
-- It bypasses RLS to check for email + IC match.

CREATE OR REPLACE FUNCTION public.verify_staff_invitation(p_email TEXT, p_ic_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.staff_profiles 
    WHERE email = p_email 
    AND ic_number = p_ic_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
