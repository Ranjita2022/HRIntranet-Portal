package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.EmergencyContact;
import org.ieee.hrintranet.repository.EmergencyContactRepository;
import org.ieee.hrintranet.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/emergency-contacts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmergencyContactController {
    
    private final EmergencyContactRepository emergencyContactRepository;
    private final AuditService auditService;
    
    @GetMapping
    public ResponseEntity<List<EmergencyContact>> getAllContacts() {
        return ResponseEntity.ok(emergencyContactRepository.findAll());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<EmergencyContact>> getActiveContacts() {
        return ResponseEntity.ok(emergencyContactRepository.findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true));
    }
    
    @GetMapping("/emergency")
    public ResponseEntity<List<EmergencyContact>> getEmergencyContacts() {
        return ResponseEntity.ok(emergencyContactRepository.findByIsEmergencyAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(true, true));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<EmergencyContact>> getContactsByType(@PathVariable EmergencyContact.ContactType type) {
        return ResponseEntity.ok(emergencyContactRepository.findByTypeAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(type, true));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmergencyContact> getContact(@PathVariable Integer id) {
        return emergencyContactRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createContact(@RequestBody EmergencyContact contact, Authentication authentication) {
        try {
            contact.setCreatedBy(authentication.getName());
            EmergencyContact saved = emergencyContactRepository.save(contact);
            auditService.logAction(authentication.getName(), "CREATE", "emergency_contacts", saved.getId(), null, saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateContact(@PathVariable Integer id, @RequestBody EmergencyContact contact, Authentication authentication) {
        return emergencyContactRepository.findById(id)
                .map(existing -> {
                    EmergencyContact oldData = new EmergencyContact();
                    oldData.setId(existing.getId());
                    oldData.setTitle(existing.getTitle());
                    
                    existing.setTitle(contact.getTitle());
                    existing.setContactName(contact.getContactName());
                    existing.setPhoneNumber(contact.getPhoneNumber());
                    existing.setEmail(contact.getEmail());
                    existing.setDescription(contact.getDescription());
                    existing.setType(contact.getType());
                    existing.setDisplayOrder(contact.getDisplayOrder());
                    existing.setIsActive(contact.getIsActive());
                    existing.setIsEmergency(contact.getIsEmergency());
                    
                    EmergencyContact updated = emergencyContactRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "emergency_contacts", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContact(@PathVariable Integer id, Authentication authentication) {
        return emergencyContactRepository.findById(id)
                .map(contact -> {
                    auditService.logAction(authentication.getName(), "DELETE", "emergency_contacts", contact.getId(), contact, null);
                    emergencyContactRepository.delete(contact);
                    return ResponseEntity.ok(Map.of("message", "Emergency contact deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getContactStats() {
        long totalContacts = emergencyContactRepository.countByIsActive(true);
        long emergencyCount = emergencyContactRepository.findByIsEmergencyAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(true, true).size();
        
        return ResponseEntity.ok(Map.of(
            "totalContacts", totalContacts,
            "emergencyContacts", emergencyCount
        ));
    }
}
