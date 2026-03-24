package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.QuickLink;
import org.ieee.hrintranet.repository.QuickLinkRepository;
import org.ieee.hrintranet.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/quick-links")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuickLinkController {
    
    private final QuickLinkRepository quickLinkRepository;
    private final AuditService auditService;
    
    @GetMapping
    public ResponseEntity<List<QuickLink>> getAllQuickLinks() {
        return ResponseEntity.ok(quickLinkRepository.findAll());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<QuickLink>> getActiveQuickLinks() {
        return ResponseEntity.ok(quickLinkRepository.findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(true));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<QuickLink>> getQuickLinksByCategory(@PathVariable String category) {
        return ResponseEntity.ok(quickLinkRepository.findByCategoryAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(category, true));
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(quickLinkRepository.findAllActiveCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuickLink> getQuickLink(@PathVariable int id) {
        return quickLinkRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createQuickLink(@RequestBody QuickLink quickLink, Authentication authentication) {
        try {
            quickLink.setCreatedBy(authentication.getName());
            QuickLink saved = quickLinkRepository.save(quickLink);
            auditService.logAction(authentication.getName(), "CREATE", "quick_links", saved.getId(), null, saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuickLink(@PathVariable int id, @RequestBody QuickLink quickLink, Authentication authentication) {
        return quickLinkRepository.findById(id)
                .map(existing -> {
                    QuickLink oldData = new QuickLink();
                    oldData.setId(existing.getId());
                    oldData.setTitle(existing.getTitle());
                    
                    existing.setTitle(quickLink.getTitle());
                    existing.setUrl(quickLink.getUrl());
                    existing.setDescription(quickLink.getDescription());
                    existing.setIcon(quickLink.getIcon());
                    existing.setCategory(quickLink.getCategory());
                    existing.setDisplayOrder(quickLink.getDisplayOrder());
                    existing.setIsActive(quickLink.getIsActive());
                    existing.setOpenInNewTab(quickLink.getOpenInNewTab());
                    
                    QuickLink updated = quickLinkRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "quick_links", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuickLink(@PathVariable int id, Authentication authentication) {
        return quickLinkRepository.findById(id)
                .map(quickLink -> {
                    auditService.logAction(authentication.getName(), "DELETE", "quick_links", quickLink.getId(), quickLink, null);
                    quickLinkRepository.delete(quickLink);
                    return ResponseEntity.ok(Map.of("message", "Quick link deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getQuickLinkStats() {
        long totalLinks = quickLinkRepository.countByIsActive(true);
        List<String> categories = quickLinkRepository.findAllActiveCategories();
        
        return ResponseEntity.ok(Map.of(
            "totalLinks", totalLinks,
            "categories", categories,
            "categoryCount", categories.size()
        ));
    }
}
