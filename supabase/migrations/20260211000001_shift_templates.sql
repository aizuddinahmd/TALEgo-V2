-- ============================================
-- SHIFT TEMPLATES
-- Standard shift patterns that can be reused
-- ============================================

CREATE TABLE shift_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  
  -- Template Details
  template_name TEXT NOT NULL, -- e.g., "Morning Shift", "Night Call", "Locum Shift"
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_mins INT DEFAULT 60,
  
  -- Styling
  color_code TEXT DEFAULT '#D4AF37', -- Gold for TALEtrack theme
  
  -- Configuration
  late_threshold_mins INT DEFAULT 15, -- Minutes allowed before marking as late
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;

-- RLS: All staff in org can view templates
CREATE POLICY "shift_templates_select" ON shift_templates
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- RLS: Only HR/Admin can create templates
CREATE POLICY "shift_templates_insert" ON shift_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = shift_templates.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Only HR/Admin can update templates
CREATE POLICY "shift_templates_update" ON shift_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = shift_templates.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Only HR/Admin can delete templates
CREATE POLICY "shift_templates_delete" ON shift_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = shift_templates.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_shift_templates_org ON shift_templates(org_id);
CREATE INDEX idx_shift_templates_active ON shift_templates(is_active) WHERE is_active = TRUE;

-- ============================================
-- ENHANCEMENTS TO EXISTING TABLES
-- ============================================

-- Add template reference to shift_schedules
ALTER TABLE shift_schedules
  ADD COLUMN template_id UUID REFERENCES shift_templates(template_id) ON DELETE SET NULL;

-- Add late threshold to shift_schedules (can override template default)
ALTER TABLE shift_schedules
  ADD COLUMN late_threshold_mins INT DEFAULT 15;

-- Add function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for shift_templates
CREATE TRIGGER update_shift_templates_updated_at
  BEFORE UPDATE ON shift_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for shift_schedules
CREATE TRIGGER update_shift_schedules_updated_at
  BEFORE UPDATE ON shift_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for shift_assignments
CREATE TRIGGER update_shift_assignments_updated_at
  BEFORE UPDATE ON shift_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for attendance_logs
CREATE TRIGGER update_attendance_logs_updated_at
  BEFORE UPDATE ON attendance_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
