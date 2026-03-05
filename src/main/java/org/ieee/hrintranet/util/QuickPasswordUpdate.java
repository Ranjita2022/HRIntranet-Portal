package org.ieee.hrintranet.util;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Quick Password Update Utility
 * Automatically updates all plain text passwords to BCrypt
 */
// Disabled to prevent auto-execution when running main application
// @SpringBootApplication
// @ComponentScan(basePackages = "org.ieee.hrintranet")
// @EntityScan("org.ieee.hrintranet.entity")
// @EnableJpaRepositories("org.ieee.hrintranet.repository")
public class QuickPasswordUpdate implements CommandLineRunner {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public static void main(String[] args) {
        SpringApplication.run(QuickPasswordUpdate.class, args);
    }
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n========================================");
        System.out.println("  UPDATING PASSWORDS TO BCRYPT");
        System.out.println("========================================\n");
        
        PasswordEncoder encoder = passwordEncoder;
        
        // Get all users
        List<Map<String, Object>> users = jdbcTemplate.queryForList(
            "SELECT id, username, password_hash FROM admin_users"
        );
        
        int updated = 0;
        for (Map<String, Object> user : users) {
            Integer id = (Integer) user.get("id");
            String username = (String) user.get("username");
            String currentHash = (String) user.get("password_hash");
            
            // Check if already BCrypt hashed
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
            
            System.out.println("✓ " + username + " - Updated (password: " + currentHash + ")");
            updated++;
        }
        
        System.out.println("\n✅ Updated " + updated + " user(s) to BCrypt hashing.");
        
        // List all users
        System.out.println("\n--- Current Admin Users ---");
        users = jdbcTemplate.queryForList(
            "SELECT id, username, full_name, role, is_active FROM admin_users ORDER BY role DESC, id"
        );
        
        System.out.println(String.format("\n%-4s %-15s %-25s %-13s %-8s",
            "ID", "USERNAME", "FULL NAME", "ROLE", "ACTIVE"));
        System.out.println("─".repeat(75));
        
        for (Map<String, Object> user : users) {
            System.out.println(String.format("%-4s %-15s %-25s %-13s %-8s",
                user.get("id"),
                user.get("username"),
                user.get("full_name"),
                user.get("role"),
                (Boolean) user.get("is_active") ? "Yes" : "No"
            ));
        }
        
        System.out.println("\n✅ Password update complete!");
        System.out.println("\nLogin Credentials:");
        System.out.println("  Username: admin");
        System.out.println("  Password: admin123");
        System.out.println("========================================\n");
        
        System.exit(0);
    }
}
