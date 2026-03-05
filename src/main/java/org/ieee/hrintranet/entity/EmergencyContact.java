package org.ieee.hrintranet.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_contacts")
@Data
public class EmergencyContact {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, length = 200)
    private String contactName;
    
    @Column(name = "phone_number", nullable = false, length = 50)
    private String phoneNumber;
    
    @Column(length = 200)
    private String email;
    
    @Column(length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ContactType type;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "is_emergency", nullable = false)
    private Boolean isEmergency = false;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum ContactType {
        SECURITY, IT_SUPPORT, HR, MEDICAL, FACILITY, GENERAL, OTHER
    }
}
