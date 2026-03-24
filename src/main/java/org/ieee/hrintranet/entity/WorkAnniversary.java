package org.ieee.hrintranet.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_anniversaries")
@Data
public class WorkAnniversary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(name = "employee_name", length = 200)
    private String employeeName;
    
    @Column(name = "anniversary_year", nullable = false)
    private Integer anniversaryYear;
    
    @Column(name = "anniversary_date", nullable = false)
    private LocalDate anniversaryDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;
    
    @Column(name = "is_notified", nullable = false)
    private Boolean isNotified = false;
    
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
