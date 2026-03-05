package org.ieee.hrintranet.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.*;

/**
 * Auto-run password updater - Updates all plain text passwords to BCrypt
 */
public class AutoUpdatePasswords {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/hr_intranet_portal?useSSL=false&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "root";
    
    public static void main(String[] args) {
        System.out.println("\n========================================");
        System.out.println("  AUTO-UPDATING PASSWORDS TO BCRYPT");
        System.out.println("========================================\n");
        
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String selectSql = "SELECT id, username, password_hash FROM admin_users";
            String updateSql = "UPDATE admin_users SET password_hash = ? WHERE id = ?";
            
            int updated = 0;
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(selectSql);
                 PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                
                while (rs.next()) {
                    int id = rs.getInt("id");
                    String username = rs.getString("username");
                    String currentHash = rs.getString("password_hash");
                    
                    // Check if already BCrypt hashed
                    if (currentHash.startsWith("$2a$") || currentHash.startsWith("$2b$")) {
                        System.out.println("✓ " + username + " - Already BCrypt hashed");
                        continue;
                    }
                    
                    // Hash the plain text password
                    String bcryptHash = encoder.encode(currentHash);
                    
                    updateStmt.setString(1, bcryptHash);
                    updateStmt.setInt(2, id);
                    updateStmt.executeUpdate();
                    
                    System.out.println("✓ " + username + " - Updated (original password: " + currentHash + ")");
                    updated++;
                }
            }
            
            System.out.println("\n✅ Updated " + updated + " user(s) to BCrypt hashing.");
            
            // List all users
            System.out.println("\n--- Current Admin Users ---\n");
            String listSql = "SELECT id, username, full_name, role, is_active FROM admin_users ORDER BY role DESC, id";
            
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(listSql)) {
                
                System.out.println(String.format("%-4s %-15s %-25s %-13s %-8s",
                    "ID", "USERNAME", "FULL NAME", "ROLE", "ACTIVE"));
                System.out.println("─".repeat(75));
                
                while (rs.next()) {
                    System.out.println(String.format("%-4d %-15s %-25s %-13s %-8s",
                        rs.getInt("id"),
                        rs.getString("username"),
                        rs.getString("full_name"),
                        rs.getString("role"),
                        rs.getBoolean("is_active") ? "Yes" : "No"
                    ));
                }
            }
            
            System.out.println("\n✅ Password update complete!");
            System.out.println("\nDefault Login Credentials:");
            System.out.println("  Username: admin");
            System.out.println("  Password: admin123");
            System.out.println("========================================\n");
            
        } catch (SQLException e) {
            System.err.println("❌ Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
