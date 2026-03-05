package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.AdminUser;
import org.ieee.hrintranet.repository.AdminUserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin User Management Controller
 * Only SUPER_ADMIN can manage admin users
 */
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUserController {
    
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Get all admin users (SUPER_ADMIN only)
     */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AdminUser>> getAllAdminUsers() {
        List<AdminUser> users = adminUserRepository.findAll();
        // Don't send password hashes to frontend
        users.forEach(user -> user.setPasswordHash("***"));
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get admin user by ID (SUPER_ADMIN only)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAdminUserById(@PathVariable Integer id) {
        return adminUserRepository.findById(id)
            .map(user -> {
                user.setPasswordHash("***");
                return ResponseEntity.ok(user);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new admin user (SUPER_ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createAdminUser(@RequestBody AdminUserRequest request) {
        // Validate username doesn't exist
        if (adminUserRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Username already exists"));
        }
        
        // Validate email doesn't exist
        if (adminUserRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email already exists"));
        }
        
        // Create new admin user
        AdminUser user = new AdminUser();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole() != null ? request.getRole() : AdminUser.UserRole.HR_STAFF);
        user.setIsActive(true);
        
        AdminUser savedUser = adminUserRepository.save(user);
        savedUser.setPasswordHash("***");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
    
    /**
     * Update admin user (SUPER_ADMIN only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateAdminUser(
            @PathVariable Integer id,
            @RequestBody AdminUserUpdateRequest request) {
        
        return adminUserRepository.findById(id)
            .map(user -> {
                // Update fields if provided
                if (request.getFullName() != null) {
                    user.setFullName(request.getFullName());
                }
                
                if (request.getEmail() != null) {
                    // Check if email is already used by another user
                    if (adminUserRepository.existsByEmail(request.getEmail()) && 
                        !user.getEmail().equals(request.getEmail())) {
                        return ResponseEntity.badRequest()
                            .body(Map.of("error", "Email already exists"));
                    }
                    user.setEmail(request.getEmail());
                }
                
                if (request.getRole() != null) {
                    user.setRole(request.getRole());
                }
                
                if (request.getIsActive() != null) {
                    user.setIsActive(request.getIsActive());
                }
                
                // Update password if provided
                if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                }
                
                AdminUser savedUser = adminUserRepository.save(user);
                savedUser.setPasswordHash("***");
                
                return ResponseEntity.ok(savedUser);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete admin user (SUPER_ADMIN only)
     * Cannot delete yourself or the last SUPER_ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteAdminUser(@PathVariable Integer id) {
        return adminUserRepository.findById(id)
            .map(user -> {
                // Prevent deleting last SUPER_ADMIN
                if (user.getRole() == AdminUser.UserRole.SUPER_ADMIN) {
                    long superAdminCount = adminUserRepository.findAll().stream()
                        .filter(u -> u.getRole() == AdminUser.UserRole.SUPER_ADMIN)
                        .count();
                    
                    if (superAdminCount <= 1) {
                        return ResponseEntity.badRequest()
                            .body(Map.of("error", "Cannot delete the last SUPER_ADMIN"));
                    }
                }
                
                adminUserRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Admin user deleted successfully"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Toggle admin user active status (SUPER_ADMIN only)
     */
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> toggleActiveStatus(@PathVariable Integer id) {
        return adminUserRepository.findById(id)
            .map(user -> {
                user.setIsActive(!user.getIsActive());
                AdminUser savedUser = adminUserRepository.save(user);
                savedUser.setPasswordHash("***");
                return ResponseEntity.ok(savedUser);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Change own password (any authenticated admin)
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        return adminUserRepository.findByUsername(request.getUsername())
            .map(user -> {
                // Verify old password
                if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Current password is incorrect"));
                }
                
                // Update to new password
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                adminUserRepository.save(user);
                
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

@Data
class AdminUserRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private AdminUser.UserRole role;
}

@Data
class AdminUserUpdateRequest {
    private String fullName;
    private String email;
    private AdminUser.UserRole role;
    private Boolean isActive;
    private String password; // Optional - only if changing password
}

@Data
class ChangePasswordRequest {
    private String username;
    private String oldPassword;
    private String newPassword;
}
