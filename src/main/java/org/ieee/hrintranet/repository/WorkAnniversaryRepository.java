package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.WorkAnniversary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkAnniversaryRepository extends JpaRepository<WorkAnniversary, Integer> {
    
    /**
     * Find published work anniversaries within a date range
     */
    @Query("SELECT wa FROM WorkAnniversary wa " +
           "WHERE wa.isPublished = true " +
           "AND wa.anniversaryDate BETWEEN :startDate AND :endDate " +
           "ORDER BY wa.anniversaryDate ASC")
    List<WorkAnniversary> findPublishedAnniversaries(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    /**
     * Find upcoming published anniversaries (next 6 months)
     */
    @Query("SELECT wa FROM WorkAnniversary wa " +
           "WHERE wa.isPublished = true " +
           "AND wa.anniversaryDate >= :today " +
           "AND wa.anniversaryDate <= :endDate " +
           "ORDER BY wa.anniversaryDate ASC")
    List<WorkAnniversary> findUpcomingPublishedAnniversaries(
            @Param("today") LocalDate today,
            @Param("endDate") LocalDate endDate);
}
