package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.OpenPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for OpenPosition entity
 */
@Repository
public interface OpenPositionRepository extends JpaRepository<OpenPosition, Integer> {
    
    /**
     * Find position by requisition ID
     */
    Optional<OpenPosition> findByRequisitionId(String requisitionId);
    
    /**
     * Find all positions by status
     */
    List<OpenPosition> findByStatus(OpenPosition.PositionStatus status);
    
    /**
     * Find all published positions
     */
    List<OpenPosition> findByIsPublished(Boolean isPublished);
    
    /**
     * Find all positions by status and published
     */
    List<OpenPosition> findByStatusAndIsPublished(OpenPosition.PositionStatus status, Boolean isPublished);
    
    /**
     * Find positions posted in specific month
     */
    List<OpenPosition> findByPostingDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find positions posted in specific month and published
     */
    List<OpenPosition> findByPostingDateBetweenAndIsPublished(LocalDate startDate, LocalDate endDate, Boolean isPublished);
}
