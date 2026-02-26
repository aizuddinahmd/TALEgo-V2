-- ============================================
-- ATTENDANCE LOGS
-- ============================================
CREATE TABLE attendance_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
  
  -- Clock In/Out Details
  checkin_time TIMESTAMP NOT NULL,
  checkout_time TIMESTAMP,
  
  -- Geolocation
  checkin_lat DECIMAL(10, 8), -- Latitude
  checkin_lng DECIMAL(11, 8), -- Longitude
  checkout_lat DECIMAL(10, 8),
  checkout_lng DECIMAL(11, 8),
  
  -- Location Name (for reference)
  checkin_location TEXT,
  checkout_location TEXT,
  
  -- Work Duration (auto-calculated)
  total_hours DECIMAL GENERATED ALWAYS AS (
    CASE 
      WHEN checkout_time IS NOT NULL THEN
        EXTRACT(EPOCH FROM (checkout_time - checkin_time)) / 3600
      ELSE NULL
    END
  ) STORED,
  
  -- Shift Reference (if part of scheduled shift)
  shift_id UUID, -- Will reference shift_schedules
  
  -- Status
  status TEXT DEFAULT 'active', -- active, completed, no_checkout
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Staff can view own logs, HR can view all
CREATE POLICY "attendance_logs_select" ON attendance_logs
  FOR SELECT USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = attendance_logs.org_id
      AND role_code IN ('OWNER', 'HR', 'ADMIN')
    )
  );

-- RLS: Staff can create own attendance logs
CREATE POLICY "attendance_logs_insert" ON attendance_logs
  FOR INSERT WITH CHECK (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
  );

-- RLS: Staff can update own logs (for checkout), HR can update all
CREATE POLICY "attendance_logs_update" ON attendance_logs
  FOR UPDATE USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = attendance_logs.org_id
      AND role_code IN ('OWNER', 'HR', 'ADMIN')
    )
  );

-- Indexes
CREATE INDEX idx_attendance_staff ON attendance_logs(staff_id, checkin_time DESC);
CREATE INDEX idx_attendance_org ON attendance_logs(org_id, checkin_time DESC);
CREATE INDEX idx_attendance_status ON attendance_logs(status);

-- ============================================
-- SHIFT SCHEDULES (For Locum Management)
-- ============================================
CREATE TABLE shift_schedules (
  shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  
  -- Shift Details
  shift_name TEXT NOT NULL, -- e.g., "Morning Clinic - Bukit Jalil"
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Location
  location_name TEXT NOT NULL,
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Staffing Requirements
  required_staff INT DEFAULT 1,
  max_staff INT DEFAULT 1,
  
  -- Shift Type
  shift_type TEXT DEFAULT 'regular', -- regular, locum, emergency, on_call
  
  -- Compensation (for locum)
  hourly_rate DECIMAL,
  fixed_rate DECIMAL,
  
  -- Status
  status TEXT DEFAULT 'open', -- open, filled, in_progress, completed, cancelled
  
  -- Instructions
  instructions TEXT,
  special_requirements TEXT,
  
  -- Created By
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;

-- RLS: All staff in org can view shifts
CREATE POLICY "shift_schedules_select" ON shift_schedules
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- RLS: Only HR/Admin can create shifts
CREATE POLICY "shift_schedules_insert" ON shift_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = shift_schedules.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Only HR/Admin can update shifts
CREATE POLICY "shift_schedules_update" ON shift_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = shift_schedules.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_shifts_org ON shift_schedules(org_id, shift_date DESC);
CREATE INDEX idx_shifts_date ON shift_schedules(shift_date, start_time);
CREATE INDEX idx_shifts_status ON shift_schedules(status);

-- ============================================
-- SHIFT ASSIGNMENTS (Many-to-Many)
-- ============================================
CREATE TABLE shift_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shift_schedules(shift_id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
  
  -- Assignment Details
  assignment_type TEXT DEFAULT 'assigned', -- assigned, claimed, backup
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  
  -- Confirmation
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP,
  
  -- Attendance Reference
  attendance_log_id UUID REFERENCES attendance_logs(log_id),
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shift_id, staff_id)
);

ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

-- RLS: Staff can view own assignments, HR can view all
CREATE POLICY "shift_assignments_select" ON shift_assignments
  FOR SELECT USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN shift_schedules ss ON ss.org_id = up.org_id
      WHERE up.user_id = auth.uid()
      AND ss.shift_id = shift_assignments.shift_id
      AND up.role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Staff can claim open shifts (create assignment)
CREATE POLICY "shift_assignments_insert" ON shift_assignments
  FOR INSERT WITH CHECK (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN shift_schedules ss ON ss.org_id = up.org_id
      WHERE up.user_id = auth.uid()
      AND ss.shift_id = shift_assignments.shift_id
      AND up.role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Staff can update own assignments (confirm/cancel), HR can update all
CREATE POLICY "shift_assignments_update" ON shift_assignments
  FOR UPDATE USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN shift_schedules ss ON ss.org_id = up.org_id
      WHERE up.user_id = auth.uid()
      AND ss.shift_id = shift_assignments.shift_id
      AND up.role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_shift_assignments_shift ON shift_assignments(shift_id);
CREATE INDEX idx_shift_assignments_staff ON shift_assignments(staff_id, created_at DESC);
CREATE INDEX idx_shift_assignments_status ON shift_assignments(status);

-- Add foreign key constraint for shift reference in attendance_logs
ALTER TABLE attendance_logs
  ADD CONSTRAINT fk_attendance_shift
  FOREIGN KEY (shift_id) REFERENCES shift_schedules(shift_id)
  ON DELETE SET NULL;
