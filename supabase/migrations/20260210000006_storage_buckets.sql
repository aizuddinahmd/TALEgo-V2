-- ============================================
-- SUPABASE STORAGE BUCKETS
-- ============================================

-- Create storage bucket for medical certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-certificates', 'medical-certificates', false);

-- Create storage bucket for generated documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-documents', 'generated-documents', false);

-- Create storage bucket for announcement attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-attachments', 'announcement-attachments', false);

-- Create storage bucket for claim receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-receipts', 'claim-receipts', false);

-- ============================================
-- STORAGE POLICIES: Medical Certificates
-- ============================================

-- Staff can upload their own medical certificates
CREATE POLICY "Staff can upload own MCs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-certificates'
  AND auth.uid() IN (
    SELECT user_id FROM staff_profiles 
    WHERE staff_id::text = (storage.foldername(name))[1]
  )
);

-- Staff can view their own MCs, HR can view all in their org
CREATE POLICY "Staff view own MCs, HR view all"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-certificates'
  AND (
    -- Own files
    auth.uid() IN (
      SELECT user_id FROM staff_profiles 
      WHERE staff_id::text = (storage.foldername(name))[1]
    )
    -- Or HR/Admin in same org
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN staff_profiles sp ON sp.org_id = up.org_id
      WHERE up.user_id = auth.uid()
      AND sp.staff_id::text = (storage.foldername(name))[1]
      AND up.role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  )
);

-- Staff can delete own MCs
CREATE POLICY "Staff delete own MCs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-certificates'
  AND auth.uid() IN (
    SELECT user_id FROM staff_profiles 
    WHERE staff_id::text = (storage.foldername(name))[1]
  )
);

-- ============================================
-- STORAGE POLICIES: Generated Documents
-- ============================================

-- Only HR/Admin can upload generated documents
CREATE POLICY "HR can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role_code IN ('OWNER', 'ADMIN', 'HR')
  )
);

-- Staff can view documents in their folder, HR can view all in org
CREATE POLICY "Staff view own docs, HR view all"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-documents'
  AND (
    -- Own documents (stored in staff_id folder)
    auth.uid() IN (
      SELECT user_id FROM staff_profiles 
      WHERE staff_id::text = (storage.foldername(name))[1]
    )
    -- Or HR/Admin in same org
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN staff_profiles sp ON sp.org_id = up.org_id
      WHERE up.user_id = auth.uid()
      AND sp.staff_id::text = (storage.foldername(name))[1]
      AND up.role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  )
);

-- Only HR can delete generated documents
CREATE POLICY "HR delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'generated-documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role_code IN ('OWNER', 'ADMIN', 'HR')
  )
);

-- ============================================
-- STORAGE POLICIES: Announcement Attachments
-- ============================================

-- Only HR/Admin can upload announcement attachments
CREATE POLICY "HR upload announcements"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'announcement-attachments'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role_code IN ('OWNER', 'ADMIN', 'HR')
  )
);

-- All staff in org can view announcement attachments
CREATE POLICY "All staff view announcements"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'announcement-attachments'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
  )
);

-- Only HR can delete announcement attachments
CREATE POLICY "HR delete announcements"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'announcement-attachments'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role_code IN ('OWNER', 'ADMIN', 'HR')
  )
);

-- ============================================
-- STORAGE POLICIES: Claim Receipts
-- ============================================

-- Staff can upload their own claim receipts
CREATE POLICY "Staff upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'claim-receipts'
  AND auth.uid() IN (
    SELECT user_id FROM staff_profiles 
    WHERE staff_id::text = (storage.foldername(name))[1]
  )
);

-- Staff can view own receipts, HR can view all in org
CREATE POLICY "Staff view own receipts, HR view all"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'claim-receipts'
  AND (
    -- Own files
    auth.uid() IN (
      SELECT user_id FROM staff_profiles 
      WHERE staff_id::text = (storage.foldername(name))[1]
    )
    -- Or HR/Admin in same org
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN staff_profiles sp ON sp.org_id = up.org_id
      WHERE up.user_id = auth.uid()
      AND sp.staff_id::text = (storage.foldername(name))[1]
      AND up.role_code IN ('OWNER', 'ADMIN', 'HR')
    )
  )
);

-- Staff can delete own receipts if claim is still pending
CREATE POLICY "Staff delete own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'claim-receipts'
  AND auth.uid() IN (
    SELECT user_id FROM staff_profiles 
    WHERE staff_id::text = (storage.foldername(name))[1]
  )
);
