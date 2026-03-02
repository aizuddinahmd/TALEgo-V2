-- ============================================
-- 1. TENANT UTILITY FUNCTIONS
-- ============================================
-- This function allows RLS policies to check the user's org without 
-- causing infinite recursion on the user_profiles table.
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 2. UPDATED TABLES WITH ORG_ID
-- ============================================

-- ROLE_PERMISSIONS (Modified for Multi-Tenancy)
DO $$ 
DECLARE
    v_org_id UUID;
BEGIN
    -- Get the first organization ID to seed existing rows
    SELECT org_id INTO v_org_id FROM public.organizations LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='org_id') THEN
        -- Add org_id column
        ALTER TABLE role_permissions ADD COLUMN org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE;
        
        -- Populate existing rows with the first org_id if available
        IF v_org_id IS NOT NULL THEN
            UPDATE role_permissions SET org_id = v_org_id WHERE org_id IS NULL;
        END IF;

        -- Update Primary Key
        ALTER TABLE role_permissions DROP CONSTRAINT role_permissions_pkey;
        ALTER TABLE role_permissions ADD PRIMARY KEY (org_id, role_code, permission_id);
    END IF;
END $$;

-- USER_CUSTOM_PERMISSIONS (Modified for Multi-Tenancy)
DO $$ 
DECLARE
    v_org_id UUID;
BEGIN
    SELECT org_id INTO v_org_id FROM public.organizations LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_custom_permissions' AND column_name='org_id') THEN
        ALTER TABLE user_custom_permissions ADD COLUMN org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE;
        
        IF v_org_id IS NOT NULL THEN
            UPDATE user_custom_permissions SET org_id = v_org_id WHERE org_id IS NULL;
        END IF;
    END IF;
END $$;

-- LEAVE_BALANCES (Modified for Multi-Tenancy)
DO $$ 
DECLARE
    v_org_id UUID;
BEGIN
    SELECT org_id INTO v_org_id FROM public.organizations LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leave_balances' AND column_name='org_id') THEN
        ALTER TABLE leave_balances ADD COLUMN org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE;
        
        IF v_org_id IS NOT NULL THEN
            UPDATE leave_balances SET org_id = v_org_id WHERE org_id IS NULL;
        END IF;
    END IF;
END $$;

-- ============================================
-- 3. REWRITTEN RLS POLICIES (Simplified & Recursive-Safe)
-- ============================================

-- Organizations
DROP POLICY IF EXISTS "org_isolation" ON organizations;
CREATE POLICY "org_isolation" ON organizations
  FOR SELECT USING (org_id = public.get_my_org_id());

-- User Profiles
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (org_id = public.get_my_org_id());

-- Staff Profiles
DROP POLICY IF EXISTS "staff_profiles_select" ON staff_profiles;
CREATE POLICY "staff_profiles_select" ON staff_profiles
  FOR SELECT USING (
    user_id = auth.uid() 
    OR org_id = public.get_my_org_id() -- Simple, fast check
  );

-- Role Permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "role_perms_isolation" ON role_permissions;
CREATE POLICY "role_perms_isolation" ON role_permissions
  FOR SELECT USING (org_id = public.get_my_org_id());

-- Leave Balances
DROP POLICY IF EXISTS "leave_balances_select" ON leave_balances;
CREATE POLICY "leave_balances_select" ON leave_balances
  FOR SELECT USING (org_id = public.get_my_org_id());

-- ============================================
-- 4. CRITICAL FIX: AUTOMATIC ORG_ID ASSIGNMENT
-- ============================================
-- This trigger ensures that whenever a new record is created, 
-- it automatically inherits the creator's org_id.
CREATE OR REPLACE FUNCTION public.set_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := public.get_my_org_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply this to all transactional tables (Leave, Claims, Attendance)
DROP TRIGGER IF EXISTS t_set_org_id_leave ON leave_requests;
CREATE TRIGGER t_set_org_id_leave BEFORE INSERT ON leave_requests FOR EACH ROW EXECUTE FUNCTION set_org_id();

DROP TRIGGER IF EXISTS t_set_org_id_claims ON claims;
CREATE TRIGGER t_set_org_id_claims BEFORE INSERT ON claims FOR EACH ROW EXECUTE FUNCTION set_org_id();

DROP TRIGGER IF EXISTS t_set_org_id_attendance ON attendance_logs;
CREATE TRIGGER t_set_org_id_attendance BEFORE INSERT ON attendance_logs FOR EACH ROW EXECUTE FUNCTION set_org_id();
