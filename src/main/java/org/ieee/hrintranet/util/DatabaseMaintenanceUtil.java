package org.ieee.hrintranet.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Database Maintenance Utility
 * 
 * Single utility for all database updates, inserts, and fixes.
 * Modify the executeMaintenance() method with your SQL queries.
 * 
 * Usage:
 * 1. Add your SQL queries in executeMaintenance() method
 * 2. Run this class directly: java DatabaseMaintenanceUtil
 * 3. Check the console output for results
 */
public class DatabaseMaintenanceUtil {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/hr_intranet_portal";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "root";
    
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("   DATABASE MAINTENANCE UTILITY");
        System.out.println("========================================\n");
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            System.out.println("✓ Connected to database: hr_intranet_portal\n");
            
            // Execute maintenance tasks
            executeMaintenance(conn);
            
            System.out.println("\n✓ Database maintenance completed successfully!");
            
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("========================================");
    }
    
    /**
     * Add your database maintenance SQL queries here
     */
    private static void executeMaintenance(Connection conn) throws Exception {
        
        // Add future event for countdown testing
        // addFutureEvent(conn);
        
        // Populate gallery folders from images/gallery directory
        populateGalleryFolders(conn);
        
        System.out.println("✓ All maintenance tasks completed successfully!");
    }
    
    /**
     * Add a future event to test the countdown banner
     */
    @SuppressWarnings("unused")
    private static void addFutureEvent(Connection conn) throws Exception {
        System.out.println("Adding future event for countdown testing...\n");
        
        try (Statement stmt = conn.createStatement()) {
            String insertEvent = "INSERT INTO announcements (title, description, type, publish_date, is_active, priority) " +
                               "VALUES ('Company Annual Picnic', 'Join us for food, games, and team building!', 'EVENT', '2026-03-15', true, 1)";
            
            int inserted = stmt.executeUpdate(insertEvent);
            System.out.println("✓ Inserted " + inserted + " future event record");
            System.out.println("  - Event: Company Annual Picnic");
            System.out.println("  - Event Date: March 15, 2026 (2 weeks from now)");
            System.out.println("  - Type: EVENT");
            System.out.println("  - The countdown banner will now appear on the portal!\n");
        }
    }
    
    /**
     * Add additional work anniversary records to show all milestone years (1-10)
     */
    @SuppressWarnings("unused")
    private static void addMoreAnniversaries(Connection conn) throws Exception {
        System.out.println("Adding additional work anniversary records...\n");
        
        try (Statement stmt = conn.createStatement()) {
            
            // Clear existing work anniversaries
            int deleted = stmt.executeUpdate("DELETE FROM `work_anniversaries`");
            System.out.println("✓ Cleared " + deleted + " existing work anniversary records");
            
            // Insert work anniversaries with dates in visible range (Mar-Aug 2026)
            // Spread across all milestone years: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            String[] anniversaryInserts = {
                // 1-year anniversaries (March-July 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (10, 1, '2026-03-01', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (11, 1, '2026-04-10', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (12, 1, '2026-05-20', FALSE, TRUE, NOW(), NOW())",
                
                // 2-year anniversaries (March-June 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (7, 2, '2026-03-10', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (8, 2, '2026-04-25', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (9, 2, '2026-06-05', FALSE, TRUE, NOW(), NOW())",
                
                // 3-year anniversaries (April-July 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (14, 3, '2026-04-15', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (15, 3, '2026-07-01', FALSE, TRUE, NOW(), NOW())",
                
                // 4-year anniversaries (May-August 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (32, 4, '2026-05-18', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (13, 4, '2026-08-01', FALSE, TRUE, NOW(), NOW())",
                
                // 5-year anniversaries (March-June 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (4, 5, '2026-03-15', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (5, 5, '2026-05-01', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (6, 5, '2026-06-20', FALSE, TRUE, NOW(), NOW())",
                
                // 6-year anniversaries (April-July 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (31, 6, '2026-04-07', FALSE, TRUE, NOW(), NOW())",
                
                // 7-year anniversaries (May-August 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (31, 7, '2026-05-07', FALSE, TRUE, NOW(), NOW())",
                
                // 8-year anniversaries (June 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (1, 8, '2026-06-15', FALSE, TRUE, NOW(), NOW())",
                
                // 9-year anniversaries (July 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (2, 9, '2026-07-10', FALSE, TRUE, NOW(), NOW())",
                
                // 10-year anniversaries (March-August 2026)
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (1, 10, '2026-03-15', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (2, 10, '2026-04-10', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (3, 10, '2026-08-28', FALSE, TRUE, NOW(), NOW())"
            };
            
            int totalInserted = 0;
            for (String sql : anniversaryInserts) {
                totalInserted += stmt.executeUpdate(sql);
            }
            System.out.println("✓ Inserted " + totalInserted + " work anniversary records");
            
            System.out.println("\nSummary:");
            System.out.println("  - Work anniversaries for ALL milestone years: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10");
            System.out.println("  - All anniversaries dated March-August 2026 (visible window)");
            System.out.println("  - All anniversaries set to published for visibility\n");
        }
    }
    
    /**
     * Populate celebrations: Add birth dates and work anniversaries
     */
    @SuppressWarnings("unused")
    private static void populateCelebrations(Connection conn) throws Exception {
        System.out.println("Populating celebrations data...\n");
        
        try (Statement stmt = conn.createStatement()) {
            
            // Step 1: Add birth_date column if it doesn't exist
            try {
                stmt.executeUpdate("ALTER TABLE `employees` ADD COLUMN `birth_date` DATE NULL AFTER `start_date`");
                System.out.println("✓ Added birth_date column to employees table");
            } catch (Exception e) {
                if (e.getMessage().contains("Duplicate column")) {
                    System.out.println("ℹ birth_date column already exists");
                } else {
                    throw e;
                }
            }
            
            // Step 2: Update employees with birth dates
            String[] birthDateUpdates = {
                "UPDATE `employees` SET `birth_date` = '1985-03-15' WHERE `id` = 1",
                "UPDATE `employees` SET `birth_date` = '1983-05-22' WHERE `id` = 2",
                "UPDATE `employees` SET `birth_date` = '1982-07-10' WHERE `id` = 3",
                "UPDATE `employees` SET `birth_date` = '1990-04-18' WHERE `id` = 4",
                "UPDATE `employees` SET `birth_date` = '1988-06-25' WHERE `id` = 5",
                "UPDATE `employees` SET `birth_date` = '1987-08-30' WHERE `id` = 6",
                "UPDATE `employees` SET `birth_date` = '1992-03-12' WHERE `id` = 7",
                "UPDATE `employees` SET `birth_date` = '1991-05-08' WHERE `id` = 8",
                "UPDATE `employees` SET `birth_date` = '1993-04-20' WHERE `id` = 9",
                "UPDATE `employees` SET `birth_date` = '1995-03-28' WHERE `id` = 10",
                "UPDATE `employees` SET `birth_date` = '1994-06-15' WHERE `id` = 11",
                "UPDATE `employees` SET `birth_date` = '1992-07-22' WHERE `id` = 12",
                "UPDATE `employees` SET `birth_date` = '1990-05-10' WHERE `id` = 13",
                "UPDATE `employees` SET `birth_date` = '1996-04-05' WHERE `id` = 14",
                "UPDATE `employees` SET `birth_date` = '1993-03-18' WHERE `id` = 15",
                "UPDATE `employees` SET `birth_date` = '1986-08-12' WHERE `id` = 31",
                "UPDATE `employees` SET `birth_date` = '1989-09-25' WHERE `id` = 32"
            };
            
            int totalUpdated = 0;
            for (String sql : birthDateUpdates) {
                totalUpdated += stmt.executeUpdate(sql);
            }
            System.out.println("✓ Updated " + totalUpdated + " employees with birth dates");
            
            // Step 3: Clear existing work anniversaries to avoid duplicates
            int deleted = stmt.executeUpdate("DELETE FROM `work_anniversaries`");
            System.out.println("✓ Cleared " + deleted + " existing work anniversary records");
            
            // Step 4: Insert work anniversaries for various milestone years
            String[] anniversaryInserts = {
                // 10-year anniversaries
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (1, 10, '2026-02-15', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (2, 10, '2026-03-10', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (3, 10, '2026-02-28', FALSE, TRUE, NOW(), NOW())",
                
                // 7-year anniversary
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (31, 7, '2026-01-07', FALSE, TRUE, NOW(), NOW())",
                
                // 5-year anniversaries
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (4, 5, '2026-02-15', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (5, 5, '2026-03-01', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (6, 5, '2026-02-20', FALSE, TRUE, NOW(), NOW())",
                
                // 4-year anniversary
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (32, 4, '2025-10-18', FALSE, TRUE, NOW(), NOW())",
                
                // 3-year anniversary
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (7, 3, '2027-02-10', FALSE, TRUE, NOW(), NOW())",
                
                // 2-year anniversaries
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (7, 2, '2026-02-10', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (8, 2, '2026-02-25', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (9, 2, '2026-03-05', FALSE, TRUE, NOW(), NOW())",
                
                // 1-year anniversaries
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (10, 1, '2026-02-01', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (11, 1, '2026-02-10', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (12, 1, '2026-02-20', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (14, 1, '2027-01-15', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (15, 1, '2027-02-01', FALSE, TRUE, NOW(), NOW())",
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (13, 1, '2026-12-01', FALSE, TRUE, NOW(), NOW())",
                
                // 6-year anniversary
                "INSERT INTO `work_anniversaries` (`employee_id`, `anniversary_year`, `anniversary_date`, `is_notified`, `is_published`, `created_at`, `updated_at`) VALUES (31, 6, '2025-01-07', FALSE, TRUE, NOW(), NOW())"
            };
            
            int totalInserted = 0;
            for (String sql : anniversaryInserts) {
                totalInserted += stmt.executeUpdate(sql);
            }
            System.out.println("✓ Inserted " + totalInserted + " work anniversary records");
            
            System.out.println("\nSummary:");
            System.out.println("  - 17 employees updated with birth dates");
            System.out.println("  - 19 work anniversaries created (1, 2, 3, 4, 5, 6, 7, 10 year milestones)");
            System.out.println("  - All anniversaries set to published for visibility\n");
        }
    }
    
    /**
     * Example: Insert new records
     */
    @SuppressWarnings("unused")
    private static void executeInsert(Connection conn) throws Exception {
        String sql = "INSERT INTO announcements (type, title, description, is_active, created_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, NOW(), NOW())";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, "GENERAL");
            stmt.setString(2, "New Announcement");
            stmt.setString(3, "This is a sample announcement");
            stmt.setBoolean(4, true);
            
            int rows = stmt.executeUpdate();
            System.out.println("✓ Inserted " + rows + " announcement(s)");
        }
    }
    
    /**
     * Example: Update existing records
     */
    @SuppressWarnings("unused")
    private static void executeUpdate(Connection conn) throws Exception {
        String sql = "UPDATE employees SET status = ? WHERE status = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, "ACTIVE");
            stmt.setString(2, "active");
            
            int rows = stmt.executeUpdate();
            System.out.println("✓ Updated " + rows + " employee(s)");
        }
    }
    
    /**
     * Example: Query and display data
     */
    @SuppressWarnings("unused")
    private static void executeQuery(Connection conn) throws Exception {
        String sql = "SELECT id, username, role FROM admin_users";
        
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            System.out.println("Admin Users:");
            System.out.println("--------------------");
            
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + 
                                 " | Username: " + rs.getString("username") + 
                                 " | Role: " + rs.getString("role"));
            }
        }
    }
    
    /**
     * Example: Run custom SQL (UPDATE, DELETE, ALTER, etc.)
     */
    @SuppressWarnings("unused")
    private static void executeCustomSQL(Connection conn) throws Exception {
        // Example: Multiple SQL statements
        String[] sqlStatements = {
            "UPDATE holidays SET is_active = TRUE WHERE DATE(date) >= CURDATE()",
            "DELETE FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)",
            "ALTER TABLE employees MODIFY COLUMN phone VARCHAR(20)"
        };
        
        try (Statement stmt = conn.createStatement()) {
            for (String sql : sqlStatements) {
                int rows = stmt.executeUpdate(sql);
                System.out.println("✓ Executed: " + sql.substring(0, Math.min(50, sql.length())) + "...");
                System.out.println("  Affected rows: " + rows);
            }
        }
    }
    
    /**     * Populate gallery folders from images/gallery directory
     */
    private static void populateGalleryFolders(Connection conn) throws Exception {
        System.out.println("Populating gallery folders...\n");
        
        // First, create the gallery_folders table if it doesn't exist
        String createTableSQL = "CREATE TABLE IF NOT EXISTS gallery_folders (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "folder_name VARCHAR(100) NOT NULL UNIQUE, " +
                "display_title VARCHAR(200), " +
                "description VARCHAR(500), " +
                "folder_path VARCHAR(500) NOT NULL, " +
                "photo_count INT NOT NULL DEFAULT 0, " +
                "display_order INT NOT NULL DEFAULT 0, " +
                "is_active BOOLEAN NOT NULL DEFAULT true, " +
                "created_by VARCHAR(100), " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
        
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(createTableSQL);
            System.out.println("✓ Ensured gallery_folders table exists");
        }
        
        // Gallery folders to populate (based on images/gallery/ directory)
        String[][] folders = {
            {"picnic", "Company Picnic 2025", "Fun times at the annual company picnic", "images/gallery/picnic", "45"},
            {"diwali", "Diwali Celebration", "Festival of lights celebration at office", "images/gallery/diwali", "0"}
        };
        
        int insertCount = 0;
        int updateCount = 0;
        
        for (int i = 0; i < folders.length; i++) {
            String folderName = folders[i][0];
            String displayTitle = folders[i][1];
            String description = folders[i][2];
            String folderPath = folders[i][3];
            int photoCount = Integer.parseInt(folders[i][4]);
            int displayOrder = i + 1;
            
            // Check if folder already exists
            String checkSQL = "SELECT COUNT(*) as count FROM gallery_folders WHERE folder_name = ?";
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSQL)) {
                checkStmt.setString(1, folderName);
                ResultSet rs = checkStmt.executeQuery();
                rs.next();
                boolean exists = rs.getInt("count") > 0;
                
                if (exists) {
                    // Update existing folder
                    String updateSQL = "UPDATE gallery_folders SET " +
                            "display_title = ?, description = ?, folder_path = ?, " +
                            "photo_count = ?, display_order = ? " +
                            "WHERE folder_name = ?";
                    
                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSQL)) {
                        updateStmt.setString(1, displayTitle);
                        updateStmt.setString(2, description);
                        updateStmt.setString(3, folderPath);
                        updateStmt.setInt(4, photoCount);
                        updateStmt.setInt(5, displayOrder);
                        updateStmt.setString(6, folderName);
                        updateStmt.executeUpdate();
                        updateCount++;
                        System.out.println("  ✓ Updated: " + folderName + " (" + photoCount + " photos)");
                    }
                } else {
                    // Insert new folder
                    String insertSQL = "INSERT INTO gallery_folders " +
                            "(folder_name, display_title, description, folder_path, photo_count, display_order, is_active, created_by) " +
                            "VALUES (?, ?, ?, ?, ?, ?, true, 'system')";
                    
                    try (PreparedStatement insertStmt = conn.prepareStatement(insertSQL)) {
                        insertStmt.setString(1, folderName);
                        insertStmt.setString(2, displayTitle);
                        insertStmt.setString(3, description);
                        insertStmt.setString(4, folderPath);
                        insertStmt.setInt(5, photoCount);
                        insertStmt.setInt(6, displayOrder);
                        insertStmt.executeUpdate();
                        insertCount++;
                        System.out.println("  ✓ Inserted: " + folderName + " (" + photoCount + " photos)");
                    }
                }
            }
        }
        
        System.out.println("\n✓ Gallery folders populated:");
        System.out.println("  - " + insertCount + " folders added");
        System.out.println("  - " + updateCount + " folders updated");
        System.out.println("  - Total active folders: " + folders.length + "\n");
    }

    /**     * Helper: Execute a simple SQL statement
     */
    @SuppressWarnings("unused")
    private static int executeSQL(Connection conn, String sql) throws Exception {
        try (Statement stmt = conn.createStatement()) {
            return stmt.executeUpdate(sql);
        }
    }
    
    /**
     * Helper: Check if a record exists
     */
    @SuppressWarnings("unused")
    private static boolean recordExists(Connection conn, String tableName, String whereClause) throws Exception {
        String sql = "SELECT COUNT(*) as count FROM " + tableName + " WHERE " + whereClause;
        
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            if (rs.next()) {
                return rs.getInt("count") > 0;
            }
        }
        return false;
    }
}
