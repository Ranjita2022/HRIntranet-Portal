package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.AuditLog;
import org.ieee.hrintranet.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuditLogController {
    
    private final AuditLogRepository auditLogRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<AuditLog>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(auditLogRepository.findByUserId(userId));
    }
    
    @GetMapping("/table/{tableName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByTable(@PathVariable String tableName) {
        return ResponseEntity.ok(auditLogRepository.findByTableName(tableName));
    }
    
    @GetMapping("/record/{tableName}/{recordId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByRecord(
            @PathVariable String tableName,
            @PathVariable Integer recordId) {
        return ResponseEntity.ok(auditLogRepository.findByTableNameAndRecordId(tableName, recordId));
    }
    
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AuditLog>> getRecentAuditLogs(
            @RequestParam(defaultValue = "24") int hours) {
        LocalDateTime fromDate = LocalDateTime.now().minusHours(hours);
        return ResponseEntity.ok(auditLogRepository.findRecentLogs(fromDate));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuditStats() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        
        long totalLogs = auditLogRepository.count();
        long logsLast24Hours = auditLogRepository.findRecentLogs(last24Hours).size();
        long logsLast7Days = auditLogRepository.findRecentLogs(last7Days).size();
        
        Map<String, Object> stats = Map.of(
            "totalLogs", totalLogs,
            "logsLast24Hours", logsLast24Hours,
            "logsLast7Days", logsLast7Days
        );
        
        return ResponseEntity.ok(stats);
    }
}
