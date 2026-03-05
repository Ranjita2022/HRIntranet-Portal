package org.ieee.hrintranet.util;

import java.io.FileWriter;
import java.io.IOException;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Database Exporter Utility
 * Exports complete database structure and data to a single SQL file
 */
public class DatabaseExporter {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/hr_intranet_portal";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "root";
    private static final String OUTPUT_FILE = "C:\\Projects\\intranetPortal\\database\\COMPLETE_DATABASE_SETUP.sql";
    
    public static void main(String[] args) {
        System.out.println("=== DATABASE EXPORTER ===\n");
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             FileWriter writer = new FileWriter(OUTPUT_FILE)) {
            
            // Write header
            writeHeader(writer);
            
            // Export structure and data
            exportDatabase(conn, writer);
            
            System.out.println("\n✓ Database exported successfully to: " + OUTPUT_FILE);
            System.out.println("✓ You can now delete all other SQL files and use only COMPLETE_DATABASE_SETUP.sql");
            
        } catch (SQLException | IOException e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void writeHeader(FileWriter writer) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        writer.write("-- =====================================================\n");
        writer.write("-- HR INTRANET PORTAL - COMPLETE DATABASE SETUP\n");
        writer.write("-- Generated: " + timestamp + "\n");
        writer.write("-- =====================================================\n");
        writer.write("-- This file contains everything needed to set up the database:\n");
        writer.write("--   1. Database creation\n");
        writer.write("--   2. All table structures with proper constraints\n");
        writer.write("--   3. Sample data for all tables\n");
        writer.write("--   4. Admin user (username: admin, password: admin)\n");
        writer.write("-- =====================================================\n\n");
    }
    
    private static void exportDatabase(Connection conn, FileWriter writer) throws SQLException, IOException {
        // Drop and create database
        writer.write("-- =====================================================\n");
        writer.write("-- DATABASE SETUP\n");
        writer.write("-- =====================================================\n");
        writer.write("DROP DATABASE IF EXISTS hr_intranet_portal;\n");
        writer.write("CREATE DATABASE hr_intranet_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n");
        writer.write("USE hr_intranet_portal;\n\n");
        
        // Get all tables
        List<String> tables = getTables(conn);
        System.out.println("Found " + tables.size() + " tables to export\n");
        
        // Export each table
        for (String table : tables) {
            exportTable(conn, writer, table);
        }
        
        writer.write("-- =====================================================\n");
        writer.write("-- SETUP COMPLETE\n");
        writer.write("-- =====================================================\n");
        writer.write("-- Default admin credentials:\n");
        writer.write("--   Username: admin\n");
        writer.write("--   Password: admin\n");
        writer.write("-- =====================================================\n");
    }
    
    private static List<String> getTables(Connection conn) throws SQLException {
        List<String> tables = new ArrayList<>();
        String[] tableOrder = {
            "admin_users", "audit_log", "images", "employees", 
            "announcements", "holidays", "emergency_contacts", 
            "quick_links", "carousel_slides", "gallery_images",
            "work_anniversaries"
        };
        
        DatabaseMetaData metaData = conn.getMetaData();
        ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"});
        
        // Add tables in specific order to respect foreign keys
        for (String table : tableOrder) {
            tables.add(table);
        }
        
        return tables;
    }
    
    private static void exportTable(Connection conn, FileWriter writer, String tableName) throws SQLException, IOException {
        System.out.println("Exporting table: " + tableName);
        
        writer.write("-- =====================================================\n");
        writer.write("-- TABLE: " + tableName + "\n");
        writer.write("-- =====================================================\n\n");
        
        // Get CREATE TABLE statement
        String createTable = getCreateTableStatement(conn, tableName);
        writer.write(createTable + "\n\n");
        
        // Export data
        exportTableData(conn, writer, tableName);
        
        writer.write("\n");
    }
    
    private static String getCreateTableStatement(Connection conn, String tableName) throws SQLException {
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SHOW CREATE TABLE " + tableName);
        
        if (rs.next()) {
            String createStatement = rs.getString(2);
            // Clean up auto_increment value
            createStatement = createStatement.replaceAll(" AUTO_INCREMENT=\\d+", "");
            return "DROP TABLE IF EXISTS `" + tableName + "`;\n" + createStatement + ";";
        }
        
        return "";
    }
    
    private static void exportTableData(Connection conn, FileWriter writer, String tableName) throws SQLException, IOException {
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM " + tableName);
        ResultSetMetaData metaData = rs.getMetaData();
        int columnCount = metaData.getColumnCount();
        
        int rowCount = 0;
        List<String> insertStatements = new ArrayList<>();
        
        while (rs.next()) {
            rowCount++;
            StringBuilder insert = new StringBuilder();
            insert.append("INSERT INTO `").append(tableName).append("` (");
            
            // Column names
            for (int i = 1; i <= columnCount; i++) {
                insert.append("`").append(metaData.getColumnName(i)).append("`");
                if (i < columnCount) insert.append(", ");
            }
            
            insert.append(") VALUES (");
            
            // Values
            for (int i = 1; i <= columnCount; i++) {
                Object value = rs.getObject(i);
                
                if (value == null) {
                    insert.append("NULL");
                } else if (value instanceof String) {
                    insert.append("'").append(escapeString((String) value)).append("'");
                } else if (value instanceof Timestamp || value instanceof Date || value instanceof Time) {
                    insert.append("'").append(value.toString()).append("'");
                } else if (value instanceof Boolean) {
                    insert.append(((Boolean) value) ? "1" : "0");
                } else {
                    insert.append(value);
                }
                
                if (i < columnCount) insert.append(", ");
            }
            
            insert.append(");");
            insertStatements.add(insert.toString());
        }
        
        if (rowCount > 0) {
            writer.write("-- Data for table: " + tableName + " (" + rowCount + " rows)\n");
            for (String insertStmt : insertStatements) {
                writer.write(insertStmt + "\n");
            }
            System.out.println("  ✓ Exported " + rowCount + " rows");
        } else {
            writer.write("-- No data in table: " + tableName + "\n");
            System.out.println("  ⚠ No data found");
        }
    }
    
    private static String escapeString(String str) {
        return str.replace("\\", "\\\\")
                  .replace("'", "\\'")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
