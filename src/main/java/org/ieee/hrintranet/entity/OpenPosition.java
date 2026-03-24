package org.ieee.hrintranet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Open Position Entity - Stores job requisitions and openings
 */
@Entity
@Table(name = "open_positions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpenPosition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "requisition_id", unique = true, length = 50)
    private String requisitionId;
    
    @Column(name = "requisition_title", nullable = false, length = 255)
    private String requisitionTitle;
    
    @Column(name = "location", nullable = false, length = 255)
    private String location;
    
    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;
    
    @Column(name = "closing_date")
    private LocalDate closingDate;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PositionStatus status = PositionStatus.OPEN;
    
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum PositionStatus {
        OPEN,
        CLOSED,
        ON_HOLD
    }
}
