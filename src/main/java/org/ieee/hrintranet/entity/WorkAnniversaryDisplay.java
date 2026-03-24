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
 * Work Anniversary Entity - Stores calculated work anniversaries
 * This table contains dynamically calculated anniversary data for employees
 */
@Entity
@Table(name = "work_anniversary_display")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkAnniversaryDisplay {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "employee_id")
    private Integer employeeId;
    
    @Column(name = "employee_name", length = 255)
    private String employeeName;
    
    @Column(name = "department", length = 100)
    private String department;
    
    @Column(name = "position", length = 100)
    private String position;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "anniversary_date")
    private LocalDate anniversaryDate;
    
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;
    
    @Column(name = "is_published")
    private Boolean isPublished = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Constructor for creating from employee data
     */
    public WorkAnniversaryDisplay(Integer employeeId, String employeeName, String department,
                                  String position, LocalDate startDate, LocalDate anniversaryDate,
                                  Integer yearsOfExperience) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.position = position;
        this.startDate = startDate;
        this.anniversaryDate = anniversaryDate;
        this.yearsOfExperience = yearsOfExperience;
        this.isPublished = true;
    }
}
