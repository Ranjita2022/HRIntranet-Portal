package org.ieee.hrintranet.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Scanner;

/**
 * Database Admin Password Utility
 * 
 * This utility helps manage admin user passwords with BCrypt hashing.
 * 
 * Usage:
 * Run this class directly to:
 * 1. Update existing plain text passwords to BCrypt hashes
 * 2. Add new admin users with BCrypt hashed passwords
 * 3. Change admin passwords securely
 * 
 * To run:
 * mvn spring-boot:run -Dspring-boot.run.mainClass=org.ieee.hrintranet.util.AdminPasswordUtility
 */
// @SpringBootApplication - Disabled to prevent bean conflicts when packaged in WAR
// @ComponentScan(basePackages = "org.ieee.hrintranet")
// @EntityScan("org.ieee.hrintranet.entity")
// @EnableJpaRepositories("org.ieee.hrintranet.repository")
public class AdminPasswordUtility { // implements CommandLineRunner {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public static void main(String[] args) {
        SpringApplication.run(AdminPasswordUtility.class, args);
    }
    
    // @Override - Removed since class no longer implements CommandLineRunner to avoid WAR packaging conflicts
    public void run(String... args) throws Exception {
        System.out.println("\n========================================");
        System.out.println("  IEEE ADMIN PASSWORD UTILITY");
        System.out.println("========================================\n");
        
        Scanner scanner = new Scanner(System.in);
        PasswordEncoder encoder = passwordEncoder;
        
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
                    updateAllPasswordsToBCrypt(encoder);
                    break;
                case "2":
                    addNewAdminUser(scanner, encoder);
                    break;
                case "3":
                    updateUserPassword(scanner, encoder);
                    break;
                case "4":
                    listAllAdminUsers();
                    break;
                case "5":
                    addEmployeeAsAdmin(scanner, encoder);
                    break;
                case "6":
                    System.out.println("\nExiting...");
                    System.exit(0);
                    break;
                default:
                    System.out.println("Invalid choice. Please try again.");
            }
        }
    }
    
    /**
     * Update all plain text passwords to BCrypt hashed passwords
     */
    private void updateAllPasswordsToBCrypt(PasswordEncoder encoder) {
        System.out.println("\n--- Updating All Passwords to BCrypt ---");
        
        // Get all users
        List<Map<String, Object>> users = jdbcTemplate.queryForList(
            "SELECT id, username, password_hash FROM admin_users"
        );
        
        int updated = 0;
        for (Map<String, Object> user : users) {
            Integer id = (Integer) user.get("id");
            String username = (String) user.get("username");
            String currentHash = (String) user.get("password_hash");
            
            // Check if already BCrypt hashed (starts with $2a$ or $2b$)
            if (currentHash.startsWith("$2a$") || currentHash.startsWith("$2b$")) {
                System.out.println("✓ " + username + " - Already BCrypt hashed (skipped)");
                continue;
            }
            
            // Hash the plain text password
            String bcryptHash = encoder.encode(currentHash);
            
            jdbcTemplate.update(
                "UPDATE admin_users SET password_hash = ? WHERE id = ?",
                bcryptHash, id
            );
            
            System.out.println("✓ " + username + " - Updated to BCrypt hash");
            updated++;
        }
        
        System.out.println("\n✅ Updated " + updated + " user(s) to BCrypt hashing.");
    }
    
    /**
     * Add new admin user with BCrypt password
     */
    private void addNewAdminUser(Scanner scanner, PasswordEncoder encoder) {
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
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM admin_users WHERE username = ?",
            Integer.class, username
        );
        
        if (count > 0) {
            System.out.println("❌ Error: Username already exists!");
            return;
        }
        
        // Hash password and insert
        String hashedPassword = encoder.encode(password);
        
        jdbcTemplate.update(
            "INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, 1)",
            username, hashedPassword, fullName, email, role
        );
        
        System.out.println("\n✅ Admin user created successfully!");
        System.out.println("   Username: " + username);
        System.out.println("   Role: " + role);
    }
    
    /**
     * Update specific user's password
     */
    private void updateUserPassword(Scanner scanner, PasswordEncoder encoder) {
        System.out.println("\n--- Update User Password ---");
        
        System.out.print("Username: ");
        String username = scanner.nextLine().trim();
        
        // Check if user exists
        List<Map<String, Object>> users = jdbcTemplate.queryForList(
            "SELECT id, username FROM admin_users WHERE username = ?",
            username
        );
        
        if (users.isEmpty()) {
            System.out.println("❌ Error: User not found!");
            return;
        }
        
        System.out.print("New Password: ");
        String newPassword = scanner.nextLine().trim();
        
        String hashedPassword = encoder.encode(newPassword);
        
        jdbcTemplate.update(
            "UPDATE admin_users SET password_hash = ? WHERE username = ?",
            hashedPassword, username
        );
        
        System.out.println("\n✅ Password updated successfully for: " + username);
    }
    
    /**
     * List all admin users
     */
    private void listAllAdminUsers() {
        System.out.println("\n--- Current Admin Users ---");
        
        List<Map<String, Object>> users = jdbcTemplate.queryForList(
            "SELECT id, username, full_name, email, role, is_active, " +
            "SUBSTRING(password_hash, 1, 20) as hash_preview " +
            "FROM admin_users ORDER BY role DESC, id"
        );
        
        System.out.println(String.format("\n%-4s %-15s %-25s %-13s %-8s %-22s",
            "ID", "USERNAME", "FULL NAME", "ROLE", "ACTIVE", "HASH PREVIEW"));
        System.out.println("─".repeat(95));
        
        for (Map<String, Object> user : users) {
            System.out.println(String.format("%-4s %-15s %-25s %-13s %-8s %-22s",
                user.get("id"),
                user.get("username"),
                user.get("full_name"),
                user.get("role"),
                (Boolean) user.get("is_active") ? "Yes" : "No",
                user.get("hash_preview") + "..."
            ));
        }
        
        System.out.println("\nTotal users: " + users.size());
    }
    
    /**
     * Add an employee as an admin user
     */
    private void addEmployeeAsAdmin(Scanner scanner, PasswordEncoder encoder) {
        System.out.println("\n--- Add Employee as Admin User ---");
        
        // List employees
        List<Map<String, Object>> employees = jdbcTemplate.queryForList(
            "SELECT id, first_name, last_name, email FROM employees WHERE status = 'ACTIVE' ORDER BY first_name, last_name"
        );
        
        if (employees.isEmpty()) {
            System.out.println("❌ No active employees found!");
            return;
        }
        
        System.out.println("\nAvailable Employees:");
        System.out.println(String.format("%-5s %-30s %-35s", "ID", "NAME", "EMAIL"));
        System.out.println("─".repeat(75));
        
        for (Map<String, Object> emp : employees) {
            String fullName = emp.get("first_name") + " " + emp.get("last_name");
            System.out.println(String.format("%-5s %-30s %-35s",
                emp.get("id"), fullName, emp.get("email")));
        }
        
        System.out.print("\nEnter Employee ID: ");
        String empIdStr = scanner.nextLine().trim();
        Integer empId;
        
        try {
            empId = Integer.parseInt(empIdStr);
        } catch (NumberFormatException e) {
            System.out.println("❌ Invalid Employee ID!");
            return;
        }
        
        // Get employee details
        List<Map<String, Object>> selected = jdbcTemplate.queryForList(
            "SELECT id, first_name, last_name, email FROM employees WHERE id = ?",
            empId
        );
        
        if (selected.isEmpty()) {
            System.out.println("❌ Employee not found!");
            return;
        }
        
        Map<String, Object> employee = selected.get(0);
        String firstName = (String) employee.get("first_name");
        String lastName = (String) employee.get("last_name");
        String email = (String) employee.get("email");
        String fullName = firstName + " " + lastName;
        
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
        
        // Check if username already exists
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM admin_users WHERE username = ?",
            Integer.class, username
        );
        
        if (count > 0) {
            System.out.println("❌ Error: Username already exists!");
            return;
        }
        
        // Hash password and create admin user
        String hashedPassword = encoder.encode(password);
        
        jdbcTemplate.update(
            "INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, 1)",
            username, hashedPassword, fullName, email, role
        );
        
        System.out.println("\n✅ Employee successfully added as admin user!");
        System.out.println("   Employee: " + fullName);
        System.out.println("   Username: " + username);
        System.out.println("   Role: " + role);
        System.out.println("   Email: " + email);
    }
}
