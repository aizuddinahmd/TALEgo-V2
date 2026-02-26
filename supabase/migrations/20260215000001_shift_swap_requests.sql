-- ============================================
-- SHIFT SWAP REQUESTS
-- Allow staff to request shift swaps or replacements
-- ============================================

CREATE TABLE shift_swap_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  
  -- The shift being swapped
  shift_id UUID REFERENCES shift_schedules(shift_id) ON DELETE CASCADE,
  
  -- Who is requesting
  requesting_staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
  
  -- Who they want to swap with (optional - if open broadcast)
  target_staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE SET NULL,
  
  -- Request Details
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, cancelled
  
  -- Admin/Manager Action
  action_by UUID REFERENCES auth.users(id),
  action_at TIMESTAMP,
  action_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Staff can view requests they are involved in, HR/Admin can view all
CREATE POLICY "shift_swap_requests_select" ON shift_swap_requests
  FOR SELECT USING (
    requesting_staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR target_staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = shift_swap_requests.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Staff can create requests for their own shifts
CREATE POLICY "shift_swap_requests_insert" ON shift_swap_requests
  FOR INSERT WITH CHECK (
    requesting_staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
  );

-- RLS: Staff can cancel own requests, Target can accept/reject, HR can approve/reject
CREATE POLICY "shift_swap_requests_update" ON shift_swap_requests
  FOR UPDATE USING (
    requesting_staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR target_staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = shift_swap_requests.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_shift_swap_org ON shift_swap_requests(org_id);
CREATE INDEX idx_shift_swap_shift ON shift_swap_requests(shift_id);
CREATE INDEX idx_shift_swap_status ON shift_swap_requests(status);
CREATE INDEX idx_shift_swap_requesting ON shift_swap_requests(requesting_staff_id);

-- Trigger for updated_at
-- Note: update_updated_at_column() function assumed to exist from previous migrations
CREATE TRIGGER update_shift_swap_requests_updated_at
  BEFORE UPDATE ON shift_swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
