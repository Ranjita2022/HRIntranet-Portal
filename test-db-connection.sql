-- Quick database connection and data verification test
-- Run this in MySQL Workbench before starting backend

USE hr_intranet_portal;

-- Test 1: Check if database exists and is selected
SELECT DATABASE() as current_database;

-- Test 2: Verify all tables exist
SHOW TABLES;

-- Test 3: Count records in all tables
SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL SELECT 'announcements', COUNT(*) FROM announcements  
UNION ALL SELECT 'work_anniversaries', COUNT(*) FROM work_anniversaries
UNION ALL SELECT 'carousel_slides', COUNT(*) FROM carousel_slides
UNION ALL SELECT 'gallery_images', COUNT(*) FROM gallery_images
UNION ALL SELECT 'quick_links', COUNT(*) FROM quick_links
UNION ALL SELECT 'emergency_contacts', COUNT(*) FROM emergency_contacts;

-- Test 4: Verify employee status values match Java enum (must be uppercase)
SELECT DISTINCT status FROM employees;

-- Test 5: Sample employee query (matching backend logic)
SELECT id, employee_id, first_name, last_name, email, position, department, start_date, status 
FROM employees 
WHERE status = 'ACTIVE' 
  AND start_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
ORDER BY start_date DESC
LIMIT 5;

-- Test 6: Verify announcements with work anniversaries
SELECT id, title, announcement_date, category, is_active 
FROM announcements 
WHERE is_active = TRUE 
ORDER BY announcement_date DESC 
LIMIT 5;

-- Expected Results:
-- ✓ Database: hr_intranet_portal
-- ✓ 11 tables exist
-- ✓ employees: 15, announcements: 13+, work_anniversaries: 12, carousel_slides: 5, gallery_images: 20
-- ✓ Employee status: ACTIVE (uppercase)
-- ✓ Recent employees from 2025-2026 visible
-- ✓ Work anniversary announcements visible
