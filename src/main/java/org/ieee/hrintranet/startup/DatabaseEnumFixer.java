package org.ieee.hrintranet.startup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DatabaseEnumFixer {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseEnumFixer.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostConstruct
    public void fixAllEnums() {
        try {
            logger.info("=== Checking and fixing database ENUM values ===");
            
            // Fix 1: Image.image_type ENUM
            fixImageTypeEnum();
            
            // Fix 2: AdminUser.role ENUM
            fixAdminUserRoleEnum();
            
            // Fix 3: Announcement.type ENUM
            fixAnnouncementTypeEnum();
            
            // Fix 4: Employee.status ENUM
            fixEmployeeStatusEnum();
            
            // Fix 5: EmergencyContact.type ENUM
            fixEmergencyContactTypeEnum();
            
            logger.info("✓ All database enum fixes completed successfully!");
            
        } catch (Exception e) {
            logger.warn("Could not apply enum fixes (might already be fixed): {}", e.getMessage());
        }
    }
    
    private void fixImageTypeEnum() {
        try {
            // Check if fix is needed by looking for lowercase values
            Integer lowercaseCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM images WHERE image_type REGEXP '^[a-z]'", 
                Integer.class
            );
            
            if (lowercaseCount != null && lowercaseCount > 0) {
                logger.info("Found {} rows with lowercase image_type enum values. Applying fix...", lowercaseCount);
                
                // Step 1: Convert ENUM to VARCHAR temporarily
                logger.info("Step 1: Converting image_type to VARCHAR...");
                jdbcTemplate.execute("ALTER TABLE images MODIFY COLUMN image_type VARCHAR(30) NOT NULL");
                
                // Step 2: Update values to uppercase
                logger.info("Step 2: Converting values to uppercase...");
                int updated = jdbcTemplate.update("UPDATE images SET image_type = UPPER(image_type)");
                logger.info("Updated {} rows to uppercase", updated);
                
                // Step 3: Convert back to ENUM with uppercase values
                logger.info("Step 3: Converting back to ENUM with uppercase values...");
                jdbcTemplate.execute(
                    "ALTER TABLE images MODIFY COLUMN image_type " +
                    "ENUM('EMPLOYEE_PROFILE', 'CAROUSEL', 'ANNOUNCEMENT', 'OTHER') NOT NULL"
                );
                
                logger.info("✓ image_type enum fix completed!");
            } else {
                logger.info("✓ image_type enum values are already correct.");
            }
        } catch (Exception e) {
            logger.warn("Could not fix image_type enum: {}", e.getMessage());
        }
    }
    
    private void fixAdminUserRoleEnum() {
        try {
            // Check if fix is needed by looking for lowercase/underscore values
            Integer lowercaseCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM admin_users WHERE role REGEXP '[a-z_]'", 
                Integer.class
            );
            
            if (lowercaseCount != null && lowercaseCount > 0) {
                logger.info("Found {} rows with lowercase/underscore role enum values. Applying fix...", lowercaseCount);
                
                // Step 1: Convert ENUM to VARCHAR temporarily
                logger.info("Step 1: Converting role to VARCHAR...");
                jdbcTemplate.execute("ALTER TABLE admin_users MODIFY COLUMN role VARCHAR(30) NOT NULL");
                
                // Step 2: Update values to uppercase with underscores
                logger.info("Step 2: Converting values to uppercase...");
                jdbcTemplate.update("UPDATE admin_users SET role = 'SUPER_ADMIN' WHERE role = 'super_admin'");
                jdbcTemplate.update("UPDATE admin_users SET role = 'ADMIN' WHERE role = 'admin'");
                jdbcTemplate.update("UPDATE admin_users SET role = 'HR_STAFF' WHERE role = 'hr_staff'");
                Integer updatedObj = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM admin_users", Integer.class);
                int updated = updatedObj != null ? updatedObj : 0;
                logger.info("Updated {} admin user rows", updated);
                
                // Step 3: Convert back to ENUM with uppercase values
                logger.info("Step 3: Converting back to ENUM with uppercase values...");
                jdbcTemplate.execute(
                    "ALTER TABLE admin_users MODIFY COLUMN role " +
                    "ENUM('SUPER_ADMIN', 'ADMIN', 'HR_STAFF') DEFAULT 'HR_STAFF'"
                );
                
                logger.info("✓ admin_users role enum fix completed!");
            } else {
                logger.info("✓ admin_users role enum values are already correct.");
            }
        } catch (Exception e) {
            logger.warn("Could not fix admin_users role enum: {}", e.getMessage());
        }
    }
    
    private void fixAnnouncementTypeEnum() {
        try {
            // Check if fix is needed by looking for lowercase values
            Integer lowercaseCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM announcements WHERE type REGEXP '^[a-z]'", 
                Integer.class
            );
            
            if (lowercaseCount != null && lowercaseCount > 0) {
                logger.info("Found {} rows with lowercase announcement type enum values. Applying fix...", lowercaseCount);
                
                // Step 1: Convert ENUM to VARCHAR temporarily
                logger.info("Step 1: Converting announcements.type to VARCHAR...");
                jdbcTemplate.execute("ALTER TABLE announcements MODIFY COLUMN type VARCHAR(30) NOT NULL");
                
                // Step 2: Update values to uppercase
                logger.info("Step 2: Converting values to uppercase...");
                int updated = jdbcTemplate.update("UPDATE announcements SET type = UPPER(type)");
                logger.info("Updated {} announcement rows to uppercase", updated);
                
                // Step 3: Convert back to ENUM with uppercase values
                logger.info("Step 3: Converting back to ENUM with uppercase values...");
                jdbcTemplate.execute(
                    "ALTER TABLE announcements MODIFY COLUMN type " +
                    "ENUM('GENERAL', 'URGENT', 'BREAKING', 'POLICY', 'EVENT') NOT NULL DEFAULT 'GENERAL'"
                );
                
                logger.info("✓ announcements type enum fix completed!");
            } else {
                logger.info("✓ announcements type enum values are already correct.");
            }
        } catch (Exception e) {
            logger.warn("Could not fix announcements type enum: {}", e.getMessage());
        }
    }
    
    private void fixEmployeeStatusEnum() {
        try {
            // Check if fix is needed by looking for lowercase values
            Integer lowercaseCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM employees WHERE status REGEXP '^[a-z]'", 
                Integer.class
            );
            
            if (lowercaseCount != null && lowercaseCount > 0) {
                logger.info("Found {} rows with lowercase employee status enum values. Applying fix...", lowercaseCount);
                
                // Step 1: Convert ENUM to VARCHAR temporarily
                logger.info("Step 1: Converting employees.status to VARCHAR...");
                jdbcTemplate.execute("ALTER TABLE employees MODIFY COLUMN status VARCHAR(30) NOT NULL");
                
                // Step 2: Update values to uppercase
                logger.info("Step 2: Converting values to uppercase...");
                int updated = jdbcTemplate.update("UPDATE employees SET status = UPPER(status)");
                logger.info("Updated {} employee rows to uppercase", updated);
                
                // Step 3: Convert back to ENUM with uppercase values
                logger.info("Step 3: Converting back to ENUM with uppercase values...");
                jdbcTemplate.execute(
                    "ALTER TABLE employees MODIFY COLUMN status " +
                    "ENUM('ACTIVE', 'INACTIVE', 'TERMINATED') DEFAULT 'ACTIVE'"
                );
                
                logger.info("✓ employees status enum fix completed!");
            } else {
                logger.info("✓ employees status enum values are already correct.");
            }
        } catch (Exception e) {
            logger.warn("Could not fix employees status enum: {}", e.getMessage());
        }
    }
    
    private void fixEmergencyContactTypeEnum() {
        try {
            // Check if fix is needed by looking for lowercase/underscore values
            Integer lowercaseCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM emergency_contacts WHERE type REGEXP '[a-z_]'", 
                Integer.class
            );
            
            if (lowercaseCount != null && lowercaseCount > 0) {
                logger.info("Found {} rows with lowercase/underscore emergency contact type enum values. Applying fix...", lowercaseCount);
                
                // Step 1: Convert ENUM to VARCHAR temporarily
                logger.info("Step 1: Converting emergency_contacts.type to VARCHAR...");
                jdbcTemplate.execute("ALTER TABLE emergency_contacts MODIFY COLUMN type VARCHAR(50) NOT NULL");
                
                // Step 2: Update values to uppercase with underscores
                logger.info("Step 2: Converting values to uppercase...");
                jdbcTemplate.update("UPDATE emergency_contacts SET type = UPPER(type)");
                Integer updatedObj = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM emergency_contacts", Integer.class);
                int updated = updatedObj != null ? updatedObj : 0;
                logger.info("Updated {} emergency contact rows", updated);
                
                // Step 3: Convert back to ENUM with uppercase values
                logger.info("Step 3: Converting back to ENUM with uppercase values...");
                jdbcTemplate.execute(
                    "ALTER TABLE emergency_contacts MODIFY COLUMN type " +
                    "ENUM('SECURITY', 'IT_SUPPORT', 'HR', 'MEDICAL', 'FACILITY', 'GENERAL', 'OTHER') NOT NULL"
                );
                
                logger.info("✓ emergency_contacts type enum fix completed!");
            } else {
                logger.info("✓ emergency_contacts type enum values are already correct.");
            }
        } catch (Exception e) {
            logger.warn("Could not fix emergency_contacts type enum: {}", e.getMessage());
        }
    }
}
