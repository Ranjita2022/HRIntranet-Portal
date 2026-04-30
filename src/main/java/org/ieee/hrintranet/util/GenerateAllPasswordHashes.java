package org.ieee.hrintranet.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Generate correct BCrypt hashes for all admin users
 */
public class GenerateAllPasswordHashes {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("========================================");
        System.out.println("  Generate BCrypt Hashes for All Users");
        System.out.println("========================================\n");
        
        // Admin - password: admin123
        String adminHash = encoder.encode("admin123");
        System.out.println("Admin (password: admin123):");
        System.out.println("UPDATE admin_users SET password_hash = '" + adminHash + "' WHERE username = 'admin';");
        System.out.println();
        
        // HR Admin - password: password123
        String hradminHash = encoder.encode("password123");
        System.out.println("HR Admin (password: password123):");
        System.out.println("UPDATE admin_users SET password_hash = '" + hradminHash + "' WHERE username = 'hradmin';");
        System.out.println();
        
        // HR Staff - password: password123
        String hrstaffHash = encoder.encode("password123");
        System.out.println("HR Staff (password: password123):");
        System.out.println("UPDATE admin_users SET password_hash = '" + hrstaffHash + "' WHERE username = 'hrstaff';");
        
        System.out.println("\n========================================");
    }
}
