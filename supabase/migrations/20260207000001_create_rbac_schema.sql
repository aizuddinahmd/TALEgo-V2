-- ============================================
-- DROP EXISTING TABLES (Reset Schema)
-- ============================================
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_custom_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================
-- MULTI-TENANT ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
  org_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name TEXT NOT NULL,
  registration_number TEXT,
  industry TEXT, -- 'healthcare', 'construction', 'retail', 'services'
  fiscal_year_end TEXT DEFAULT '12-31', -- MM-DD format

  -- Subscription management
  subscription_tier TEXT DEFAULT 'free', -- free, starter, business, enterprise
  subscription_status TEXT DEFAULT 'trial', -- trial, active, suspended, cancelled
  subscription_start_date DATE,
  subscription_end_date DATE,
  trial_ends_at TIMESTAMP,

  -- Feature gates
  max_employees INT DEFAULT 10,
  features_enabled TEXT[], -- ['payroll', 'claims', 'ai_docs']

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS (Policy added later to avoid circular dependency)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES (Extended from Supabase Auth)
-- ============================================
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,

  -- Basic info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  -- Role assignment
  role_code TEXT NOT NULL, -- OWNER, ADMIN, ACCOUNTANT, HR, COSEC, FINANCE, STAFF, COUNTER

  -- Status
  status TEXT DEFAULT 'active', -- active, suspended, terminated
  is_email_verified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  joined_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,

  UNIQUE(org_id, email)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADD RLS POLICIES (After tables exist)
-- ============================================

-- ORG POLICIES
-- RLS Policy: Users can only see their own org
CREATE POLICY "org_isolation" ON organizations
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- USER PROFILE POLICIES
-- RLS: Users can view profiles in their org
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- RLS: Only OWNER and ADMIN can insert/update
CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_profiles
      WHERE org_id = user_profiles.org_id
      AND role_code IN ('OWNER', 'ADMIN')
    )
  );

-- ============================================
-- PERMISSIONS (Granular permission codes)
-- ============================================
CREATE TABLE permissions (
  permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_code TEXT UNIQUE NOT NULL, -- FIN_INCOME_VIEW, HR_LEAVE_APPROVE, etc.
  module TEXT NOT NULL, -- SYSTEM, FINANCE, HR, PAYROLL, ASSETS, TAX, COSEC, AUDIT
  action TEXT NOT NULL, -- VIEW, CREATE, EDIT, APPROVE, EXPORT, ADMIN
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed permissions (we'll insert these later)

-- ============================================
-- ROLE_PERMISSIONS (Maps roles to permissions)
-- ============================================
CREATE TABLE role_permissions (
  role_code TEXT NOT NULL, -- OWNER, ADMIN, etc.
  permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT TRUE, -- Part of default role definition
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_code, permission_id)
);

-- ============================================
-- USER_CUSTOM_PERMISSIONS (Override permissions per user)
-- ============================================
CREATE TABLE user_custom_permissions (
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL, -- TRUE = grant extra, FALSE = revoke from role
  reason TEXT,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_id)
);

-- ============================================
-- AUDIT LOGS (Track all permission-gated actions)
-- ============================================
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(user_id),

  -- Action details
  action TEXT NOT NULL, -- VIEW, CREATE, UPDATE, DELETE, APPROVE, EXPORT
  module TEXT NOT NULL, -- FINANCE, HR, PAYROLL, etc.
  resource_type TEXT, -- income, expense, leave_request, claim, etc.
  resource_id TEXT,

  -- Additional context
  details JSONB,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see logs from their org
CREATE POLICY "audit_logs_org_isolation" ON audit_logs
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- ============================================
-- APPROVAL_WORKFLOWS (Conditional approval rules)
-- ============================================
CREATE TABLE approval_workflows (
  workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,

  -- Workflow definition
  workflow_name TEXT NOT NULL,
  module TEXT NOT NULL, -- FINANCE, HR, PAYROLL
  action TEXT NOT NULL, -- EXPENSE_APPROVAL, LEAVE_APPROVAL, PAYROLL_RUN

  -- Conditions (JSON)
  conditions JSONB, -- {"amount": {"gt": 5000}, "leave_days": {"gt": 3}}

  -- Approvers
  required_approvals INT DEFAULT 1,
  approver_roles TEXT[], -- ['OWNER', 'ACCOUNTANT']
  auto_approve BOOLEAN DEFAULT FALSE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- APPROVAL_REQUESTS (Pending approvals)
-- ============================================
CREATE TABLE approval_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES approval_workflows(workflow_id),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,

  -- Requester
  requested_by UUID REFERENCES user_profiles(user_id),

  -- Request details
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  resource_data JSONB, -- Full data of what's being approved

  -- Approval status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by UUID REFERENCES user_profiles(user_id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user has permission
-- ============================================
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_permission_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_role_code TEXT;
BEGIN
  -- Get user's role
  SELECT role_code INTO v_role_code
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Check if role has this permission
  SELECT EXISTS(
    SELECT 1 FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE rp.role_code = v_role_code
    AND p.permission_code = p_permission_code
  ) INTO v_has_permission;

  -- Check for custom permissions (overrides)
  IF EXISTS(
    SELECT 1 FROM user_custom_permissions ucp
    JOIN permissions p ON ucp.permission_id = p.permission_id
    WHERE ucp.user_id = p_user_id
    AND p.permission_code = p_permission_code
  ) THEN
    SELECT is_granted INTO v_has_permission
    FROM user_custom_permissions ucp
    JOIN permissions p ON ucp.permission_id = p.permission_id
    WHERE ucp.user_id = p_user_id
    AND p.permission_code = p_permission_code;
  END IF;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check subscription feature
-- ============================================
CREATE OR REPLACE FUNCTION has_feature(
  p_org_id UUID,
  p_feature TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_feature BOOLEAN;
  v_status TEXT;
BEGIN
  -- Check subscription status
  SELECT subscription_status INTO v_status
  FROM organizations
  WHERE org_id = p_org_id;

  -- If cancelled/suspended, block features
  IF v_status IN ('cancelled', 'suspended') THEN
    RETURN FALSE;
  END IF;

  -- Check if feature is enabled
  SELECT p_feature = ANY(features_enabled) INTO v_has_feature
  FROM organizations
  WHERE org_id = p_org_id;

  RETURN COALESCE(v_has_feature, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_user_profiles_org ON user_profiles(org_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role_code);
CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_org ON approval_requests(org_id);
