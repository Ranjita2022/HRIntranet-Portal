package org.ieee.hrintranet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for displaying work anniversaries in the admin panel
 * Represents calculated anniversary data for each employee
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkAnniversaryDisplayDTO {
    
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String position;
    private LocalDate startDate;
    private LocalDate anniversaryDate;
    private Integer yearsOfExperience;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Constructor for creating from calculation data
     */
    public WorkAnniversaryDisplayDTO(Long employeeId, String employeeName, String department, 
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
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
