-- ============================================
-- ANNOUNCEMENTS
-- ============================================
CREATE TABLE announcements (
  announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'general', -- general, policy, event, urgent
  
  -- Targeting
  target_roles TEXT[], -- NULL = all staff, or ['HR', 'FINANCE']
  target_departments TEXT[], -- NULL = all, or ['Engineering', 'Sales']
  target_staff_ids UUID[], -- Specific staff members
  
  -- Priority & Display
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  is_pinned BOOLEAN DEFAULT FALSE,
  requires_acknowledgment BOOLEAN DEFAULT FALSE,
  
  -- Attachments
  attachment_urls TEXT[],
  
  -- Validity Period
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  
  -- Publishing
  published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP DEFAULT NOW(),
  published_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ANNOUNCEMENT ACKNOWLEDGMENTS
-- ============================================
CREATE TABLE announcement_acknowledgments (
  acknowledgment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(announcement_id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_profiles(staff_id) ON DELETE CASCADE,
  
  acknowledged_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(announcement_id, staff_id)
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS: All staff in org can view published announcements
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT USING (
    published = TRUE
    AND org_id IN (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
    AND (valid_until IS NULL OR valid_until > NOW())
  );

-- RLS: Only HR/Admin can create announcements
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = announcements.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Only HR/Admin can update announcements
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND org_id = announcements.org_id
      AND role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- RLS: Staff can acknowledge
CREATE POLICY "acknowledgments_insert" ON announcement_acknowledgments
  FOR INSERT WITH CHECK (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
  );

-- RLS: Staff can view own acknowledgments, HR can view all
CREATE POLICY "acknowledgments_select" ON announcement_acknowledgments
  FOR SELECT USING (
    staff_id IN (SELECT staff_id FROM staff_profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN announcements a ON a.org_id = up.org_id
      WHERE up.user_id = auth.uid()
      AND a.announcement_id = announcement_acknowledgments.announcement_id
      AND up.role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  );

-- Indexes
CREATE INDEX idx_announcements_org ON announcements(org_id, published, valid_until);
CREATE INDEX idx_announcements_priority ON announcements(priority, is_pinned);
CREATE INDEX idx_acknowledgments_announcement ON announcement_acknowledgments(announcement_id);
CREATE INDEX idx_acknowledgments_staff ON announcement_acknowledgments(staff_id);
