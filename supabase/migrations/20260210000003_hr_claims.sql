-- ============================================
-- CLAIM CATEGORIES
-- ============================================
CREATE TABLE claim_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  
  category_name TEXT NOT NULL, -- Mileage, Medical, Travel, etc.
  category_code TEXT NOT NULL, -- MILEAGE, MEDICAL, TRAVEL
  description TEXT,
  
  -- Limits
  per_claim_limit DECIMAL, -- Max per single claim
  monthly_limit DECIMAL, -- Max per month
  annual_limit DECIMAL, -- Max per year
  
  -- Requirements
  requires_receipt BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  auto_approve_below DECIMAL, -- Auto-approve if below this amount
  
  -- Reimbursement rate (for mileage)
  rate_per_unit DECIMAL, -- e.g., RM 0.70 per km
  rate_unit TEXT, -- km, hour, etc.
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(org_id, category_code)
);

-- Seed default claim categories
INSERT INTO claim_categories (org_id, category_name, category_code, requires_receipt, rate_per_unit, rate_unit)
SELECT org_id, 'Mileage', 'MILEAGE', FALSE, 0.70, 'km' FROM organizations
UNION ALL
SELECT org_id, 'Medical', 'MEDICAL', TRUE, NULL, NULL FROM organizations
UNION ALL
SELECT org_id, 'Travel', 'TRAVEL', TRUE, NULL, NULL FROM organizations
UNION ALL
SELECT org_id, 'Meal Allowance', 'MEAL', TRUE, NULL, NULL FROM organizations
UNION ALL
SELECT org_id, 'Parking & Toll', 'PARKING_TOLL', TRUE, NULL, NULL FROM organizations
UNION ALL
SELECT org_id, 'Phone Bill', 'PHONE', TRUE, NULL, NULL FROM organizations;

-- ============================================
-- CLAIMS
-- ============================================
CREATE TABLE claims (
  claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
  category_id UUID REFERENCES claim_categories(category_id),
  
  -- Claim Details
  claim_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  
  -- For mileage claims
  distance DECIMAL, -- km
  rate_per_km DECIMAL,
  
  -- Receipt Management
  receipt_urls TEXT[], -- URLs to Supabase Storage
  has_receipt BOOLEAN DEFAULT FALSE,
  
  -- Approval Workflow
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid, cancelled
  reviewed_by UUID REFERENCES user_profiles(user_id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Payment Tracking
  payment_date DATE,
  payment_reference TEXT, -- Bank transfer ref
  payment_method TEXT, -- bank_transfer, cash, salary_offset
  
  -- Sync Status
  synced_to_desktop BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- RLS: Staff can view own claims, HR can view all
CREATE POLICY "claims_select" ON claims
  FOR SELECT USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = claims.org_id
      AND role_code IN ('OWNER', 'HR', 'ADMIN')
    )
  );

-- RLS: Staff can create own claims
CREATE POLICY "claims_insert" ON claims
  FOR INSERT WITH CHECK (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
  );

-- RLS: Staff can cancel pending, HR can approve/reject
CREATE POLICY "claims_update" ON claims
  FOR UPDATE USING (
    (staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid()) AND status = 'pending')
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = claims.org_id
      AND role_code IN ('OWNER', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_claims_staff ON claims(staff_id);
CREATE INDEX idx_claims_status ON claims(status, org_id);
CREATE INDEX idx_claims_date ON claims(claim_date DESC);
CREATE INDEX idx_claims_org ON claims(org_id, created_at DESC);
