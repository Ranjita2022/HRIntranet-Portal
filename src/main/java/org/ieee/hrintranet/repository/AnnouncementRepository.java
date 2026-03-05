package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Integer> {
    
    List<Announcement> findByIsActiveOrderByPriorityDescPublishDateDesc(Boolean isActive);
    
    List<Announcement> findByTypeAndIsActiveOrderByPriorityDescPublishDateDesc(
        Announcement.AnnouncementType type, Boolean isActive);
    
    @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
           "AND a.publishDate <= :currentDate " +
           "AND (a.expiryDate IS NULL OR a.expiryDate >= :currentDate) " +
           "ORDER BY a.priority DESC, a.publishDate DESC")
    List<Announcement> findActiveAnnouncements(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT a FROM Announcement a WHERE a.type = 'BREAKING' " +
           "AND a.isActive = true " +
           "AND a.publishDate <= :currentDate " +
           "AND (a.expiryDate IS NULL OR a.expiryDate >= :currentDate) " +
           "ORDER BY a.priority DESC, a.publishDate DESC")
    List<Announcement> findBreakingNews(@Param("currentDate") LocalDate currentDate);
}
