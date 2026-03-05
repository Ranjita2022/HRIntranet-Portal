package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.model.Shoutout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShoutoutRepository extends JpaRepository<Shoutout, Long> {
    
    List<Shoutout> findByIsApprovedTrueAndIsDisplayedTrueOrderByCreatedAtDesc();
    
    List<Shoutout> findByIsApprovedFalseOrderByCreatedAtDesc();
    
    List<Shoutout> findAllByOrderByCreatedAtDesc();
    
    // Get shoutouts from last 30 days, regardless of approval status
    @Query("SELECT s FROM Shoutout s WHERE s.createdAt >= :startDate ORDER BY s.createdAt DESC")
    List<Shoutout> findRecentShoutouts(@Param("startDate") LocalDateTime startDate);
}
