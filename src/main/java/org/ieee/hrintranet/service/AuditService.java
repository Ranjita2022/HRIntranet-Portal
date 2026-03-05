package org.ieee.hrintranet.service;

import org.ieee.hrintranet.entity.AdminUser;
import org.ieee.hrintranet.entity.AuditLog;
import org.ieee.hrintranet.repository.AdminUserRepository;
import org.ieee.hrintranet.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final AdminUserRepository adminUserRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public void logAction(String username, String action, String tableName, Integer recordId, 
                         Object oldData, Object newData) {
        try {
            AdminUser user = adminUserRepository.findByUsername(username).orElse(null);
            
            AuditLog log = new AuditLog();
            log.setUser(user);
            log.setAction(action);
            log.setTableName(tableName);
            log.setRecordId(recordId);
            log.setIpAddress(getClientIpAddress());
            
            if (oldData != null) {
                log.setOldData(objectMapper.writeValueAsString(oldData));
            }
            if (newData != null) {
                log.setNewData(objectMapper.writeValueAsString(newData));
            }
            
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }
    
    private String getClientIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return "unknown";
    }
}
