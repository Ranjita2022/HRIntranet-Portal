package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.WorkAnniversaryDisplay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for WorkAnniversaryDisplay entity
 * Handles database operations for work anniversary display data
 */
@Repository
public interface WorkAnniversaryDisplayRepository extends JpaRepository<WorkAnniversaryDisplay, Integer> {
    
    /**
     * Find all work anniversary records for a specific employee
     */
    List<WorkAnniversaryDisplay> findByEmployeeId(Integer employeeId);
    
    /**
     * Find work anniversaries by years of experience
     */
    List<WorkAnniversaryDisplay> findByYearsOfExperience(Integer yearsOfExperience);
    
    /**
     * Find all published work anniversaries
     */
    List<WorkAnniversaryDisplay> findByIsPublished(Boolean isPublished);
    
    /**
     * Find work anniversaries within a date range
     */
    List<WorkAnniversaryDisplay> findByAnniversaryDateBetween(LocalDate startDate, LocalDate endDate);
}
