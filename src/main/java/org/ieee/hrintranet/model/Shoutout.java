package org.ieee.hrintranet.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "shoutouts")
@Data
public class Shoutout {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_name", nullable = false, length = 100)
    private String fromName;
    
    @Column(name = "to_name", nullable = false, length = 100)
    private String toName;
    
    @Column(name = "message", nullable = false, length = 500)
    private String message;
    
    @Column(name = "category", length = 50)
    private String category; // e.g., "Teamwork", "Innovation", "Excellence", "Appreciation"
    
    @Column(name = "is_approved")
    private Boolean isApproved = false;
    
    @Column(name = "is_displayed")
    private Boolean isDisplayed = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "approved_by", length = 100)
    private String approvedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isApproved == null) {
            isApproved = false;
        }
        if (isDisplayed == null) {
            isDisplayed = true;
        }
    }
}
