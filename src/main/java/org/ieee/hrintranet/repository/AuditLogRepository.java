package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<AuditLog> findByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT a FROM AuditLog a WHERE a.tableName = :tableName ORDER BY a.createdAt DESC")
    List<AuditLog> findByTableName(@Param("tableName") String tableName);
    
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt >= :fromDate ORDER BY a.createdAt DESC")
    List<AuditLog> findRecentLogs(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT a FROM AuditLog a WHERE a.tableName = :tableName AND a.recordId = :recordId ORDER BY a.createdAt DESC")
    List<AuditLog> findByTableNameAndRecordId(@Param("tableName") String tableName, 
                                               @Param("recordId") Integer recordId);
}
