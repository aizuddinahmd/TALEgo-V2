-- Based on your RBAC document, insert all permission codes

-- A) SYSTEM CORE
INSERT INTO permissions (permission_code, module, action, description) VALUES
-- Org Settings
('SYS_ORG_VIEW', 'SYSTEM', 'VIEW', 'View organization settings'),
('SYS_ORG_EDIT', 'SYSTEM', 'EDIT', 'Edit organization settings'),
('SYS_ORG_ADMIN', 'SYSTEM', 'ADMIN', 'Admin organization setup'),

-- User Management
('SYS_USER_VIEW', 'SYSTEM', 'VIEW', 'View users list'),
('SYS_USER_INVITE', 'SYSTEM', 'CREATE', 'Invite new users'),
('SYS_USER_EDIT', 'SYSTEM', 'EDIT', 'Edit user roles'),
('SYS_USER_ADMIN', 'SYSTEM', 'ADMIN', 'Full user management'),

-- Permission Matrix
('SYS_PERMISSION_VIEW', 'SYSTEM', 'VIEW', 'View permission matrix'),
('SYS_PERMISSION_EDIT', 'SYSTEM', 'EDIT', 'Edit permission matrix'),

-- Subscription
('SYS_SUBSCRIPTION_VIEW', 'SYSTEM', 'VIEW', 'View subscription status'),
('SYS_SUBSCRIPTION_ADMIN', 'SYSTEM', 'ADMIN', 'Manage subscription'),

-- F) HR & STAFF OPS
-- Staff Profile
('HR_PROFILE_VIEW', 'HR', 'VIEW', 'View staff profiles'),
('HR_PROFILE_CREATE', 'HR', 'CREATE', 'Create staff profile'),
('HR_PROFILE_EDIT', 'HR', 'EDIT', 'Edit staff profile'),
('HR_PROFILE_APPROVE', 'HR', 'APPROVE', 'Approve profile changes'),
('HR_PROFILE_VIEW_OWN', 'HR', 'VIEW', 'View own profile'),

-- Leave Management
('HR_LEAVE_VIEW', 'HR', 'VIEW', 'View all leave requests'),
('HR_LEAVE_CREATE', 'HR', 'CREATE', 'Apply for leave'),
('HR_LEAVE_APPROVE', 'HR', 'APPROVE', 'Approve leave requests'),
('HR_LEAVE_VIEW_OWN', 'HR', 'VIEW', 'View own leave'),

-- Leave Calendar
('HR_CALENDAR_VIEW', 'HR', 'VIEW', 'View leave calendar'),

-- Claims
('HR_CLAIM_VIEW', 'HR', 'VIEW', 'View all claims'),
('HR_CLAIM_CREATE', 'HR', 'CREATE', 'Submit claim'),
('HR_CLAIM_APPROVE', 'HR', 'APPROVE', 'Approve claims'),
('HR_CLAIM_VIEW_OWN', 'HR', 'VIEW', 'View own claims'),

-- Announcements
('HR_ANNOUNCEMENT_VIEW', 'HR', 'VIEW', 'View announcements'),
('HR_ANNOUNCEMENT_CREATE', 'HR', 'CREATE', 'Create announcements'),
('HR_ANNOUNCEMENT_EDIT', 'HR', 'EDIT', 'Edit announcements'),

-- G) PAYROLL PROCESSING
-- Payroll Config
('PAYROLL_CONFIG_VIEW', 'PAYROLL', 'VIEW', 'View payroll configuration'),
('PAYROLL_CONFIG_EDIT', 'PAYROLL', 'EDIT', 'Edit payroll config'),
('PAYROLL_CONFIG_APPROVE', 'PAYROLL', 'APPROVE', 'Approve config changes'),

-- Payroll Run
('PAYROLL_RUN_VIEW', 'PAYROLL', 'VIEW', 'View payroll runs'),
('PAYROLL_RUN_CREATE', 'PAYROLL', 'CREATE', 'Run payroll'),
('PAYROLL_RUN_APPROVE', 'PAYROLL', 'APPROVE', 'Approve payroll'),

-- Payslips
('PAYROLL_PAYSLIP_VIEW_ALL', 'PAYROLL', 'VIEW', 'View all payslips'),
('PAYROLL_PAYSLIP_VIEW_OWN', 'PAYROLL', 'VIEW', 'View own payslip'),

-- EA Forms
('PAYROLL_EA_VIEW_ALL', 'PAYROLL', 'VIEW', 'View all EA forms'),
('PAYROLL_EA_CREATE', 'PAYROLL', 'CREATE', 'Generate EA forms'),
('PAYROLL_EA_EXPORT', 'PAYROLL', 'EXPORT', 'Export EA forms'),
('PAYROLL_EA_VIEW_OWN', 'PAYROLL', 'VIEW', 'View own EA form'),

-- H) PAYROLL DISBURSEMENT & STATUTORY
-- Bank File Export
('PAYROLL_BANK_EXPORT_VIEW', 'PAYROLL', 'VIEW', 'View bank export file'),
('PAYROLL_BANK_EXPORT_CREATE', 'PAYROLL', 'CREATE', 'Generate bank file'),
('PAYROLL_BANK_EXPORT_APPROVE', 'PAYROLL', 'APPROVE', 'Approve bank file'),
('PAYROLL_BANK_EXPORT_DOWNLOAD', 'PAYROLL', 'EXPORT', 'Download bank file'),

-- Disbursement
('PAYROLL_DISBURSE_VIEW', 'PAYROLL', 'VIEW', 'View disbursement log'),
('PAYROLL_DISBURSE_CREATE', 'PAYROLL', 'CREATE', 'Record disbursement'),
('PAYROLL_DISBURSE_APPROVE', 'PAYROLL', 'APPROVE', 'Approve disbursement'),

-- EPF/SOCSO/EIS Exports
('PAYROLL_EPF_VIEW', 'PAYROLL', 'VIEW', 'View EPF export'),
('PAYROLL_EPF_CREATE', 'PAYROLL', 'CREATE', 'Generate EPF file'),
('PAYROLL_EPF_APPROVE', 'PAYROLL', 'APPROVE', 'Approve EPF file'),
('PAYROLL_EPF_EXPORT', 'PAYROLL', 'EXPORT', 'Download EPF file'),

('PAYROLL_SOCSO_VIEW', 'PAYROLL', 'VIEW', 'View SOCSO export'),
('PAYROLL_SOCSO_CREATE', 'PAYROLL', 'CREATE', 'Generate SOCSO file'),
('PAYROLL_SOCSO_APPROVE', 'PAYROLL', 'APPROVE', 'Approve SOCSO file'),
('PAYROLL_SOCSO_EXPORT', 'PAYROLL', 'EXPORT', 'Download SOCSO file'),

('PAYROLL_EIS_VIEW', 'PAYROLL', 'VIEW', 'View EIS export'),
('PAYROLL_EIS_CREATE', 'PAYROLL', 'CREATE', 'Generate EIS file'),
('PAYROLL_EIS_APPROVE', 'PAYROLL', 'APPROVE', 'Approve EIS file'),
('PAYROLL_EIS_EXPORT', 'PAYROLL', 'EXPORT', 'Download EIS file'),

-- Statutory Summary
('PAYROLL_STATUTORY_VIEW', 'PAYROLL', 'VIEW', 'View statutory summary'),

-- I) AI DOCUMENTS
-- Offer Letters
('AI_OFFER_VIEW', 'AI_DOCS', 'VIEW', 'View offer letters'),
('AI_OFFER_CREATE', 'AI_DOCS', 'CREATE', 'Generate offer letter'),
('AI_OFFER_APPROVE', 'AI_DOCS', 'APPROVE', 'Approve offer letter'),

-- Contracts
('AI_CONTRACT_VIEW', 'AI_DOCS', 'VIEW', 'View contracts'),
('AI_CONTRACT_CREATE', 'AI_DOCS', 'CREATE', 'Generate contract'),

-- Template Manager
('AI_TEMPLATE_VIEW', 'AI_DOCS', 'VIEW', 'View templates'),
('AI_TEMPLATE_EDIT', 'AI_DOCS', 'EDIT', 'Edit templates'),
('AI_TEMPLATE_ADMIN', 'AI_DOCS', 'ADMIN', 'Admin template manager'),

-- Version Control
('AI_VERSION_VIEW', 'AI_DOCS', 'VIEW', 'View document versions'),
('AI_VERSION_CREATE', 'AI_DOCS', 'CREATE', 'Track versions'),

-- J) AUDIT & WORKFLOW
-- Audit Log
('AUDIT_LOG_VIEW', 'AUDIT', 'VIEW', 'View full audit logs'),
('AUDIT_LOG_VIEW_LIMITED', 'AUDIT', 'VIEW', 'View limited logs'),

-- Workflow Rules
('WORKFLOW_RULES_VIEW', 'AUDIT', 'VIEW', 'View approval rules'),
('WORKFLOW_RULES_CREATE', 'AUDIT', 'CREATE', 'Suggest approval rules'),
('WORKFLOW_RULES_ADMIN', 'AUDIT', 'ADMIN', 'Admin approval rules'),

-- Audit Mode
('AUDIT_MODE_VIEW', 'AUDIT', 'VIEW', 'View in read-only audit mode'),
('AUDIT_MODE_ADMIN', 'AUDIT', 'ADMIN', 'Enable/disable audit mode');
