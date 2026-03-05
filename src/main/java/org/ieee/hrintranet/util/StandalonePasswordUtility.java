package org.ieee.hrintranet.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.*;
import java.util.Scanner;

/**
 * Standalone Database Password Utility
 * Updates or manages admin user passwords with BCrypt hashing
 * 
 * Run this class directly without Spring Boot
 */
public class StandalonePasswordUtility {
    
    private static final String DB_URL = "jdbc:mysql://localhost:3306/hr_intranet_portal?useSSL=false&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "root";
    
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    
    public static void main(String[] args) {
        System.out.println("\n========================================");
        System.out.println("  IEEE ADMIN PASSWORD UTILITY");
        System.out.println("========================================\n");
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            Scanner scanner = new Scanner(System.in);
            
            while (true) {
                System.out.println("\nSelect an option:");
                System.out.println("1. Update all plain text passwords to BCrypt");
                System.out.println("2. Add new admin user");
                System.out.println("3. Update specific user's password");
                System.out.println("4. List all admin users");
                System.out.println("5. Add employee as admin user");
                System.out.println("6. Exit");
                System.out.print("\nChoice: ");
                
                String choice = scanner.nextLine().trim();
                
                switch (choice) {
                    case "1":
                        updateAllPasswordsToBCrypt(conn);
                        break;
                    case "2":
                        addNewAdminUser(conn, scanner);
                        break;
                    case "3":
                        updateUserPassword(conn, scanner);
                        break;
                    case "4":
                        listAllAdminUsers(conn);
                        break;
                    case "5":
                        addEmployeeAsAdmin(conn, scanner);
                        break;
                    case "6":
                        System.out.println("\nExiting...");
                        return;
                    default:
                        System.out.println("Invalid choice. Please try again.");
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void updateAllPasswordsToBCrypt(Connection conn) throws SQLException {
        System.out.println("\n--- Updating All Passwords to BCrypt ---");
        
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
                    System.out.println("✓ " + username + " - Already BCrypt hashed (skipped)");
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
    }
    
    private static void addNewAdminUser(Connection conn, Scanner scanner) throws SQLException {
        System.out.println("\n--- Add New Admin User ---");
        
        System.out.print("Username: ");
        String username = scanner.nextLine().trim();
        
        System.out.print("Password: ");
        String password = scanner.nextLine().trim();
        
        System.out.print("Full Name: ");
        String fullName = scanner.nextLine().trim();
        
        System.out.print("Email: ");
        String email = scanner.nextLine().trim();
        
        System.out.println("\nRole Options:");
        System.out.println("1. SUPER_ADMIN (Full access, can manage users)");
        System.out.println("2. ADMIN (Portal management)");
        System.out.println("3. HR_STAFF (Limited access)");
        System.out.print("Role choice (1-3): ");
        String roleChoice = scanner.nextLine().trim();
        
        String role = switch (roleChoice) {
            case "1" -> "SUPER_ADMIN";
            case "2" -> "ADMIN";
            case "3" -> "HR_STAFF";
            default -> "HR_STAFF";
        };
        
        // Check if username exists
        String checkSql = "SELECT COUNT(*) FROM admin_users WHERE username = ?";
        try (PreparedStatement stmt = conn.prepareStatement(checkSql)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                System.out.println("❌ Error: Username already exists!");
                return;
            }
        }
        
        // Hash password and insert
        String hashedPassword = encoder.encode(password);
        String insertSql = "INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, 1)";
        
        try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
            stmt.setString(1, username);
            stmt.setString(2, hashedPassword);
            stmt.setString(3, fullName);
            stmt.setString(4, email);
            stmt.setString(5, role);
            stmt.executeUpdate();
        }
        
        System.out.println("\n✅ Admin user created successfully!");
        System.out.println("   Username: " + username);
        System.out.println("   Role: " + role);
    }
    
    private static void updateUserPassword(Connection conn, Scanner scanner) throws SQLException {
        System.out.println("\n--- Update User Password ---");
        
        System.out.print("Username: ");
        String username = scanner.nextLine().trim();
        
        // Check if user exists
        String checkSql = "SELECT id FROM admin_users WHERE username = ?";
        try (PreparedStatement stmt = conn.prepareStatement(checkSql)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (!rs.next()) {
                System.out.println("❌ Error: User not found!");
                return;
            }
        }
        
        System.out.print("New Password: ");
        String newPassword = scanner.nextLine().trim();
        
        String hashedPassword = encoder.encode(newPassword);
        String updateSql = "UPDATE admin_users SET password_hash = ? WHERE username = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
            stmt.setString(1, hashedPassword);
            stmt.setString(2, username);
            stmt.executeUpdate();
        }
        
        System.out.println("\n✅ Password updated successfully for: " + username);
    }
    
    private static void listAllAdminUsers(Connection conn) throws SQLException {
        System.out.println("\n--- Current Admin Users ---");
        
        String sql = "SELECT id, username, full_name, email, role, is_active, " +
                     "SUBSTRING(password_hash, 1, 20) as hash_preview " +
                     "FROM admin_users ORDER BY role DESC, id";
        
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            System.out.println(String.format("\n%-4s %-15s %-25s %-13s %-8s %-22s",
                "ID", "USERNAME", "FULL NAME", "ROLE", "ACTIVE", "HASH PREVIEW"));
            System.out.println("─".repeat(95));
            
            int count = 0;
            while (rs.next()) {
                System.out.println(String.format("%-4d %-15s %-25s %-13s %-8s %-22s",
                    rs.getInt("id"),
                    rs.getString("username"),
                    rs.getString("full_name"),
                    rs.getString("role"),
                    rs.getBoolean("is_active") ? "Yes" : "No",
                    rs.getString("hash_preview") + "..."
                ));
                count++;
            }
            
            System.out.println("\nTotal users: " + count);
        }
    }
    
    private static void addEmployeeAsAdmin(Connection conn, Scanner scanner) throws SQLException {
        System.out.println("\n--- Add Employee as Admin User ---");
        
        // List active employees
        String listSql = "SELECT id, first_name, last_name, email FROM employees WHERE status = 'ACTIVE' ORDER BY first_name, last_name";
        
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(listSql)) {
            
            System.out.println("\nAvailable Employees:");
            System.out.println(String.format("%-5s %-30s %-35s", "ID", "NAME", "EMAIL"));
            System.out.println("─".repeat(75));
            
            int count = 0;
            while (rs.next()) {
                String fullName = rs.getString("first_name") + " " + rs.getString("last_name");
                System.out.println(String.format("%-5d %-30s %-35s",
                    rs.getInt("id"), fullName, rs.getString("email")));
                count++;
            }
            
            if (count == 0) {
                System.out.println("❌ No active employees found!");
                return;
            }
        }
        
        System.out.print("\nEnter Employee ID: ");
        int empId;
        try {
            empId = Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException e) {
            System.out.println("❌ Invalid Employee ID!");
            return;
        }
        
        // Get employee details
        String empSql = "SELECT first_name, last_name, email FROM employees WHERE id = ?";
        String firstName, lastName, email, fullName;
        
        try (PreparedStatement stmt = conn.prepareStatement(empSql)) {
            stmt.setInt(1, empId);
            ResultSet rs = stmt.executeQuery();
            
            if (!rs.next()) {
                System.out.println("❌ Employee not found!");
                return;
            }
            
            firstName = rs.getString("first_name");
            lastName = rs.getString("last_name");
            email = rs.getString("email");
            fullName = firstName + " " + lastName;
        }
        
        System.out.println("\nSelected Employee: " + fullName);
        
        System.out.print("Create Username (e.g., " + firstName.toLowerCase() + "." + lastName.toLowerCase() + "): ");
        String username = scanner.nextLine().trim();
        
        System.out.print("Set Password: ");
        String password = scanner.nextLine().trim();
        
        System.out.println("\nRole Options:");
        System.out.println("1. ADMIN (Can manage portal content)");
        System.out.println("2. HR_STAFF (Limited access)");
        System.out.print("Role choice (1-2): ");
        String roleChoice = scanner.nextLine().trim();
        
        String role = roleChoice.equals("1") ? "ADMIN" : "HR_STAFF";
        
        // Check if username exists
        String checkSql = "SELECT COUNT(*) FROM admin_users WHERE username = ?";
        try (PreparedStatement stmt = conn.prepareStatement(checkSql)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                System.out.println("❌ Error: Username already exists!");
                return;
            }
        }
        
        // Hash password and create admin user
        String hashedPassword = encoder.encode(password);
        String insertSql = "INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, 1)";
        
        try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
            stmt.setString(1, username);
            stmt.setString(2, hashedPassword);
            stmt.setString(3, fullName);
            stmt.setString(4, email);
            stmt.setString(5, role);
            stmt.executeUpdate();
        }
        
        System.out.println("\n✅ Employee successfully added as admin user!");
        System.out.println("   Employee: " + fullName);
        System.out.println("   Username: " + username);
        System.out.println("   Role: " + role);
        System.out.println("   Email: " + email);
    }
}
