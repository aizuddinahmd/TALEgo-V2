-- supabase/migrations/20260210000001_hr_staff_profiles.sql

-- ============================================
-- STAFF PROFILES (Extended employee data)
-- ============================================
CREATE TABLE staff_profiles (
  staff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  
  -- Basic Info
  employee_number TEXT, -- e.g., EMP001
  full_name TEXT NOT NULL,
  ic_number TEXT, -- Store encrypted in application
  date_of_birth DATE,
  gender TEXT, -- Male, Female
  marital_status TEXT, -- Single, Married, Divorced
  nationality TEXT DEFAULT 'Malaysian',
  
  -- Contact
  email TEXT NOT NULL,
  phone_mobile TEXT,
  phone_home TEXT,
  address_current TEXT,
  address_permanent TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  
  -- Employment Details
  position TEXT,
  department TEXT,
  join_date DATE NOT NULL,
  confirmation_date DATE,
  employment_type TEXT, -- Full-time, Part-time, Contract, Intern
  work_location TEXT,
  manager_id UUID REFERENCES staff_profiles(staff_id),
  
  -- Compensation Summary (actual salary in desktop app)
  salary_band TEXT, -- 'Below 5K', '5K-10K', '10K-15K', 'Above 15K'
  
  -- Statutory Numbers
  epf_number TEXT,
  socso_number TEXT,
  tax_number TEXT,
  bank_name TEXT,
  bank_account_number TEXT, -- Store encrypted
  
  -- Status
  status TEXT DEFAULT 'active', -- active, probation, on_leave, terminated
  termination_date DATE,
  termination_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(org_id, email),
  UNIQUE(org_id, employee_number)
);

-- Enable RLS
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Staff can view own profile, HR/Owner can view all
CREATE POLICY "staff_profiles_select" ON staff_profiles
  FOR SELECT USING (
    user_id = auth.uid() -- Own profile
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = staff_profiles.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR', 'ACCOUNTANT')
    )
  );

-- RLS: Only HR/Admin can create
CREATE POLICY "staff_profiles_insert" ON staff_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = staff_profiles.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Staff can update own profile (limited fields), HR can update all
CREATE POLICY "staff_profiles_update" ON staff_profiles
  FOR UPDATE USING (
    user_id = auth.uid() -- Own profile (limited)
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = staff_profiles.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_staff_profiles_org ON staff_profiles(org_id);
CREATE INDEX idx_staff_profiles_status ON staff_profiles(status);
CREATE INDEX idx_staff_profiles_user ON staff_profiles(user_id);
CREATE INDEX idx_staff_profiles_manager ON staff_profiles(manager_id);