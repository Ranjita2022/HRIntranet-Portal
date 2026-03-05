package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Announcement;
import org.ieee.hrintranet.entity.Image;
import org.ieee.hrintranet.repository.AnnouncementRepository;
import org.ieee.hrintranet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnnouncementController {
    
    private final AnnouncementRepository announcementRepository;
    private final FileStorageService fileStorageService;
    private final org.ieee.hrintranet.service.AuditService auditService;
    
    @GetMapping
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAll());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Announcement>> getActiveAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findActiveAnnouncements(LocalDate.now()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncement(@PathVariable Integer id) {
        return announcementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createAnnouncement(@RequestBody Announcement announcement, 
                                               Authentication authentication) {
        try {
            announcement.setCreatedBy(authentication.getName());
            Announcement saved = announcementRepository.save(announcement);
            auditService.logAction(authentication.getName(), "CREATE", "announcements", saved.getId(), null, saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnnouncement(@PathVariable Integer id, 
                                               @RequestBody Announcement announcement,
                                               Authentication authentication) {
        return announcementRepository.findById(id)
                .map(existing -> {
                    Announcement oldData = new Announcement();
                    oldData.setId(existing.getId());
                    oldData.setTitle(existing.getTitle());
                    
                    existing.setType(announcement.getType());
                    existing.setTitle(announcement.getTitle());
                    existing.setDescription(announcement.getDescription());
                    existing.setPublishDate(announcement.getPublishDate());
                    existing.setExpiryDate(announcement.getExpiryDate());
                    existing.setIsActive(announcement.getIsActive());
                    existing.setPriority(announcement.getPriority());
                    if (announcement.getImage() != null) {
                        existing.setImage(announcement.getImage());
                    }
                    Announcement updated = announcementRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "announcements", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Integer id, Authentication authentication) {
        return announcementRepository.findById(id)
                .map(announcement -> {
                    auditService.logAction(authentication.getName(), "DELETE", "announcements", announcement.getId(), announcement, null);
                    announcementRepository.delete(announcement);
                    return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadAnnouncementImage(@PathVariable Integer id,
                                                     @RequestParam("file") MultipartFile file,
                                                     Authentication authentication) {
        try {
            Announcement announcement = announcementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Announcement not found"));
            
            Image image = fileStorageService.storeImage(file, Image.ImageType.ANNOUNCEMENT,
                                                       authentication.getName());
            announcement.setImage(image);
            announcementRepository.save(announcement);
            
            return ResponseEntity.ok(Map.of("message", "Image uploaded successfully", "image", image));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
