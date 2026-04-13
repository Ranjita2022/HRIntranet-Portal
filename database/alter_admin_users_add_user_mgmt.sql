-- ================================================================
-- Migration: Add admin user management fields
-- Date: 2026-04-13
-- Description: Add must_change_password and employee_id columns
--              to admin_users table for the User Management feature
-- ================================================================

-- Add must_change_password and employee_id columns
ALTER TABLE admin_users
  ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN employee_id VARCHAR(50) NULL;

-- Add index on employee_id for quick lookups
CREATE INDEX idx_employee_id ON admin_users(employee_id);

-- Mark existing users as NOT requiring password change (they already have passwords set)
UPDATE admin_users SET must_change_password = 0;

-- Verify changes
SELECT id, username, full_name, role, is_active, must_change_password, employee_id
FROM admin_users;

-- ================================================================
-- DONE! Existing users are unaffected.
-- New users created via "Grant Admin Access" will have:
--   must_change_password = 1 (forced to change on first login)
--   employee_id = linked employee ID
-- ================================================================
