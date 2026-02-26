-- ============================================
-- LEAVE TYPES (Malaysian Standards)
-- ============================================
CREATE TABLE leave_types (
  leave_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  
  -- Leave Type Info
  leave_name TEXT NOT NULL, -- Annual Leave, Medical Leave, etc.
  leave_code TEXT NOT NULL, -- ANNUAL, MEDICAL, EMERGENCY, MATERNITY
  description TEXT,
  
  -- Entitlement Rules
  days_per_year DECIMAL NOT NULL,
  is_pro_rated BOOLEAN DEFAULT TRUE, -- Pro-rate for new joiners
  pro_rate_by TEXT DEFAULT 'month', -- month, day
  
  -- Carry Forward
  carry_forward_allowed BOOLEAN DEFAULT TRUE,
  max_carry_forward_days INT,
  carry_forward_expiry_months INT, -- Expire after X months
  
  -- Approval Requirements
  requires_approval BOOLEAN DEFAULT TRUE,
  requires_document BOOLEAN DEFAULT FALSE, -- MC required?
  min_notice_days INT DEFAULT 0, -- Min days notice before leave
  
  -- Accrual Settings
  accrual_type TEXT DEFAULT 'annual', -- annual, monthly, none
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(org_id, leave_code)
);

-- Seed default Malaysian leave types
INSERT INTO leave_types (org_id, leave_name, leave_code, days_per_year, requires_document, description)
SELECT 
  org_id,
  'Annual Leave',
  'ANNUAL',
  12.0, -- Default (will vary by tenure)
  FALSE,
  'Annual leave entitlement based on service years'
FROM organizations
UNION ALL
SELECT 
  org_id,
  'Medical Leave',
  'MEDICAL',
  14.0, -- Outpatient
  TRUE,
  'Medical leave (MC required for >2 consecutive days)'
FROM organizations
UNION ALL
SELECT 
  org_id,
  'Hospitalization',
  'HOSPITALIZATION',
  60.0,
  TRUE,
  'Hospitalization leave (separate from outpatient)'
FROM organizations
UNION ALL
SELECT 
  org_id,
  'Emergency Leave',
  'EMERGENCY',
  5.0,
  FALSE,
  'Emergency leave for family matters'
FROM organizations
UNION ALL
SELECT 
  org_id,
  'Maternity Leave',
  'MATERNITY',
  98.0,
  TRUE,
  'Maternity leave (first 5 children, fully paid)'
FROM organizations
UNION ALL
SELECT 
  org_id,
  'Paternity Leave',
  'PATERNITY',
  7.0,
  FALSE,
  'Paternity leave'
FROM organizations;

-- ============================================
-- LEAVE BALANCES
-- ============================================
CREATE TABLE leave_balances (
  balance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(leave_type_id) ON DELETE CASCADE,
  year INT NOT NULL,
  
  -- Balance Tracking
  entitled_days DECIMAL NOT NULL, -- Annual entitlement
  carried_forward DECIMAL DEFAULT 0, -- From previous year
  total_days DECIMAL GENERATED ALWAYS AS (entitled_days + carried_forward) STORED,
  used_days DECIMAL DEFAULT 0,
  pending_days DECIMAL DEFAULT 0, -- Days in pending requests
  remaining_days DECIMAL GENERATED ALWAYS AS (entitled_days + carried_forward - used_days - pending_days) STORED,
  
  -- Adjustment tracking
  adjustment_days DECIMAL DEFAULT 0, -- Manual adjustments
  adjustment_reason TEXT,
  adjusted_by UUID REFERENCES auth.users(id),
  adjusted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(staff_id, leave_type_id, year)
);

ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- RLS: Staff can view own balance, HR can view all
CREATE POLICY "leave_balances_select" ON leave_balances
  FOR SELECT USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN staff_profiles sp ON up.org_id = sp.org_id
      WHERE up.user_id = auth.uid()
      AND sp.staff_id = leave_balances.staff_id
      AND up.role_code IN ('OWNER', 'HR', 'ADMIN')
    )
  );

-- Indexes
CREATE INDEX idx_leave_balances_staff ON leave_balances(staff_id, year);
CREATE INDEX idx_leave_balances_type ON leave_balances(leave_type_id);

-- ============================================
-- LEAVE REQUESTS
-- ============================================
CREATE TABLE leave_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(leave_type_id),
  
  -- Request Details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL NOT NULL,
  is_half_day BOOLEAN DEFAULT FALSE,
  half_day_period TEXT, -- morning, afternoon
  reason TEXT,
  
  -- Supporting Documents (URLs to Supabase Storage)
  document_urls TEXT[], -- Medical certificates, etc.
  
  -- Approval Workflow
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, cancelled
  
  -- First-level approval (Manager)
  manager_reviewed_by UUID REFERENCES user_profiles(user_id),
  manager_reviewed_at TIMESTAMP,
  manager_notes TEXT,
  
  -- Final approval (HR/Owner)
  final_reviewed_by UUID REFERENCES user_profiles(user_id),
  final_reviewed_at TIMESTAMP,
  final_notes TEXT,
  
  rejection_reason TEXT,
  
  -- Cancellation (if approved but staff wants to cancel)
  cancelled_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  
  -- Coverage Information
  coverage_staff_ids UUID[], -- Staff covering this person's duties
  coverage_notes TEXT,
  
  -- Sync Status (for desktop app)
  synced_to_desktop BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Staff can view own requests, HR/Manager can view team
CREATE POLICY "leave_requests_select" ON leave_requests
  FOR SELECT USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = leave_requests.org_id
      AND role_code IN ('OWNER', 'HR', 'ADMIN')
    )
    OR EXISTS (
      -- Manager can see direct reports
      SELECT 1 FROM staff_profiles sp
      WHERE sp.staff_id = leave_requests.staff_id
      AND sp.manager_id IN (
        SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS: Staff can create own requests
CREATE POLICY "leave_requests_insert" ON leave_requests
  FOR INSERT WITH CHECK (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
  );

-- RLS: Staff can cancel pending/approved, HR can approve/reject
CREATE POLICY "leave_requests_update" ON leave_requests
  FOR UPDATE USING (
    (staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid()))
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = leave_requests.org_id
      AND role_code IN ('OWNER', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_leave_requests_staff ON leave_requests(staff_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status, org_id);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_org ON leave_requests(org_id, created_at DESC);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- FUNCTION: Initialize leave balances for new staff
CREATE OR REPLACE FUNCTION initialize_leave_balances()
RETURNS TRIGGER AS $$
DECLARE
  v_leave_type RECORD;
  v_current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
  v_entitled_days DECIMAL;
BEGIN
  -- For each active leave type in the organization
  FOR v_leave_type IN 
    SELECT * FROM leave_types 
    WHERE org_id = NEW.org_id AND is_active = TRUE
  LOOP
    -- Calculate entitled days (pro-rate if mid-year join)
    IF v_leave_type.is_pro_rated AND v_leave_type.accrual_type = 'monthly' THEN
      v_entitled_days := v_leave_type.days_per_year * 
        (13 - EXTRACT(MONTH FROM NEW.join_date)) / 12.0;
    ELSE
      v_entitled_days := v_leave_type.days_per_year;
    END IF;
    
    -- Insert leave balance
    INSERT INTO leave_balances (
      staff_id,
      leave_type_id,
      year,
      entitled_days,
      carried_forward
    ) VALUES (
      NEW.staff_id,
      v_leave_type.leave_type_id,
      v_current_year,
      v_entitled_days,
      0
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-create balances when staff is created
CREATE TRIGGER trigger_initialize_leave_balances
AFTER INSERT ON staff_profiles
FOR EACH ROW
EXECUTE FUNCTION initialize_leave_balances();

-- FUNCTION: Update leave balance on approval
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Move from pending to used
    UPDATE leave_balances
    SET 
      used_days = used_days + NEW.total_days,
      pending_days = pending_days - NEW.total_days,
      updated_at = NOW()
    WHERE 
      staff_id = NEW.staff_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  
  -- If rejected, remove from pending
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    UPDATE leave_balances
    SET 
      pending_days = pending_days - NEW.total_days,
      updated_at = NOW()
    WHERE 
      staff_id = NEW.staff_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  
  -- If cancelled after approval, restore balance
  ELSIF NEW.status = 'cancelled' AND OLD.status = 'approved' THEN
    UPDATE leave_balances
    SET 
      used_days = used_days - NEW.total_days,
      updated_at = NOW()
    WHERE 
      staff_id = NEW.staff_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update balances on leave request status change
CREATE TRIGGER trigger_update_leave_balance
AFTER UPDATE ON leave_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_leave_balance_on_approval();

-- FUNCTION: Update pending days on request creation
CREATE OR REPLACE FUNCTION update_pending_on_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Add to pending days when request is created
  UPDATE leave_balances
  SET 
    pending_days = pending_days + NEW.total_days,
    updated_at = NOW()
  WHERE 
    staff_id = NEW.staff_id
    AND leave_type_id = NEW.leave_type_id
    AND year = EXTRACT(YEAR FROM NEW.start_date);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update pending on insert
CREATE TRIGGER trigger_pending_on_insert
AFTER INSERT ON leave_requests
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION update_pending_on_request();

-- FUNCTION: Annual leave balance rollover
CREATE OR REPLACE FUNCTION rollover_leave_balances(p_org_id UUID, p_year INT)
RETURNS VOID AS $$
DECLARE
  v_balance RECORD;
  v_carry_forward DECIMAL;
BEGIN
  -- For each staff's leave balance from previous year
  FOR v_balance IN 
    SELECT lb.*, lt.max_carry_forward_days, lt.carry_forward_allowed
    FROM leave_balances lb
    JOIN leave_types lt ON lb.leave_type_id = lt.leave_type_id
    WHERE lb.year = p_year - 1
    AND lt.org_id = p_org_id
    AND lt.is_active = TRUE
  LOOP
    -- Calculate carry forward amount
    IF v_balance.carry_forward_allowed THEN
      v_carry_forward := LEAST(
        v_balance.remaining_days,
        COALESCE(v_balance.max_carry_forward_days, v_balance.remaining_days)
      );
    ELSE
      v_carry_forward := 0;
    END IF;
    
    -- Create new year balance
    INSERT INTO leave_balances (
      staff_id,
      leave_type_id,
      year,
      entitled_days,
      carried_forward
    ) VALUES (
      v_balance.staff_id,
      v_balance.leave_type_id,
      p_year,
      v_balance.entitled_days, -- Same entitlement (adjust if tenure changed)
      v_carry_forward
    )
    ON CONFLICT (staff_id, leave_type_id, year) DO UPDATE
    SET carried_forward = v_carry_forward;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
