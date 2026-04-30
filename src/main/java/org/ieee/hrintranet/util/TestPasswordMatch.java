package org.ieee.hrintranet.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Test if the BCrypt hash matches the plaintext password
 */
public class TestPasswordMatch {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "admin123";
        String storedHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        
        System.out.println("========================================");
        System.out.println("  BCrypt Password Match Test");
        System.out.println("========================================");
        System.out.println("Testing password: " + password);
        System.out.println("Against hash: " + storedHash);
        System.out.println();
        
        boolean matches = encoder.matches(password, storedHash);
        
        if (matches) {
            System.out.println("✅ SUCCESS: Password matches the hash!");
        } else {
            System.out.println("❌ FAILURE: Password does NOT match the hash!");
            System.out.println();
            System.out.println("Generating new hash for: " + password);
            String newHash = encoder.encode(password);
            System.out.println("New BCrypt hash: " + newHash);
            System.out.println();
            System.out.println("SQL Update Command:");
            System.out.println("UPDATE admin_users SET password_hash = '" + newHash + "' WHERE username = 'admin';");
        }
        System.out.println("========================================");
    }
}
